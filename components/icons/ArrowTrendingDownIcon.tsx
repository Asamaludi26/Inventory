import React from 'react';
// FIX: Replaced BsArrowTrendingDown with BsGraphDownArrow as it's not a valid member of react-icons/bs.
import { BsGraphDownArrow } from 'react-icons/bs';

export const ArrowTrendingDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BsGraphDownArrow className={className} />
);