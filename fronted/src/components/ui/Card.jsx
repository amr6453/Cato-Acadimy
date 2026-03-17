import React from 'react';

const Card = ({
  children,
  glass = false,
  hover = false,
  padding = 'p-8',
  className = '',
}) => {
  return (
    <div
      className={`
        rounded-2xl transition-all duration-300
        ${glass ? 'glass premium-shadow' : 'bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 shadow-sm'}
        ${hover ? 'hover:-translate-y-1 hover:shadow-xl hover:border-slate-200 dark:hover:border-white/10' : ''}
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
