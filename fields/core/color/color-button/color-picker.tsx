import React, { CSSProperties } from 'react'

import { HSLColor, RGBColor } from 'react-color'
import { ColorWrap, Saturation, Hue, Alpha, Checkboard } from 'react-color/lib/components/common'

import "./color-button.css"

export const PointerCircle = () => {
    const styles = {
        picker: {
            width: '20px',
            height: '20px',
            borderRadius: '10px',
            boxShadow: 'inset 0 0 0 3px #fff',
            transform: 'translate(-10px, -10px)',
        },
    };

    return (
        <div style={styles.picker} />
    )
}

export const Pointer = () => {
    const styles = {
        picker: {
            width: '20px',
            height: '20px',
            borderRadius: '10px',
            transform: 'translate(-10px, -6px)',
            backgroundColor: 'rgb(248, 248, 248)',
            boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)',
        },
    }


    return (
        <div style={styles.picker} />
    )
}
export const Chrome = (props: { rgb: RGBColor, hsl: HSLColor, hsv: any, hex: string, onChange: any, className?: string, renderers: any }) => {

    const { rgb, hsl, hsv, hex, onChange, className, renderers } = props;

    const styles = {
        picker: {
            width: 55,
            background: '#fff',
            borderRadius: '2px',
            boxShadow: '0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3)',
            boxSizing: 'initial',
            fontFamily: 'Menlo',
        },
        body: {
            padding: '16px 16px 12px',
        },
        controls: {
            display: 'flex',
        },
        slider: {
            height: '10px',
            position: 'relative',
            borderRadius: "10px"
        },
    }

    return (
        <div className={`color-picker border z-5 border-input ${className}`}>
            <div className='saturation' >
                <Saturation
                    pointer={PointerCircle}
                    hsl={hsl}
                    hsv={hsv}
                    onChange={onChange}
                />
            </div>
            <div style={styles.body}>
                <div className="flexbox-fix">
                    <div style={styles.toggles}>
                        <div className='mb-4' style={styles.slider}>
                            <Hue
                                style={{
                                    overflow: "hidden",
                                    borderRadius: "10px"
                                }}
                                hsl={hsl}
                                pointer={Pointer}
                                onChange={onChange}
                            />
                        </div>
                        <div style={styles.slider}>
                            <Alpha
                                rgb={rgb}
                                hsl={hsl}
                                pointer={Pointer}
                                renderers={renderers}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ColorWrap(Chrome)