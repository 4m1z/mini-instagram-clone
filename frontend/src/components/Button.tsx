import type { ComponentProps } from "react";

type ButtonVariant = "plain" | "primary" | "danger";

type Props = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

const baseClassName = `inline-flex items-center justify-center transition 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 
  focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`;

const variantClassNames: Record<ButtonVariant, string> = {
  plain: "",
  primary: "rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-700",
  danger: "rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700",
};

export function Button({ variant = "plain", type = "button", className, ...props }: Props) {
  const classes = [baseClassName, variantClassNames[variant], className].filter(Boolean).join(" ");

  return <button type={type} className={classes} {...props} />;
}
