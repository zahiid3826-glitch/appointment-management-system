import React from "react";

const DialogHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between pb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
));
DialogHeader.displayName = "DialogHeader";

export default DialogHeader;
