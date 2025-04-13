import * as React from 'react';
import BlogArchivePanel from './Panels/BlogArchive';
import styles from './page.module.css';

export default function BlogPage() {
  return (
    <div className={styles.blogList}>
      <BlogArchivePanel />
    </div>
  );
}
