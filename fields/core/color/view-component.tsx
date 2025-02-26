"use client";

import ColorButton from "./color-button/color-button";

const ViewComponent = ({
  value,
}: {
  value: string,
}) => {

  if (!value) return null;

  return <span className="max-h-96 px-2 py-2 color-field">
    <ColorButton className="color-button" value={value ?? ""} />
    <p className="px-2 text-sm">{value}</p>
  </span>
}

export { ViewComponent };