import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
        variant === "primary" &&
          "bg-ink text-surface hover:bg-accent",
        variant === "secondary" &&
          "border border-line bg-canvas/70 text-ink hover:border-accent hover:bg-surface",
        variant === "danger" &&
          "border border-accent/25 bg-accent/10 text-accent-strong hover:bg-accent/15",
        className,
      )}
      {...props}
    />
  );
}
