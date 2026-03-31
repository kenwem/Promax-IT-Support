import React from 'react';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  darkText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showSlogan = false, darkText = true }) => {
  const textColor = darkText ? '#0f2756' : '#ffffff';
  const greenColor = '#0f9648';
  const darkBlueColor = '#0f2756';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-3">
        {/* Shield Icon */}
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          {/* Dark Blue Shield Part */}
          <path d="M10 20 C 30 15, 70 15, 90 20 C 90 20, 85 45, 70 60 C 50 75, 10 50, 10 20 Z" fill={darkBlueColor} />
          {/* Green Shield Part */}
          <path d="M10 50 C 15 65, 50 90, 50 90 C 50 90, 85 70, 90 45 C 90 45, 85 55, 70 60 C 50 75, 10 50, 10 50 Z" fill={greenColor} />
          
          {/* Circuit Board Lines */}
          <path d="M 15 40 L 35 40 L 45 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="45" cy="30" r="3" fill="white" />
          
          <path d="M 20 50 L 30 50 L 45 40 L 55 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="55" cy="40" r="3" fill="white" />
          
          <path d="M 25 60 L 35 50 L 45 50" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="45" cy="50" r="3" fill="white" />
        </svg>

        {/* Text Part */}
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="font-bold text-4xl tracking-tight" style={{ color: textColor }}>ProMa</span>
            <span className="font-bold text-4xl tracking-tight" style={{ color: greenColor }}>x</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[2px] w-8 flex-grow" style={{ backgroundColor: textColor }}></div>
            <span className="text-sm font-bold tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: textColor }}>IT SUPPORT</span>
            <div className="h-[2px] w-8 flex-grow" style={{ backgroundColor: textColor }}></div>
          </div>
        </div>
      </div>
      
      {/* Slogan */}
      {showSlogan && (
        <div className="mt-2 text-center w-full">
          <span className="italic font-medium text-lg" style={{ color: greenColor }}>
            Ready to Help — Anytime IT Matters.
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
