import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  size = "lg",
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white shadow-2xl",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {description ? (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
};
