import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, className, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export type NicheIconId =
  | "restaurants"
  | "clinics"
  | "fitness"
  | "ecommerce"
  | "beauty"
  | "home"
  | "premium"
  | "chart";

export function NicheIcon({
  id,
  size = 20,
  className,
}: {
  id: NicheIconId;
  size?: number;
  className?: string;
}) {
  switch (id) {
    case "restaurants":
      return (
        <Svg size={size} className={className}>
          <path d="M4 3v7a3 3 0 0 0 3 3" />
          <path d="M7 3v18" />
          <path d="M11 3v4a4 4 0 0 1 4 4v13" />
        </Svg>
      );
    case "clinics":
      return (
        <Svg size={size} className={className}>
          <path d="M12 8v8" />
          <path d="M8 12h8" />
          <rect x="3" y="3" width="18" height="18" rx="4" />
        </Svg>
      );
    case "fitness":
      return (
        <Svg size={size} className={className}>
          <path d="M6.5 12h11" />
          <path d="M4 9v6" />
          <path d="M20 9v6" />
          <path d="M8 10v4" />
          <path d="M16 10v4" />
        </Svg>
      );
    case "ecommerce":
      return (
        <Svg size={size} className={className}>
          <path d="M6 7h12l-1 12H7L6 7z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </Svg>
      );
    case "beauty":
      return (
        <Svg size={size} className={className}>
          <path d="M12 4l1.1 3.6L17 8.9l-3.9 1.1L12 13.6 9.9 10 6 8.9l3.9-1.3L12 4z" />
          <path d="M5 18l2-2" />
          <path d="M19 18l-2-2" />
        </Svg>
      );
    case "home":
      return (
        <Svg size={size} className={className}>
          <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
        </Svg>
      );
    case "premium":
      return (
        <Svg size={size} className={className}>
          <path d="M12 3l2.2 4.5L19 8.5l-3.5 3.4.8 4.9L12 14.8 7.7 16.8l.8-4.9L5 8.5l4.8-.9L12 3z" />
        </Svg>
      );
    case "chart":
      return (
        <Svg size={size} className={className}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20V8" />
        </Svg>
      );
  }
}

export function NicheCheckIcon({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}
