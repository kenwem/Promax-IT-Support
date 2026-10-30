import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { formatImageUrl } from '../utils/imageUtils';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  darkText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showSlogan = false, darkText = true }) => {
  const { content } = useContent();
  const [imgError, setImgError] = useState(false);
  const textColor = darkText ? '#0f2756' : '#ffffff';
  const greenColor = '#0f9648';
  const darkBlueColor = '#0f2756';

  const logoSrc = formatImageUrl(content?.logoUrl);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-3">
        {logoSrc && !imgError ? (
          <div className="flex items-center">
            <img 
              src={logoSrc} 
              alt="ProMax IT Support" 
              onError={() => setImgError(true)} 
              className={`h-10 sm:h-12 md:h-13 w-auto max-w-[200px] object-contain shrink-0 rounded-lg ${
                !darkText ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]' : 'drop-shadow-sm'
              }`} 
            />
          </div>
        ) : (
          /* Shield Icon */
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
            {/* Dark Blue Shield Part */}
            <path d="M10 20 C 30 15, 70 15, 90 20 C 90 20, 85 45, 70 60 C 50 75, 10 50, 10 20 Z" fill={darkText ? darkBlueColor : '#ffffff'} />
            {/* Green Shield Part */}
            <path d="M10 50 C 15 65, 50 90, 50 90 C 50 90, 85 70, 90 45 C 90 45, 85 55, 70 60 C 50 75, 10 50, 10 50 Z" fill={greenColor} />
            
            {/* Circuit Board Lines */}
            <path d="M 15 40 L 35 40 L 45 30" stroke={darkText ? "white" : "#0f2756"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="45" cy="30" r="3" fill={darkText ? "white" : "#0f2756"} />
            
            <path d="M 20 50 L 30 50 L 45 40 L 55 40" stroke={darkText ? "white" : "#0f2756"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="55" cy="40" r="3" fill={darkText ? "white" : "#0f2756"} />
            
            <path d="M 25 60 L 35 50 L 45 50" stroke={darkText ? "white" : "#0f2756"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="45" cy="50" r="3" fill={darkText ? "white" : "#0f2756"} />
          </svg>
        )}

        {/* Text Part */}
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none" style={{ color: textColor }}>Pro</span>
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none" style={{ color: greenColor }}>Max</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-[2px] w-4 sm:w-6 flex-grow" style={{ backgroundColor: textColor }}></div>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase whitespace-nowrap" style={{ color: textColor }}>IT SUPPORT</span>
            <div className="h-[2px] w-4 sm:w-6 flex-grow" style={{ backgroundColor: textColor }}></div>
          </div>
        </div>
      </div>
      
      {/* Slogan */}
      {showSlogan && (
        <div className="mt-2 text-center w-full">
          <span className="italic font-medium text-sm sm:text-base text-brand-green">
            Ready to Help — Anytime IT Matters.
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
