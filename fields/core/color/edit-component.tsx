"use client";

import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import ColorButton from "./color-button/color-button";
import "./edit-component.css"

const EditComponent = forwardRef((props: any, ref: React.Ref<HTMLInputElement>) => {

    const { value, onChange } = props;

    return (
        <span className="rounded-lg border border-input px-2 py-2 color-field">
            <ColorButton className="color-button" onChange={onChange} value={value ?? ""} />
            <Input {...props} type="text" className="text-base" onChange={onChange} value={value} />
        </span>
    );
});

export { EditComponent };