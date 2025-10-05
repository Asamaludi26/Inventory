import React from 'react';

export const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25" />
  </svg>
);
