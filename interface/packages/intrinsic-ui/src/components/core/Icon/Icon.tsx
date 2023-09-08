import React from "react";
import daiseyUiColors from "daisyui/src/theming/themes";

import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16";
import { Icon as BPIcon } from "@blueprintjs/core";

export function Icon({
  icon,
  color,
  size,
}: {
  icon: BlueprintIcons_16Id;
  color:
    | "base"
    | "base-inverse"
    | "primary"
    | "primary-inverse"
    | "secondary"
    | "secondary-inverse"
    | "accent"
    | "accent-inverse";
  size: number;
}) {
  let selectedColor;

  switch (color) {
    case "base":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["base-content"];
      break;
    case "base-inverse":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["base-100"];
      break;
    case "primary":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["primary"];
      break;
    case "primary-inverse":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["primary-content"];
      break;
    case "secondary":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["secondary"];
      break;
    case "secondary-inverse":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["secondary-content"];
      break;
    case "accent":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["accent"];
      break;
    case "accent-inverse":
      selectedColor = daiseyUiColors["[data-theme=dark]"]["accent-content"];
      break;
  }
  return <BPIcon icon={icon} color={selectedColor} size={size} />;
}
