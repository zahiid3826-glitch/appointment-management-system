// CardTitle.js
import React from 'react';

export const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export default CardTitle;
