import clsx from "clsx";

type BrandLogoProps = {
  className?: string;
  variant?: "default" | "compact";
};

const variantStyles = {
  default: {
    mark: "size-12",
    text: "text-2xl",
  },
  compact: {
    mark: "size-9",
    text: "text-sm",
  },
};

export function BrandLogo({
  className,
  variant = "default",
}: BrandLogoProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="img"
      aria-label="Continuum"
      className={clsx("flex items-center gap-3", className)}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 48 48"
        className={clsx(styles.mark, "shrink-0")}
      >
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="15"
          className="fill-surface stroke-line"
          strokeWidth="2"
        />
        <path
          d="M31.5 13.8a13.2 13.2 0 1 0 0 20.4"
          className="fill-none stroke-accent"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M16.8 24h14.4"
          className="fill-none stroke-ink"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="15.8" cy="24" r="4.2" className="fill-success" />
        <circle cx="32.2" cy="24" r="4.2" className="fill-accent" />
      </svg>
      <span
        aria-hidden="true"
        className={clsx(
          "font-semibold leading-none tracking-normal text-ink",
          styles.text,
        )}
      >
        Continuum
      </span>
    </div>
  );
}
