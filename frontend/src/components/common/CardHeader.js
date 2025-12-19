// CardHeader.js
import React from 'react';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export default CardHeader;
