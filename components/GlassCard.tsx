import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // FIX: Added optional onClick handler to allow the card to be clickable.
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style, onClick }) => {
  return (
    <div
      className={`bg-slate-50/75 dark:bg-slate-900/60 backdrop-blur-lg border border-white/30 dark:border-slate-700/50 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/50 dark:hover:border-slate-600 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;