import clsx from "clsx";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success";
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        tone === "default" && "bg-canvas text-muted",
        tone === "accent" && "bg-accent/10 text-accent-strong",
        tone === "success" && "bg-success/10 text-success",
      )}
    >
      {children}
    </span>
  );
}
