import React from "react";
import { X } from "lucide-react";

const DialogClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={`absolute top-4 right-4 inline-flex items-center justify-center rounded-md bg-transparent p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
    {...props}
  >
    <span className="sr-only">Close</span>
    <X className="h-6 w-6" aria-hidden="true" />
  </button>
));
DialogClose.displayName = "DialogClose";

export default DialogClose;
