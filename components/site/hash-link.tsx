"use client";

import type { ComponentProps } from "react";
import { scrollToSection } from "@/lib/site/scroll";

type HashLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: `#${string}`;
};

export function HashLink({ href, onClick, children, ...props }: HashLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        scrollToSection(href);
        history.pushState(null, "", href);
      }}
    >
      {children}
    </a>
  );
}
