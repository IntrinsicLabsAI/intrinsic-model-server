import React from "react";

/**
 * A versitile, basic Section for use in page layouts.
 * @component Section
 * @param {string} [title] - The title of the section, this is rendered in the header. No header is shown if a title is not provided.
 * @param {React.ReactNode} [header] - Content to display to the right of the title in the header.
 * @param {React.ReactNode} [children] - Context to display within the section (p-3 applied internally).
 * @returns {JSX.Element} The rendered Section component.
 */

export function Section({
  title,
  header,
  children,
}: {
  title?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full outline outline-2 outline-base-content/60 rounded-md divide-base-content/60 divide-y-2 mb-5">
      {title && (
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
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}
