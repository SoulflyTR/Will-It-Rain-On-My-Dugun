import React from 'react';

const SnowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 64 64" 
        className={className} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3"
    >
        <path d="M41.5 20.5A12.5 12.5 0 0019 20.5a12.53 12.53 0 00-2.5.3A10.5 10.5 0 006 31.3a10.43 10.43 0 0010.5 10.2H45a9.5 9.5 0 00.5-19A9.42 9.42 0 0041.5 20.5z" />
        <path d="M28 47l-1.41 1.41" />
        <path d="M28 53l1.41-1.41" />
        <path d="M25.17 50.17H28" />
        <path d="M30.83 50.17H32" />
        <path d="M36 47l-1.41 1.41" />
        <path d="M36 53l1.41-1.41" />
        <path d="M33.17 50.17H36" />
        <path d="M38.83 50.17H40" />
    </svg>
);

export default SnowIcon;
