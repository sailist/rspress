import * as React from 'react';
import styles from './style.module.css';

interface FriendLink {
  name: string;
  url: string;
  avatar?: string;
  description?: string;
}

const friendLinks: FriendLink[] = [
  {
    name: '示例博客',
    url: 'https://example.com',
    description: '一个示例博客',
  },
  // 可以在这里添加更多友链
];

export default function BlogFriendLinksPanel() {
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>友情链接</h3>
      <div className={styles.panelContent}>
        <div className={styles.friendLinksList}>
          {friendLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.friendLinkItem}
            >
              {link.avatar && (
                <img
                  src={link.avatar}
                  alt={`${link.name} 头像`}
                  className={styles.friendLinkAvatar}
                />
              )}
              <div className={styles.friendLinkInfo}>
                <div className={styles.friendLinkName}>{link.name}</div>
                {link.description && (
                  <div className={styles.friendLinkDesc}>
                    {link.description}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
