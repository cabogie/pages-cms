import { z } from "zod";
import { Field } from "@/types/field";
import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";

import StringToColor from 'string-color-converter';

const defaultValue = "";

const schema = (field: Field) => {

    function colorValidator(val: string) {
        return StringToColor(val).isValid;
    }

    const validColorSchema = z.coerce.string().refine(colorValidator, { message: `Invalid Color. Please use #RRGGBBAA, rgb(255,255,255), rgba(255,255,255,0.5), hsl(1, 1%, 1%), hsla(1, 1%, 1%, a), or css named color.` });

    return z.literal("").refine(() => !field.required, { message: "This field is required" }).or(validColorSchema);
};

const supportsList = false;

export { schema, EditComponent, ViewComponent, defaultValue, supportsList };