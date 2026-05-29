import clsx from "clsx";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
