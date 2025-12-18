import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = ({ label, active, className = '', ...props }) => {
  return (
    <button
      className={`
        px-5 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ease-out
        border border-transparent
        ${active 
          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]' 
          : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/10'
        }
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5
        ${className}
      `}
      {...props}
    >
      {label}
    </button>
  );
};