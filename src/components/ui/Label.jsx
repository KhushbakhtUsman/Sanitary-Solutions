import { cn } from "../../utils/cn";

export const Label = ({ className, ...props }) => (
  <label className={cn("text-sm font-medium text-gray-700", className)} {...props} />
);
