import * as React from 'react';
import './navitem.css';

export default function NavItem({
  text,
  link,
  activeMatch,
  icon,
  title,
  description,
}: {
  text: string;
  link: string;
  activeMatch: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a href={link} className="card-container">
      <div className="card-icon">
        <img src={icon} alt={title} />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </a>
  );
}
