import React from 'react';
import { BsLock } from 'react-icons/bs';

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BsLock className={className} />
);
