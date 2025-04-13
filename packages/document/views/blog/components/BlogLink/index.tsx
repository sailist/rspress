import Tags from '@/components/Tags';
import * as React from 'react';
import styles from './styles.module.css';
interface BlogLinkProps {
  href: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
}

export default function BlogLink({
  href,
  title,
  description,
  date,
  tags,
}: BlogLinkProps) {
  return (
    <a href={href} className={styles.blogLink}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.meta}>
        {date && <span className={styles.date}>{date}</span>}
        <div className={styles.arrow}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
