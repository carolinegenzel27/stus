"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useEffect } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5",
        size === "lg" && "px-6 py-3 text-lg",
        variant === "primary" &&
          "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-300/50 hover:shadow-lg hover:brightness-110",
        variant === "secondary" && "bg-white text-violet-700 border border-violet-200 hover:bg-violet-50",
        variant === "ghost" && "text-slate-600 hover:bg-violet-100/60",
        variant === "danger" && "bg-rose-500 text-white hover:bg-rose-600",
        className,
      )}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-violet-200 bg-white px-4 py-2.5 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-200",
        className,
      )}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-xl border border-violet-200 bg-white px-4 py-2.5 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-200 resize-y",
        className,
      )}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm font-semibold text-slate-700">{children}</div>;
}

/** A pill toggle used for single- and multi-choice options. */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-xl border-2 px-4 py-2 text-sm font-medium transition cursor-pointer",
        active
          ? "border-violet-500 bg-violet-500 text-white shadow-md shadow-violet-200"
          : "border-violet-100 bg-white text-slate-700 hover:border-violet-300",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={clsx(
              "relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl",
              wide ? "sm:max-w-3xl" : "sm:max-w-lg",
            )}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 end-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            {title && <h2 className="mb-5 pe-8 text-xl font-bold text-slate-800">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent",
        className,
      )}
    />
  );
}
