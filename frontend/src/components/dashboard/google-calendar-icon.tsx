import React from 'react';
import clsx from 'clsx';

type IconProps = {
  className?: string;
};

export const GoogleCalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
    viewBox="0 0 48 48"
    fill="none"
  >
    <rect width="48" height="48" rx="4" fill="#4285F4" />
    <rect x="8" y="12" width="32" height="28" rx="2" fill="#FFFFFF" />
    <rect x="8" y="8" width="32" height="8" fill="#F4B400" />
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="20"
      fill="#34A853"
    >
      31
    </text>
  </svg>
);
