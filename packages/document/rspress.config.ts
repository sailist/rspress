import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

import { loadEnv, mergeRsbuildConfig } from '@rsbuild/core';
// views
import { blogViewPlugin } from './views/blog';

const { parsed, publicVars } = loadEnv();

if (!parsed.BLOG_ROOT) {
  throw new Error(
    'BLOG_ROOT is not set, please set it in .env.local or .env file',
  );
}

export default defineConfig({
  root: parsed.BLOG_ROOT,
  title: parsed.BLOG_TITLE,
  // icon: '/rspress-icon.png',
  // logo: {
  //   light: '/rspress-light-logo.png',
  //   dark: '/rspress-dark-logo.png',
  // },
  builderConfig: {
    resolve: {
      alias: {
        '@/views': './views',
        '@/components': './components',
      },
    },
  },
  markdown: {
    // Use js version compiler to support plugins
    mdxRs: true,
    remarkPlugins: [
      // Add custom remark plugin
    ],
    rehypePlugins: [
      // Add custom rehype plugin
    ],
    globalComponents: [
      // Register global components for MDX
    ],
  },
  plugins: [blogViewPlugin()],
  logoText: parsed.BLOG_LOGO_TEXT,
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rspress',
      },
    ],
  },
  route: {
    exclude: [
      'custom.tsx',
      'globalComponents/**/*',
      // 'views/**/*',
      'components/**/*',
    ],
  },
  globalUIComponents: [path.join(__dirname, 'globalComponents', 'demo.tsx')],
});
