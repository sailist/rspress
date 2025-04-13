import * as React from 'react';
import BlogLink from '../../components/BlogLink';
import styles from './BlogRecent/styles.module.css';

interface BlogPost {
  id: string;
  routePath: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

interface RecentPostsListProps {
  posts: BlogPost[];
}

// 格式化日期为 YYYY.MM.DD 格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function RecentPostsList({ posts }: RecentPostsListProps) {
  // 获取最近的10篇文章
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className={styles.recentPostsContainer}>
      <h2 className={styles.sectionTitle}>最近文章</h2>
      <div className={styles.recentPosts}>
        {recentPosts.map(post => (
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
  );
}
