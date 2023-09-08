import React from "react";
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16";
import { Icon } from "../Icon/Icon";

/**
 * A versitile, basic button for use as part of IDS. Built on top of HTML button component for accessibility.
 * @component Button
 * @param {string} [text] - The button text to display, no text is shown if none is provided.
 * @param {BlueprintIcons_16Id} [icon] - The Blueprint Icon to display, no icon is shown if none is provided.
 * @param {("base" | "primary" | "secondary" | "accent")} [color="base"] - The color scheme of the button.
 * @param {("small"|"medium"|"large")} [size="medium"] - The size of the button.
 * @param {("minimal" | "bold")} [style="minimal"] - The style of the button.
 * @param {function} [onAction] - The function to be called when the button is clicked, no function is run if none is provided.
 * @param {boolean} [outline=true] - Determines if the button has an outline applied
 * @returns {JSX.Element} The rendered Button component.
 */

export function Button({
  text,
  icon,
  size,
  style,
  onAction,
  color,
  outline,
}: {
  text?: string;
  icon?: BlueprintIcons_16Id;
  size?: "small" | "medium" | "large";
  style?: "minimal" | "bold";
  onAction?: () => void;
  outline?: boolean;
  color?: "base" | "primary" | "secondary" | "accent";
}) {
  // Set Defaults
  const outlineProp = outline === undefined ? false : outline;
  const colorProp = color === undefined ? "base" : color;
  const sizeProp = size === undefined ? "medium" : size;
  const styleProp = style === undefined ? "minimal" : style;

  const sizeSystem = {
    small: {
      icon: 12,
      text: "font-medium text-sm",
      gap: "gap-1",
      padding: "px-1.5 py-1",
    },
    medium: {
      icon: 16,
      text: "font-medium text-base",
      gap: "gap-2",
      padding: "px-2.5 py-2",
    },
    large: {
      icon: 20,
      text: "font-medium text-lg",
      gap: "gap-3",
      padding: "px-3 py-2.5",
    },
  };

  const colorSystem = {
    minimal: {
      base: {
        outline: "outline outline-base-content",
        background: "",
        text: "text-base-content",
        icon: "base",
        hover: "hover:bg-slate-400/20",
      },
      primary: {
        outline: "outline outline-primary",
        background: "",
        text: "text-primary",
        icon: "primary",
        hover: "hover:bg-primary/20",
      },
      secondary: {
        outline: "outline outline-secondary",
        background: "",
        text: "text-secondary",
        icon: "secondary",
        hover: "hover:bg-secondary/20",
      },
      accent: {
        outline: "outline outline-accent",
        background: "",
        text: "text-accent",
        icon: "accent",
        hover: "hover:bg-accent/20",
      },
    },
    bold: {
      base: {
        outline: "",
        background: "bg-base-content",
        text: "text-base-100",
        icon: "base-inverse",
        hover: "hover:bg-base-content/80",
      },
      primary: {
        outline: "",
        background: "bg-primary",
        text: "text-primary-content",
        icon: "primary-inverse",
        hover: "hover:bg-primary/80",
      },
      secondary: {
        outline: "",
        background: "bg-secondary",
        text: "text-secondary-content",
        icon: "secondary-inverse",
        hover: "hover:bg-secondary/80",
      },
      accent: {
        outline: "",
        background: "bg-accent",
        text: "text-accent-content",
        icon: "accent-inverse",
        hover: "hover:bg-accent/80",
      },
    },
  };

  return (
    <>
      <button
        onClick={onAction}
        className={` rounded-md ${colorSystem[styleProp][colorProp].background}
        ${outlineProp ? colorSystem[styleProp][colorProp].outline : ""} ${
          sizeSystem[sizeProp].padding
        } ${colorSystem[styleProp][colorProp].hover}`}
      >
        <div
          className={` flex flex-row items-center ${sizeSystem[sizeProp].gap} `}
        >
          {icon && (
            <Icon
              icon={icon}
              size={sizeSystem[sizeProp].icon}
              color={colorSystem[styleProp][colorProp].icon as "base"}
            />
          )}
          {text && (
            <p
              className={` ${colorSystem[styleProp][colorProp].text} ${sizeSystem[sizeProp].text} `}
            >
              {text}
            </p>
          )}
        </div>
      </button>
    </>
  );
}
