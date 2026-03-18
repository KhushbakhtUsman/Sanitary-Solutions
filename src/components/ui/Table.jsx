import { cn } from "../../utils/cn";

export const Table = ({ className, ...props }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full text-left text-sm", className)} {...props} />
  </div>
);

export const THead = ({ className, ...props }) => (
  <thead className={cn("bg-gray-50 text-xs uppercase tracking-wide text-gray-500", className)} {...props} />
);

export const TBody = ({ className, ...props }) => (
  <tbody className={cn("divide-y divide-gray-100", className)} {...props} />
);

export const Th = ({ className, ...props }) => (
  <th className={cn("px-4 py-3 font-semibold", className)} {...props} />
);

export const Td = ({ className, ...props }) => (
  <td className={cn("px-4 py-3 text-gray-700", className)} {...props} />
);
