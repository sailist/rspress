import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  type PageData,
  type UserConfig,
  isDebugMode,
  normalizeSlash,
  withBase,
} from '@rspress/shared';
import { logger } from '@rspress/shared/logger';
import picocolors from 'picocolors';
import { default as ReactHelmetAsync } from 'react-helmet-async';
import { version } from '../../package.json';
import { PluginDriver } from './PluginDriver';
import {
  APP_HTML_MARKER,
  BODY_START_TAG,
  HEAD_MARKER,
  HTML_START_TAG,
  META_GENERATOR,
  OUTPUT_DIR,
  TEMP_DIR,
} from './constants';
import { initRsbuild } from './initRsbuild';
import { hintSSGFailed, hintSSGFalse } from './logger/hint';
import type { Route } from './route/RouteService';
import { routeService } from './route/init';
import { writeSearchIndex } from './searchIndex';
import { checkLanguageParity } from './utils/checkLanguageParity';
import { renderConfigHead, renderFrontmatterHead } from './utils/renderHead';

interface BuildOptions {
  appDirectory: string;
  docDirectory: string;
  config: UserConfig;
}

export async function bundle(
  docDirectory: string,
  config: UserConfig,
  pluginDriver: PluginDriver,
  enableSSG: boolean,
) {
  try {
    // if enableSSG, build both client and server bundle
    // else only build client bundle
    const rsbuild = await initRsbuild(
      docDirectory,
      config,
      pluginDriver,
      enableSSG,
    );

    await rsbuild.build();
  } finally {
    await writeSearchIndex(config);
    await checkLanguageParity(config);
  }
}

function emptyDir(path: string): Promise<void> {
  return fs.rm(path, { force: true, recursive: true });
}

export interface SSRBundleExports {
  render: (
    url: string,
    helmetContext: object,
  ) => Promise<{ appHtml: string; pageData: PageData }>;
  routes: Route[];
}

export async function renderPages(
  appDirectory: string,
  config: UserConfig,
  pluginDriver: PluginDriver,
) {
  logger.info('Rendering pages...');
  const startTime = Date.now();
  const outputPath = config?.outDir ?? join(appDirectory, OUTPUT_DIR);
  const ssrBundlePath = join(outputPath, 'ssr', 'main.cjs');

  let render: SSRBundleExports['render'];
  try {
    const { default: ssrExports } = await import(
      pathToFileURL(ssrBundlePath).toString()
    );
    ({ render } = ssrExports as SSRBundleExports);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(
        `Failed to load SSG bundle: ${picocolors.yellow(ssrBundlePath)}: ${e.message}`,
      );
      hintSSGFailed();
    }
    throw e;
  }

  try {
    const routes = routeService!.getRoutes();
    const base = config?.base ?? '';

    // Get the html generated by builder, as the default ssr template
    const htmlTemplatePath = join(outputPath, 'index.html');
    const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf-8');
    const additionalRoutes = (await pluginDriver.addSSGRoutes()).map(route => ({
      routePath: withBase(route.path, base),
    }));
    const allRoutes = [...routes, ...additionalRoutes];
    const is404RouteInRoutes = allRoutes.some(
      route => route.routePath === '/404',
    );
    if (!is404RouteInRoutes) {
      allRoutes.push({
        routePath: '/404',
      });
    }
    await Promise.all(
      allRoutes
        .filter(route => {
          // filter the route including dynamic params
          return !route.routePath.includes(':');
        })
        .map(async route => {
          const helmetContext = new ReactHelmetAsync.HelmetData({});
          const { routePath } = route;
          let appHtml = '';
          if (render) {
            try {
              ({ appHtml } = await render(routePath, helmetContext.context));
            } catch (e) {
              logger.error(
                `Page "${picocolors.yellow(routePath)}" SSG rendering failed.`,
              );
              throw e;
            }
          }

          const { helmet } = helmetContext.context;
          let html = htmlTemplate
            // During ssr, we already have the title in react-helmet
            .replace(/<title>(.*?)<\/title>/gi, '')
            // Don't use `string` as second param
            // To avoid some special characters transformed to the marker, such as `$&`, etc.
            .replace(APP_HTML_MARKER, () => appHtml)
            .replace(
              META_GENERATOR,
              () => `<meta name="generator" content="Rspress v${version}">`,
            )
            .replace(
              HEAD_MARKER,
              [
                await renderConfigHead(config, route),
                helmet.title.toString(),
                helmet.meta.toString(),
                helmet.link.toString(),
                helmet.style.toString(),
                helmet.script.toString(),
                await renderFrontmatterHead(route),
              ].join(''),
            );
          if (helmet.htmlAttributes) {
            html = html.replace(
              HTML_START_TAG,
              `${HTML_START_TAG} ${helmet.htmlAttributes?.toString()}`,
            );
          }

          if (helmet.bodyAttributes) {
            html = html.replace(
              BODY_START_TAG,
              `${BODY_START_TAG} ${helmet.bodyAttributes?.toString()}`,
            );
          }

          const normalizeHtmlFilePath = (path: string) => {
            const normalizedBase = normalizeSlash(config?.base || '/');

            if (path.endsWith('/')) {
              return `${path}index.html`.replace(normalizedBase, '');
            }

            return `${path}.html`.replace(normalizedBase, '');
          };
          const fileName = normalizeHtmlFilePath(routePath);
          await fs.mkdir(join(outputPath, dirname(fileName)), {
            recursive: true,
          });
          await fs.writeFile(join(outputPath, fileName), html);
        }),
    );
    // Remove ssr bundle
    if (!isDebugMode()) {
      await emptyDir(join(outputPath, 'ssr'));
    }
    await emptyDir(join(outputPath, 'html'));

    const totalTime = Date.now() - startTime;
    logger.success(`Pages rendered in ${picocolors.yellow(totalTime)} ms.`);
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error(`Pages render error: ${e.message}`);
      hintSSGFailed();
    }
    throw e;
  }
}

export async function build(options: BuildOptions) {
  const { docDirectory, appDirectory, config } = options;
  const pluginDriver = new PluginDriver(config, true);
  await pluginDriver.init();
  const modifiedConfig = await pluginDriver.modifyConfig();

  await pluginDriver.beforeBuild();
  const ssgConfig = modifiedConfig.ssg ?? true;

  // empty temp dir before build
  await emptyDir(TEMP_DIR);

  await bundle(docDirectory, modifiedConfig, pluginDriver, Boolean(ssgConfig));

  if (ssgConfig) {
    await renderPages(appDirectory, modifiedConfig, pluginDriver);
  } else {
    hintSSGFalse();
  }

  await pluginDriver.afterBuild();
}
