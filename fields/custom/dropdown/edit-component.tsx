"use client";

import React, { forwardRef, useMemo, useState } from "react";
import YAML from "yaml";
import "./edit-component.css"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { fetchPagesCmsCollection } from "./fetch-pages-cms-collection";
import { Skeleton } from "@/components/ui/skeleton";

interface OptionData { value: any, key: string, label: (string | React.JSX.Element)[] }

const getHighlightedText = (text: string, highlight: string) => {
    // Split text on highlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map(part =>
        part.toLowerCase() === highlight.toLowerCase() ?
            <span className="text-clip text-xs opacity-40">{part}</span> :
            <span className="text-clip  text-xs opacity-30">{part}</span>
    );
}


// if the option is a collection, map the collection page paths
const GetCollectionOptions = async (args: { name: string, path?: string, labelKey: string, recursive: boolean }): Promise<OptionData[] | undefined> => {

    if (!args.name) return;

    var newData = await fetchPagesCmsCollection({
        collectionName: args.name,
        path: args.path,
        recursive: args.recursive
    })

    return newData?.map((o) => {
        const relativeDirLabel = o.relativeCollectionPath + (o.relativeCollectionPath.length > 0 ? "/" : "");
        return {
            value: o.path,
            key: o.path,
            label: [
                <p className="text-left">
                    <span className="capitalize opacity-70">{relativeDirLabel.replace("/", "/ ")}</span>
                    <b className="pr-4 ">{` ${o.object?.[args.labelKey] ?? o.name}`} </b>
                    {getHighlightedText(o.path, o.relativePath)}
                </p>,
            ],
            chevron: getHighlightedText(o.path, o.relativePath)
        };
    })
}

const GetValueOptions = (options: any | undefined): OptionData[] => {
    return options?.values?.map((o: any) => {
        // if the option is {value: <something>, label: <something>}:
        //   - if the value is keyed values: 
        //      - map that structured data as yaml
        //   - otherwise: 
        //      - just use the string value
        if (typeof o === "object") return {
            value: typeof o.value === "object" ? YAML.stringify(o.value) : o.value,
            key: o.value,
            label: [o.label]
        };
        else return {
            value: o,
            key: o,
            label: [o]
        };
    });
}

const EditComponent = forwardRef((props: any, ref: React.Ref<HTMLInputElement>) => {

    const { value, onChange, field } = props;

    const [data, setData] = useState<OptionData[]>([]);
    const [needsLoad, setNeedsLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const CreateOptions = async () => {

        let newData: OptionData[];

        if (typeof field.options === 'object') {
            if (field.options.collection && data.length == 0) {
                // only fetch collection if it's empty
                newData = await GetCollectionOptions(field.options.collection) ?? [];
            } else if (field.options.values) {
                newData = GetValueOptions(field.options);
            } else {
                newData = [];
            }
        } else {
            newData = []
        }

        setData(newData);
    }

    if (needsLoad) {
        setNeedsLoad(false);
        setIsLoading(true);
        CreateOptions().finally(() => setIsLoading(false));
    }

    const [selection, setSelection] = useState(value ?? undefined);

    const dataChildren = data?.map((o) => {
        return <SelectItem key={o.key} value={o.value} children={o.label} />
    }) ?? []

    const onSelect = (selectionString: string) => {
        onChange(selectionString)
        setSelection(selectionString);
    }

    return (
        isLoading ?
            <Skeleton className="h-10 max-h-96" />
            : <Select onValueChange={onSelect} value={selection}>
                <SelectTrigger className="h-10 max-h-96">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent children={dataChildren} />
            </Select>
    );
});

export { EditComponent };