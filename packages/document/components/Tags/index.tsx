import * as React from 'react';
import styles from './tags.module.css';

export default function Tags({ tags }: { tags?: string[] | string }) {
  if (!tags || tags.length === 0) {
    return null;
  }
  if (typeof tags === 'string') {
    tags = [tags];
  }

  return (
    // <div className={styles.tagsContainer}>

    // </div>
    <>
      {tags.map(tag => (
        <span key={tag} className={styles.tag}>
          # {tag}
        </span>
      ))}
    </>
  );
}
