import { cn } from "../../utils/cn";

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("border-b border-gray-100 px-6 py-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-base font-semibold text-gray-900", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("px-6 py-4", className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn("border-t border-gray-100 px-6 py-4", className)} {...props} />
);
