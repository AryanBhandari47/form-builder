import * as React from "react";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

export function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm
        transition-colors duration-100 font-medium
        ${
          active
            ? "bg-primary-light text-primary"
            : "text-text-secondary hover:bg-border hover:text-text-primary"
        }
      `}
    >
      {children}
    </Link>
  );
}
