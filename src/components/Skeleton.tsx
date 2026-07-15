import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '20px', borderRadius = '8px', style }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-card) 0px, var(--border-card) 50%, var(--bg-card) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s infinite linear',
        ...style
      }}
    />
  );
};

export default Skeleton;
