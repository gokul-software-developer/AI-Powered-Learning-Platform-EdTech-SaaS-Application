import React from 'react';
import clsx from 'clsx';

type IconProps = {
  className?: string;
};

export const NotionIcon: React.FC<IconProps> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(className)}
      viewBox="0 0 48 48"
      fill="none"
    >
      <rect width="48" height="48" rx="6" fill="#FFFFFF" stroke="#000000" />
      <path
        d="M16 12H32C33.1046 12 34 12.8954 34 14V34C34 35.1046 33.1046 36 32 36H16C14.8954 36 14 35.1046 14 34V14C14 12.8954 14.8954 12 16 12Z"
        fill="#FFFFFF"
        stroke="#000000"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fill="#000000"
      >
        N
      </text>
    </svg>
  );
  