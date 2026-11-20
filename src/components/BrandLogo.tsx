import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const accentColor = variant === 'light' ? 'text-sky-400' : 'text-sky-600';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} shrink-0`}
        aria-hidden="true"
      >
        {/* Shield silhouette */}
        <path
          d="M20 3L6 8.5V19.2C6 27.9 11.9 35.8 20 38C28.1 35.8 34 27.9 34 19.2V8.5L20 3Z"
          fill="#0B192C"
          stroke="#38BDF8"
          strokeWidth="2"
        />
        {/* Career briefcase top handle accent */}
        <path
          d="M15.5 13.5V12C15.5 11.17 16.17 10.5 17 10.5H23C23.83 10.5 24.5 11.17 24.5 12V13.5"
          stroke="#7DD3FC"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Briefcase / document frame */}
        <rect
          x="12"
          y="13.5"
          width="16"
          height="12.5"
          rx="2.5"
          fill="#0F294A"
          stroke="#38BDF8"
          strokeWidth="1.6"
        />
        {/* Verification checkmark */}
        <path
          d="M16 19.8L18.8 22.5L24.5 16.8"
          stroke="#38BDF8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display text-lg font-bold tracking-tight ${textColor}`}
      >
        TrustHire <span className={accentColor}>AI</span>
      </span>
    </span>
  );
};
