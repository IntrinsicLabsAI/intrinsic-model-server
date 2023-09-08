import React from "react";

/**
 * A versitile, basic Section for use in page layouts.
 * @component Section
 * @param {React.ReactNode} [header] - The header to display, no header is shown if none is provided.
 * @param {React.ReactNode | React.ReactNode[]} [children] - The children to display, no children are shown if none are provided.
 * @param {string} [title] - The title of the section, this is rendered in the header.
 * @returns {JSX.Element} The rendered Section component.
 */

export function Section({
  header,
  children,
  title,
}: {
  header?: React.ReactNode;
  children?: React.ReactNode | React.ReactNode[];
  title: string;
}) {
  return (
    <div className="flex flex-col w-full outline outline-2 outline-base-content/60 rounded-md divide-base-content/60 divide-y-2 mb-5">
      <div className="flex flex-row w-full items-center p-3 gap-2 bg-neutral">
        <div>
          <p className=" text-neutral-content font-semibold ">{title}</p>
        </div>
        {header ? (
          <div className="ml-auto"> {header} </div>
        ) : (
          <React.Fragment />
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
