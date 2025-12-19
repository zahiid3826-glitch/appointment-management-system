import React from "react";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg ${className}`}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

export default DialogContent;
