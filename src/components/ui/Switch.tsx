import React from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ isSelected, onChange, className, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={() => !disabled && onChange(!isSelected)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isSelected
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-neutral-600 hover:bg-neutral-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out",
          isSelected ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};

export { Switch };