import React, { useRef, useEffect, useState } from "react";

export default function Page({
    children,
    header,
}: {
    children: React.ReactNode | React.ReactNode[];
    header?: React.ReactNode;
}) {
    const headerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState("24px");

    useEffect(() => {
        if (header && headerRef.current) {
            const height = headerRef.current.getBoundingClientRect().height;
            setHeaderHeight(`${height + 24}px`);
        }
    }, [header]);

    const bodyStyle: React.CSSProperties = {
        paddingTop: `${headerHeight}`,
    };

    return (
        <div className="h-full">
            {header && (
                <div ref={headerRef} className=" w-full mx-auto bg-dark-200 absolute">
                    <div className=" w-10/12 h-full pt-5 mx-auto ">{header}</div>
                </div>
            )}
            <div style={bodyStyle} className="w-10/12 mx-auto h-full">
                {children}
            </div>
        </div>
    );
}
