import { cn } from "../../utils/cn";

const baseClasses = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50";

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  outline: "border border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:text-blue-700",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = ({
  type = "button",
  variant = "primary",
  size = "md",
  className,
  ...props
}) => (
  <button
    type={type}
    className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    {...props}
  />
);
