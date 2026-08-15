import type { ComponentProps } from "react";

type InputVariant = "default" | "file";

type Props = ComponentProps<"input"> & {
  variant?: InputVariant;
};

const baseClassName =
  `rounded-lg border border-slate-300 text-slate-900 outline-none transition 
   focus:border-slate-900 focus:ring-1 focus:ring-slate-900 
   disabled:cursor-not-allowed disabled:opacity-60 
   aria-[invalid=true]:border-red-500`;

const variantClassNames: Record<InputVariant, string> = {
  default: "px-3 py-2",
  file: "p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white",
};

export function Input({ variant = "default", type = "text", className, ...props }: Props) {
  const classes = [baseClassName, variantClassNames[variant], className].filter(Boolean).join(" ");

  return <input type={type} className={classes} {...props} />;
}
