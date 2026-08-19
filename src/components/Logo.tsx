import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSizes = {
    sm: 'h-10 sm:h-12 w-auto max-w-[140px]',
    md: 'h-14 sm:h-16 md:h-18 w-auto max-w-[200px]',
    lg: 'h-18 sm:h-22 md:h-24 w-auto max-w-[260px]',
    xl: 'h-24 sm:h-28 md:h-32 w-auto max-w-[340px]',
  };

  const fallbackSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-22 h-22',
    xl: 'w-30 h-30',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imageError ? (
        <img
          src="https://universitytree.in/image/logo.webp"
          alt="University Tree"
          className={`${imageSizes[size]} object-contain drop-shadow-xs transition-transform hover:scale-[1.02]`}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${fallbackSizes[size]} rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 p-2 shadow-sm border border-emerald-500/30 flex items-center justify-center`}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            <path
              d="M8 36V14C8 12.8954 8.89543 12 10 12C16 12 21 15 24 18C27 15 32 12 38 12C39.1046 12 40 12.8954 40 14V36C40 37.1046 39.1046 38 38 38C32 38 27 35 24 33C21 35 16 38 10 38C8.89543 38 8 37.1046 8 36Z"
              fill="#FFFFFF"
              stroke="#15803D"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="24" y1="18" x2="24" y2="33" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="9" r="4" fill="#F39A18" />
            <path
              d="M24 5C24 5 19 8 19 12C19 13.5 21 14.5 24 14.5C27 14.5 29 13.5 29 12C29 8 24 5 24 5Z"
              fill="#16A34A"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

