import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts";
import { Icon } from "@blueprintjs/core";

/**
 * A versitile, basic button for use as part of IDS. Built on top of HTML button component for accessibility.
 * @component Button
 * @param {string} [buttonText] - The button text to display, no text is shown if none is provided.
 * @param {BlueprintIcons_16Id} [buttonIcon] - The Blueprint Icon to display, no icon is shown if none is provided.
 * @param {("small"|"medium"|"large")} [size="medium"] - The size of the button.
 * @param {function} [onAction] - The function to be called when the button is clicked, no function is run if none is provided.
 * @param {boolean} [disabled=false] - Determines if the button is disabled.
 * @param {boolean} [outline=true] - Determines if the button has an outline applied
 * @param {("default" | "primary" | "danger")} [color="default"] - The color scheme of the button.
 * @param {("minimal" | "bold")} [style="minimal"] - The style of the button.
 * @returns {JSX.Element} The rendered Button component.
 */

export default function Button({
    buttonText,
    buttonIcon,
    size,
    style,
    onAction,
    color,
    outline,
    disabled,
}: {
    buttonText?: string;
    buttonIcon?: BlueprintIcons_16Id;
    size?: "small" | "medium" | "large";
    style?: "minimal" | "bold";
    onAction?: () => void;
    disabled?: boolean;
    outline?: boolean;
    color?: "default" | "primary" | "danger" | "dark";
}) {
    const outlineProp = outline === undefined ? true : outline;
    const colorProp = color === undefined ? "default" : color;
    const sizeProp = size === undefined ? "medium" : size;
    const disabledProp = disabled === undefined ? false : disabled;
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
            default: {
                outline: "outline outline-gray-400",
                background: "",
                text: "text-gray-400",
                icon: "#F6F7F9",
                hover: "hover:bg-slate-400/20",
            },
            primary: {
                outline: "outline outline-primary-400",
                background: "",
                text: "text-primary-400",
                icon: "#6cc0a6",
                hover: "hover:bg-primary-400/10",
            },
            danger: {
                outline: "outline outline-red-400",
                background: "",
                text: "text-red-400",
                icon: "#f1616f",
                hover: "hover:bg-red-400/10",
            },
            dark: {
                outline: "outline outline-dark-400",
                background: "",
                text: "text-dark-200",
                icon: "#383E47",
                hover: "hover:bg-slate-400/20",
            },
            disabled: {
                outline: "",
                background: "bg-gray-200/20",
                text: "text-gray-200",
                icon: "#DCE0E5",
                hover: "",
            },
        },
        bold: {
            default: {
                outline: "",
                background: "bg-gray-400",
                text: "text-dark-400",
                icon: "#383E47",
                hover: "hover:bg-gray-400/80",
            },
            primary: {
                outline: "",
                background: "bg-primary-400",
                text: "text-dark-400",
                icon: "#383E47",
                hover: "hover:bg-primary-400/80",
            },
            danger: {
                outline: "",
                background: "bg-red-400",
                text: "text-dark-400",
                icon: "#383E47",
                hover: "hover:bg-red-400/80",
            },
            dark: {
                outline: "",
                background: "bg-dark-400",
                text: "text-slate-200",
                icon: "#383E47",
                hover: "hover:bg-dark-400/60",
            },
            disabled: {
                outline: "",
                background: "bg-gray-200/20",
                text: "text-gray-200",
                icon: "#DCE0E5",
                hover: "",
            },
        },
    };

    return (
        <>
            {!disabledProp ? (
                <div
                    onClick={onAction}
                    className={` flex flex-row cursor-pointer rounded items-center
                        ${sizeSystem[sizeProp]["padding"]}
                        ${colorSystem[styleProp][colorProp]["background"]}
                        ${sizeSystem[sizeProp]["gap"]}
                        ${colorSystem[styleProp][colorProp]["hover"]}
                        ${outlineProp ? `${colorSystem[styleProp][colorProp]["outline"]}` : ""}`}
                >
                    {buttonIcon && (
                        <Icon
                            icon={buttonIcon}
                            size={sizeSystem[sizeProp]["icon"]}
                            color={`${colorSystem[styleProp][colorProp]["icon"]}`}
                        />
                    )}
                    {buttonText && (
                        <p
                            className={`leading-none ${sizeSystem[sizeProp]["text"]} ${colorSystem[styleProp][colorProp]["text"]}`}
                        >
                            {" "}
                            {buttonText}{" "}
                        </p>
                    )}
                </div>
            ) : (
                <div
                    onClick={onAction}
                    className={` flex flex-row px-3 py-2 rounded items-center cursor-not-allowed
                        ${colorSystem[styleProp]["disabled"]["background"]}
                        ${sizeSystem[sizeProp]["gap"]}
                        ${colorSystem[styleProp]["disabled"]["hover"]}
                        ${outlineProp ? `${colorSystem[styleProp]["disabled"]["outline"]}` : ""}`}
                >
                    {buttonIcon && (
                        <Icon
                            icon={buttonIcon}
                            size={sizeSystem[sizeProp]["icon"]}
                            color={`${colorSystem[styleProp]["disabled"]["icon"]}`}
                        />
                    )}
                    {buttonText && (
                        <p
                            className={`leading-none ${sizeSystem[sizeProp]["text"]} ${colorSystem[styleProp]["disabled"]["text"]}`}
                        >
                            {" "}
                            {buttonText}{" "}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
