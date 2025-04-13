import fs from 'node:fs';
import path from 'node:path';
import type {
  AdditionalPage,
  NavItem,
  RspressPlugin,
  SidebarItem,
  UserConfig,
} from '@rspress/shared';
import matter from 'gray-matter';

interface Book {
  baseRoot: string;
  navText: string;
  baseRoute: string;
}

const books: Book[] = [
  {
    baseRoot:
      '/Users/yanghaozhe/Documents/note-all-in-one/1100-创作输出/1102-博客/0003-系统知识/1000-计算机科学与技术/C++/C++标准库',
    navText: 'C++标准库',
    baseRoute: '/book/cppstd',
  },
];
function addBook(config: UserConfig, { baseRoot, navText, baseRoute }: Book) {
  if (!config.route) {
    config.route = {};
  }
  if (!config.route.include) {
    config.route.include = [];
  }
  if (!config.themeConfig) {
    config.themeConfig = {};
  }
  if (!config.themeConfig.sidebar) {
    config.themeConfig.sidebar = {};
  }
  if (!config.themeConfig.nav) {
    config.themeConfig.nav = [];
  }

  // config include for scanning
  const include = config.route.include;
  include.push(baseRoot);
  config.route = {
    ...config.route,
    include,
  };

  // config navvar (on top)
  const nav = config.themeConfig.nav;
  if (Array.isArray(nav)) {
    nav.push({
      text: navText,
      link: baseRoute,
      activeMatch: baseRoute,
    });
  } else {
    nav.default.push({
      text: navText,
      link: baseRoute,
      activeMatch: baseRoute,
    });
  }

  // config sidebar for book page
  const sidebarVal: SidebarItem[] = [];

  for (const file of fs.readdirSync(baseRoot)) {
    const filePath = path.join(baseRoot, file);
    if (fs.statSync(filePath).isFile()) {
      const baseName = file.split('.')[0];
      if (baseName.startsWith('index')) {
        sidebarVal.push({
          text: navText,
          link: `${baseRoute}/`,
        });
      } else {
        sidebarVal.push({
          text: baseName,
          link: `${baseRoute}/${baseName}`,
        });
      }
    }
  }
  sidebarVal.push({
    text: 'a',
    link: '/book/b',
  });
  config.themeConfig.sidebar[baseRoute] = sidebarVal;
}

export function bookViewPlugin(): RspressPlugin {
  return {
    name: 'book-view',
    // 使用 extendPageData 钩子为主页添加博客文章数据
    addPages(config, isProd) {
      const ret: AdditionalPage[] = [];
      // for (const book of books) {
      //   ret.push({
      //     filepath: book.absolutePath,
      //     routePath: book.link,
      //   });
      // }
      return ret;
    },
    routeGenerated(routes, isProd) {
      // console.log(rootPath);
      // // debugger
      // for (const book of books) {
      //   for (const route of routes) {
      //     if (route.absolutePath?.startsWith(book.baseRoot)) {
      //       const relativePath = path.relative(
      //         book.baseRoot,
      //         route.absolutePath,
      //       );
      //       const baseName = relativePath.split('.')[0];
      //       if (baseName.startsWith('index')) {
      //         route.routePath = `${book.baseRoute}`;
      //       } else {
      //         route.routePath = `${book.baseRoute}/${baseName}`;
      //       }
      //       // 确保路径格式正确
      //       // if (route.absolutePath.includes("index.md")) {
      //       //   debugger
      //       // }
      //       console.log(route.routePath, route.pageName);
      //     }
      //   }
      // }
    },
    extendPageData(pageData) {},
    async beforeBuild(config, isProd) {
      const divedeSidebar = {};
      for (const item of config.themeConfig?.sidebar['/0003-系统知识'] || []) {
        divedeSidebar[item.link] = [item];
        // if (item.link.endsWith("index")){
        //   continue;
        // }
        // divedeSidebar[item.link] = [item.items];
      }
      for (const key of Object.keys(config.themeConfig?.sidebar || {})) {
        if (key !== '/0003-系统知识') {
          divedeSidebar[key] = config.themeConfig?.sidebar[key];
        }
      }

      config.themeConfig = {
        ...config.themeConfig,
        sidebar: divedeSidebar,
      };
      // remove the origin sidebar item
      // config.themeConfig?.sidebar["0003-系统知识"] = [];

      // for (const book of books) {
      //   addBook(config, book);
      // }

      // return config;
      // Do something here
    },
    // Hook to execute after build
    async afterBuild(config, isProd) {
      // Do something here
    },
  };
}
