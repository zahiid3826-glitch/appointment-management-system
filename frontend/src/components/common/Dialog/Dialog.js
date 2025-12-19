import React from "react";

const Dialog = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 sm:px-6 ${className}`}
    {...props}
  >
    {children}
  </div>
));
Dialog.displayName = "Dialog";

export default Dialog;
