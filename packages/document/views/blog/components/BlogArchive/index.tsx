import BlogLink from '@/blog/components/BlogLink';
import * as React from 'react';
import { usePageData } from 'rspress/runtime';
import styles from './style.module.css';

interface BlogPost {
  id: string;
  routePath: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

interface PageData {
  page: {
    blogPosts?: BlogPost[];
  };
}

// 格式化日期为 YYYY.MM.DD 格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 按年份对博客文章进行分组
const groupPostsByYear = (posts: BlogPost[]) => {
  const groupedPosts: Record<string, BlogPost[]> = {};

  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString();
    if (!groupedPosts[year]) {
      groupedPosts[year] = [];
    }
    groupedPosts[year].push(post);
  }

  // 按年份降序排序
  return Object.keys(groupedPosts)
    .sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
    .map(year => ({
      year,
      posts: groupedPosts[year].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }));
};

export default function BlogArchivePanel() {
  const pageData = usePageData() as PageData;
  if (!pageData.page.blogPosts) {
    return null;
  }

  const groupedPosts = groupPostsByYear(pageData.page.blogPosts);

  return (
    <div className={styles.blogList}>
      {groupedPosts.map(({ year, posts }) => (
        <div key={year} className={styles.yearSection}>
          <h2 className={styles.yearTitle}>
            {year} ({posts.length})
          </h2>
          <div>
            {posts.map((post: BlogPost) => (
              <div key={post.id} className={styles.blogItem}>
                <BlogLink
                  href={post.routePath}
                  title={post.title}
                  description={post.description || ''}
                  date={formatDate(post.date)}
                  tags={post.tags}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
