import BlogCategoryPanel from '@/blog/components/BlogCategory';
import BlogFriendLinksPanel from '@/blog/components/BlogFriendLinks';
import BlogRecentPanel from '@/blog/components/BlogRecent';
import * as React from 'react';
import { usePageData } from 'rspress/runtime';
import styles from './style.module.css';

export default function BlogHome() {
  return (
    <div className={styles.blogHomeContainer}>
      <div className={styles.mainContent}>
        <BlogRecentPanel />
      </div>
      <div className={styles.sidebar}>
        <BlogCategoryPanel />
        <BlogFriendLinksPanel />
      </div>
    </div>
  );
}
