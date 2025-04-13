import fs from 'node:fs';
import path from 'node:path';
import type {
  NavItem,
  RspressPlugin,
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarSectionHeader,
} from '@rspress/shared';
import matter from 'gray-matter';

// 博客文章信息接口
interface BlogPost {
  title: string;
  date: Date;
  routePath: string;
  year: string;
  month: string;
  day: string;
  fullPath: string;
  id: string; // 用于唯一标识，避免使用索引作为 key
  tags?: string[] | string;
}

const blogPosts: BlogPost[] = [];

const docsRoot = path.join(path.dirname(path.dirname(__dirname)), '/docs');

// 将文件路径转换为博客文章结构
function generateBlogPost(
  filePathWoExt: string,
  navLink: string,
  link: string,
): BlogPost | null {
  // 尝试不同的文件后缀
  const possibleExtensions = ['.md', '.mdx'];
  let fullPath: string | null = null;
  let actualExtension: string | null = null;

  for (const ext of possibleExtensions) {
    const testPath = filePathWoExt + ext;
    if (fs.existsSync(testPath)) {
      fullPath = testPath;
      actualExtension = ext;
      break;
    }
  }

  if (!fullPath || !actualExtension) {
    console.warn(`未找到文件: ${filePathWoExt}.[md|mdx]`);
    return null;
  }

  // 从文件名中提取日期信息
  const fileName = path.basename(filePathWoExt); // 使用不带后缀的文件名
  const dateMatch = fileName.match(/(\d{4}).(\d{2}).(\d{2})/);
  if (!dateMatch) {
    // console.warn(`文件 ${fullPath} 没有日期信息`);
    return null;
  }
  const [, year, month, day] = dateMatch;

  // 从文件名中提取标题
  let title = fileName
    .replace(/^\d{4}.(\d{2}).(\d{2})./, '')
    .replace(/\.md$/, '')
    .replace(/\.mdx$/, '');
  let tags: string[] = [];

  // 读取文件内容并解析 frontmatter
  try {
    const fileData = matter.read(fullPath);
    if (fileData.data.title) {
      title = fileData.data.title;
    }
    if (fileData.data.tags) {
      tags = Array.isArray(fileData.data.tags)
        ? fileData.data.tags
        : [fileData.data.tags];
    }
  } catch (error) {
    console.warn(`无法读取文件 ${fullPath} 的 frontmatter: ${error}`);
  }

  // 构建路由路径
  // const relativePath = path.relative(path.dirname(navLink), filePathWoExt);
  // let routePath = path.join(navLink, relativePath);
  // // 确保路径以 / 开头并统一使用正斜杠
  // if (!routePath.startsWith('/')) {
  //   routePath = `/${routePath}`;
  // }
  // routePath = routePath.replace(/\\/g, '/');

  return {
    title,
    date: new Date(`${year}-${month}-${day}`),
    routePath: link,
    year,
    month,
    day,
    fullPath,
    id: `${year}${month}${day}-${title}`,
    tags,
  };
}

export function blogViewPlugin(): RspressPlugin {
  return {
    name: 'blog-view',
    // 使用 extendPageData 钩子为主页添加博客文章数据
    addPages(config, isProd) {
      return [
        {
          routePath: '/blogarchive',
          content: '',
        },
        {
          content: '',
          routePath: '/',
        },
        ...blogPosts.map(post => ({
          filepath: post.fullPath,
          routePath: post.routePath,
        })),
      ];
    },
    extendPageData(pageData, isProd) {
      if (pageData.routePath === '/blogarchive' || pageData.routePath === '/') {
        // @ts-ignore
        pageData.blogPosts = blogPosts;
      }
    },

    async beforeBuild(config, isProd) {
      // 1. 读取 config.root + "rspress.json"
      const configPath = path.join(config.root || '', 'rspress.json');
      let blogConfig;

      try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(configContent);
        blogConfig = parsedConfig.blog;
      } catch (error) {
        console.warn('无法读取 rspress.json 或解析 blog 配置:', error);
      }

      // 2. 获取 "blog" 字段
      if (blogConfig) {
        const {
          nav: blogNav,
          title: blogTitle,
          description: blogDescription,
        } = blogConfig;

        if (!blogNav) {
          console.warn('未找到博客导航配置');
          return;
        }

        // 3. 从 config.themeConfig.sidebar 中获取和 blog.nav 相同的字段
        const sidebar = (config.themeConfig?.sidebar || {}) as Sidebar;

        // 4. 将匹配的侧边栏项添加到 blogPosts
        const items = sidebar[blogNav] || [];
        const newPosts: BlogPost[] = [];

        // 递归处理侧边栏项
        function processSidebarItems(
          items: (
            | string
            | SidebarGroup
            | SidebarItem
            | SidebarDivider
            | SidebarSectionHeader
          )[],
          parentPath: string = '',
        ) {
          for (const item of items) {
            // 跳过非对象类型的项
            if (typeof item !== 'object' || item === null) {
              continue;
            }

            // 如果是 SidebarItem 且有 link 属性
            if ('link' in item && typeof item.link === 'string') {
              const filePath = path.join(config.root || '', item.link);
              const post = generateBlogPost(filePath, blogNav, item.link);
              if (post) {
                newPosts.push(post);
              }
            }

            // 如果有子项，递归处理
            if ('items' in item && Array.isArray(item.items)) {
              processSidebarItems(item.items, item.link || parentPath);
            }
          }
        }

        // 开始处理侧边栏项
        processSidebarItems(items);

        // 按日期排序并添加到 blogPosts
        newPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
        blogPosts.push(...newPosts);
      }

      // 配置构建选项
      const nav = config.themeConfig?.nav || [];
      config.builderConfig = {
        ...config.builderConfig,
        resolve: {
          ...config.builderConfig?.resolve,
          alias: {
            ...config.builderConfig?.resolve?.alias,
            '@/blog': __dirname,
          },
        },
      };

      // 添加归档页面到导航
      if (Array.isArray(nav)) {
        nav.push({
          text: '归档',
          link: '/blogarchive',
        });
      } else {
        nav.default.push({
          text: '归档',
          link: '/blogarchive',
        });
      }

      config.themeConfig = {
        ...config.themeConfig,
        nav,
      };
    },
    // Hook to execute after build
    async afterBuild(config, isProd) {
      // Do something here
    },
  };
}
