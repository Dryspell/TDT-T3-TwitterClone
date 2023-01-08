import React from "react";

export const Container = ({
  children,
  classNames = "",
}: {
  children: React.ReactNode;
  classNames?: string;
}) => {
  return <div className={`m-auto max-w-xl bg-slate-600 ${classNames}`}>{children}</div>;
};
