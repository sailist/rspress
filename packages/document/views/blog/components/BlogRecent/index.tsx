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

export default function BlogRecentPanel() {
  const pageData = usePageData() as PageData;

  if (!pageData.page.blogPosts || pageData.page.blogPosts.length === 0) {
    return null;
  }

  // 只获取最近10篇文章
  const recentPosts = pageData.page.blogPosts.slice(0, 10);

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>最近文章</h3>
      <div className={styles.panelContent}>
        {recentPosts.map(post => (
          <div key={post.id} className={styles.blogItem}>
            <BlogLink
              href={post.routePath}
              title={post.title}
              date={formatDate(post.date)}
              tags={post.tags}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
