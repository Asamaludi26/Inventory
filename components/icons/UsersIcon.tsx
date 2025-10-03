import React from 'react';

export const UsersIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a3.001 3.001 0 015.288 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6a3 3 0 11-6 0 3 3 0 016 0zM2 12a3 3 0 116 0 3 3 0 01-6 0z" />
  </svg>
);
