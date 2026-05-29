import clsx from "clsx";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "min-h-28 w-full rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
