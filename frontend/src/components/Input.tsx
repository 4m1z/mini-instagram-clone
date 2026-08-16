import type { ComponentProps } from "react";

type InputVariant = "default" | "file";

type Props = ComponentProps<"input"> & {
  variant?: InputVariant;
};

const baseClassName =
  `w-full rounded-xl border border-slate-200 bg-slate-50/80 text-slate-950 outline-none transition
   placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5
   disabled:cursor-not-allowed disabled:opacity-60 
   aria-[invalid=true]:border-red-500`;

const variantClassNames: Record<InputVariant, string> = {
  default: "px-3.5 py-2.5",
  file: "p-2 text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:font-medium file:text-white file:transition file:hover:bg-slate-700",
};

export function Input({ variant = "default", type = "text", className, ...props }: Props) {
  const classes = [baseClassName, variantClassNames[variant], className].filter(Boolean).join(" ");

  return <input type={type} className={classes} {...props} />;
}
