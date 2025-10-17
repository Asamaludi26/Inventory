import React from 'react';
// FIX: Replaced BsArrowTrendingUp with BsGraphUpArrow as it's not a valid member of react-icons/bs.
import { BsGraphUpArrow } from 'react-icons/bs';

export const ArrowTrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BsGraphUpArrow className={className} />
);