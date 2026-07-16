import React from 'react';

const COLORS = [
  'from-blue-600 to-blue-400',
  'from-purple-600 to-purple-400',
  'from-green-600 to-green-400',
  'from-rose-600 to-rose-400',
  'from-amber-600 to-amber-400',
  'from-cyan-600 to-cyan-400',
  'from-pink-600 to-pink-400',
  'from-teal-600 to-teal-400',
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

  const colorIndex = hashCode(name || '') % COLORS.length;
  const gradient = COLORS[colorIndex];

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
