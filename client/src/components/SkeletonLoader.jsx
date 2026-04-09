import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 animate-pulse">
      <div className="h-36 bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-9 bg-gray-200 rounded-full" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse flex gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

function SkeletonLoader({ count = 6, variant = 'card' }) {
  const Component = variant === 'list' ? SkeletonListItem : SkeletonCard;
  return (
    <div className={`grid gap-6 ${variant === 'card' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
