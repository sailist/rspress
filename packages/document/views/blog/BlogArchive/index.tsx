import BlogArchivePanel from '@/blog/components/BlogArchive';
import * as React from 'react';
import styles from './style.module.css';

export default function BlogArchive() {
  return (
    <div className={styles.blogArchiveContainer}>
      <BlogArchivePanel />
    </div>
  );
}
