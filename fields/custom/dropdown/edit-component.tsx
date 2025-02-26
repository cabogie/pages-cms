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

interface OptionData { data: any, key: string, label: (string | React.JSX.Element)[] }

// if the option is a collection, map the collection page paths
const GetCollectionOptions = async (args: { name: string, path: string, recursive: boolean }): Promise<OptionData[] | undefined> => {

    if (!args.name || !args.path) return;

    var newData = await fetchPagesCmsCollection(
        args.name,
        args.path,
        args.recursive
    )

    return newData?.map((o) => {
        let nicePath = o.path.replace(args.path + "/", "")
        let readablePathPrefix = nicePath.replace(o.name, "")
        return {
            data: o.path,
            key: o.path,
            label: [`${readablePathPrefix}`, <b>{` ${o.object?.title ?? o.name}`} </b>]
        };
    })
}

const GetValueOptions = (options: any | undefined): OptionData[] => {
    return options?.values?.map((o: any) => {
        // if the options are keyed values and not just strings, map the structured data as yaml
        if (typeof o === "object") return {
            data: YAML.stringify(o),
            key: o.value,
            label: [o.label]
        };
        else return {
            data: o,
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
        return <SelectItem key={o.key} value={o.data} children={o.label} />
    }) ?? []

    const onSelect = (selectionString: string) => {
        onChange(selectionString)
        setSelection(selectionString);
    }

    const loadingMessage = ""; // <div className="p-2">Loading options...</div>
    return (
        isLoading ?
            <Skeleton className="h-10 max-h-96" children={[loadingMessage]} />
            : <Select  onValueChange={onSelect} value={selection}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent children={dataChildren} />
            </Select>
    );
});

export { EditComponent };