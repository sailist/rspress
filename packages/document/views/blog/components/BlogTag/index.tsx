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

// 获取所有标签并计数
const getAllTags = (posts: BlogPost[]) => {
  const tagsCount: Record<string, number> = {};

  for (const post of posts) {
    if (post.tags && post.tags.length > 0) {
      for (const tag of post.tags) {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      }
    }
  }

  // 按计数降序排序
  return Object.entries(tagsCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
};

export default function BlogTagPanel() {
  const pageData = usePageData() as PageData;

  if (!pageData.page.blogPosts || pageData.page.blogPosts.length === 0) {
    return null;
  }

  const allTags = getAllTags(pageData.page.blogPosts);

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>标签</h3>
      <div className={styles.panelContent}>
        <div className={styles.tagsCloud}>
          {allTags.map(({ tag, count }) => (
            <div key={tag} className={styles.tagItem}>
              <span className={styles.tagName}>#{tag}</span>
              <span className={styles.tagCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
