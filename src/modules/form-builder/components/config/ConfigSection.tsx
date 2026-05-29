"use client";

import * as React from "react";

export function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
