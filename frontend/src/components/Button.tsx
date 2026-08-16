import type { ComponentProps } from "react";

type ButtonVariant = "plain" | "primary" | "danger";

type Props = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

const baseClassName = `inline-flex items-center justify-center transition-all
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 
  focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100`;

const variantClassNames: Record<ButtonVariant, string> = {
  plain: "",
  primary: "rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800",
  danger: "rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700",
};

export function Button({ variant = "plain", type = "button", className, ...props }: Props) {
  const classes = [baseClassName, variantClassNames[variant], className].filter(Boolean).join(" ");

  return <button type={type} className={classes} {...props} />;
}
