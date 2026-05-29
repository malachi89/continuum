import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
