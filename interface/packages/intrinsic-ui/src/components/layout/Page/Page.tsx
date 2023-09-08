import React, { Children } from "react";

export function Page({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return <div>{children}</div>;
}
