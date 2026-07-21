import React from 'react';

const BG_COLORS = [
  '#FF385C', '#E81C4A', '#C4103C', '#FF6B7C', '#FF9EA8',
  '#222222', '#717171', '#555555',
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const Avatar = ({ name, size = 'md', className = '' }) => {
  const initials = (name || '??')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = BG_COLORS[hashCode(name || '') % BG_COLORS.length];

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
