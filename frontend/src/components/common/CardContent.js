import React from 'react';
export const CardContent = ({ className = "", children, ...props }) => {
    return (
      <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
      </div>
    );
  };
  export default  CardContent;