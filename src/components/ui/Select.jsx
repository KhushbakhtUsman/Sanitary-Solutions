import { cn } from "../../utils/cn";

export const Select = ({ className, children, ...props }) => (
  <select
    className={cn(
      "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      className
    )}
    {...props}
  >
    {children}
  </select>
);
