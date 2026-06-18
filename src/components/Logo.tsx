import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 
        Hollow Blue House Frame with the left roof notch.
        Using evenodd fill rule to render the hollow interior.
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 82 H82 V42 L50 15 L24 37 L27 40 L22 42 L18 42 V82 Z M26 74 H74 V42 L50 24 L26 42 V74 Z"
        fill="#1e3a8a"
      />

      {/* Dark blue circle under the roof */}
      <circle cx="50" cy="35" r="5.5" fill="#1e3a8a" />

      {/* Orange door at the bottom center, resting on the bottom beam */}
      <rect x="44" y="54" width="12" height="20" rx="1" fill="#ff7020" />
    </svg>
  );
};

export default Logo;
