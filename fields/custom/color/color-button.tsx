import React, { useEffect, useState } from 'react'
import { ChromePicker, ColorResult, RGBColor } from 'react-color'
import _StringToColor, { rgb2hex, rgba2hexa } from 'string-color-converter';
import { cn } from '@/lib/utils';

import "./color-button.css"

const rgbaToHexString = (rgba: RGBColor) => {
    // return rgba2hexa(rgba.r, rgba.g, rgba.b, rgba.a ?? 1)
    if (rgba.a == 1) {
        return rgb2hex(rgba.r, rgba.g, rgba.b)
    } else {
        return rgba2hexa(rgba.r, rgba.g, rgba.b, rgba.a ?? 1)
    }
}

const StringToColor = (colorString: string, defaultRgb = { r: 255, g: 255, b: 255, a: 1 }): RGBColor => {

    const color = _StringToColor(colorString);

    // This is necessary to force the picker to use rgba.
    // Otherwise it still finds .hex and loses alpha.
    return color.isValid ? {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
    } : defaultRgb;
}

function ColorButton(props: {
    value: string,
    ref: React.Ref<HTMLInputElement>,
    className?: string,
    onChange: (colorString: string) => void
}) {

    const [showPicker, setShowPicker] = useState(false);
    const [colorRgba, setColorRgba] = useState(StringToColor(props.value));

    const togglePicker = () => setShowPicker(!showPicker);
    const closePicker = () => setShowPicker(false);

    const handleChange = (newColor: ColorResult) => {
        var newString = rgbaToHexString(newColor.rgb);
        setColorRgba(newColor.rgb);
        props.onChange(newString);
    };

    useEffect(() => {
        var newColor = StringToColor(props.value);
        setColorRgba(newColor);
    }, [props.value]);

    return (
        <div className={cn('color-button', props.className)}  >

            <div
                className={cn("swatch ", (showPicker ? "picking" : ""))}
                onClick={togglePicker}
                style={{ backgroundColor: `${rgbaToHexString(colorRgba)}` }}
            />

            {showPicker ?
                <div className='popover'>
                    <div className="cover" onClick={closePicker} />
                    <ChromePicker color={colorRgba} onChange={handleChange} />
                </div> : null}

        </div>
    )

}

export default ColorButton