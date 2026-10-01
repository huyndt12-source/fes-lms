import React from 'react';

interface FesLogoProps {
  variant?: 'full' | 'mark' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  height?: number;
  textColor?: string;
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
}

export const FesLogo: React.FC<FesLogoProps> = ({
  variant = 'full',
  size = 'md',
  height,
  textColor,
  className = '',
  showSubtitle = false,
  subtitleText = 'CFA Prep Portal',
  onClick,
}) => {
  // Preset sizes (height in px)
  const sizeMap = {
    xs: { h: 22, textH: 14 },
    sm: { h: 28, textH: 18 },
    md: { h: 36, textH: 22 },
    lg: { h: 44, textH: 28 },
    xl: { h: 56, textH: 36 },
  };

  const actualHeight = height || sizeMap[size].h;

  // The official emblem vector mark
  const renderEmblem = () => (
    <svg
      viewBox="0 0 92 126"
      style={{ height: `${actualHeight}px`, width: 'auto' }}
      className="flex-shrink-0 drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FES Academy Mark"
    >
      {/* Top Ribbon: Deep Teal */}
      <path
        d="M 4 44
           L 4 20
           C 4 8, 12 0, 26 0
           L 88 32
           L 88 70
           L 4 44 Z"
        fill="#007284"
      />

      {/* Middle Ribbon: Golden Yellow */}
      <path
        d="M 25 74
           L 25 61
           C 25 54, 29 50, 39 54
           L 88 77
           L 88 98
           L 25 74 Z"
        fill="#f0ad25"
      />

      {/* Bottom Ribbon: Warm Tangerine Orange */}
      <path
        d="M 46 104
         L 46 93
         C 46 87, 50 84, 58 88
         L 88 102
         L 88 122
         L 46 104 Z"
        fill="#eb7526"
      />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div
        className={`inline-flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {renderEmblem()}
      </div>
    );
  }

  // Color logic for wordmark
  const defaultTextColor = textColor || '#044b63';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {renderEmblem()}

      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-headline font-black tracking-tight"
          style={{
            color: defaultTextColor,
            fontSize: `${Math.round(actualHeight * 0.58)}px`,
            lineHeight: 0.92,
          }}
        >
          FES
        </span>
        <span
          className="font-headline font-extrabold uppercase"
          style={{
            color: defaultTextColor,
            fontSize: `${Math.max(8, Math.round(actualHeight * 0.22))}px`,
            letterSpacing: '0.22em',
            marginTop: `${Math.max(1, Math.round(actualHeight * 0.06))}px`,
            lineHeight: 1,
          }}
        >
          ACADEMY
        </span>
        {showSubtitle && (
          <span className="text-[9px] uppercase tracking-widest font-semibold text-secondary mt-0.5">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
