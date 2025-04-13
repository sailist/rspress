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

// 从标签中提取分类
const getCategoriesFromTags = (posts: BlogPost[]) => {
  const categoriesCount: Record<string, number> = {};

  for (const post of posts) {
    if (post.tags && post.tags.length > 0) {
      // 假设第一个标签是分类
      const category = post.tags[0];
      categoriesCount[category] = (categoriesCount[category] || 0) + 1;
    }
  }

  // 按计数降序排序
  return Object.entries(categoriesCount)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));
};

export default function BlogCategoryPanel() {
  const pageData = usePageData() as PageData;

  if (!pageData.page.blogPosts || pageData.page.blogPosts.length === 0) {
    return null;
  }

  const categories = getCategoriesFromTags(pageData.page.blogPosts);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>分类</h3>
      <div className={styles.panelContent}>
        <div className={styles.categoryList}>
          {categories.map(({ category, count }) => (
            <div key={category} className={styles.categoryItem}>
              <span className={styles.categoryName}>{category}</span>
              <span className={styles.categoryCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
