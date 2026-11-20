import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from '../../types';

export function Button({ children, variant = 'primary', icon, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'soft' | 'ghost' | 'light';
  icon?: IconName;
}) {
  return <button type="button" className={`button button-${variant} ${className}`} {...props}>
    {icon && <Icon name={icon} size={18} />}
    {children}
  </button>;
}
export function ButtonLink({ children, to, variant = 'primary', icon, className = '' }: {
  children: ReactNode;
  to: string;
  variant?: 'primary' | 'soft' | 'ghost' | 'light';
  icon?: IconName;
  className?: string;
}) {
  return <Link to={to} className={`button button-${variant} ${className}`}>
    {icon && <Icon name={icon} size={18} />}
    {children}
  </Link>;
}
export function Badge({ children, color = 'blue' }: {
  children: ReactNode;
  color?: string;
}) {
  return <span className={`badge tint-${color}`}>
    {children}
  </span>;
}
export function ProgressBar({ value, label }: {
  value: number;
  label: string;
}) {
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <span style={{ width: `${value}%` }} />
  </div>;
}
export function PageHeading({ eyebrow, title, description, action }: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return <div className="page-heading">
    <div>
      <p className="eyebrow">
        {eyebrow}
      </p>
      <h1>
        {title}
      </h1>
      <p className="page-description">
        {description}
      </p>
    </div>
    {action}
  </div>;
}
export function EmptyState({ title, description, action }: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return <div className="empty-state panel">
    <span className="icon-tile tint-blue">
      <Icon name="search" size={26} />
    </span>
    <h2>
      {title}
    </h2>
    <p>
      {description}
    </p>
    {action}
  </div>;
}
