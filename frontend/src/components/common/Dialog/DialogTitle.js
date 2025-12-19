import React from "react";

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-medium leading-6 text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
));
DialogTitle.displayName = "DialogTitle";

export default DialogTitle;
