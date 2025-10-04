import React from 'react';

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 64 64" 
        className={className} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3"
    >
        <circle cx="32" cy="32" r="12" />
        <path d="M32 14V6" />
        <path d="M32 58v-8" />
        <path d="M19.9 19.9l-5.6-5.6" />
        <path d="M49.7 49.7l-5.6-5.6" />
        <path d="M14 32H6" />
        <path d="M58 32h-8" />
        <path d="M19.9 44.1l-5.6 5.6" />
        <path d="M49.7 14.3l-5.6 5.6" />
    </svg>
);

export default SunIcon;
