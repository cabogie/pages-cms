import { useConfig } from "@/contexts/config-context";
import { getSchemaByName } from "@/lib/schema";
import { Config } from "@/types/config";

interface FetchArgs {
    collectionName: string,
    recursive?: boolean,
    path?: string
}

export async function fetchPagesCmsCollection(args: FetchArgs): Promise<Record<string, any>[] | undefined> {

    const { config } = useConfig();

    if (!config) {
        return Promise.reject('No config found.')
    }

    const schema = getSchemaByName(config?.object, args.collectionName);

    if (!schema) {
        return Promise.reject(`Schema not found for "${args.collectionName}".`)
    }

    if (schema.type !== "collection") {
        return Promise.reject(`"${args.collectionName}" is not a collection.`)
    }

    return fetchPagesCmsCollectionWithConfig(config, schema, args);
}


export async function fetchPagesCmsCollectionWithConfig(config: Config, schema: any, args: FetchArgs): Promise<Record<string, any>[] | undefined> {

    const baseCollectionPath = schema.path
    const collectionName = schema.label

    args.path = args.path ?? baseCollectionPath

    const apiPath = `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collections/${encodeURIComponent(args.collectionName)}?path=${encodeURIComponent(args.path ?? "")}`

    return fetch(apiPath).then(
        async (response) => {

            if (!response.ok) return Promise.reject(`Failed to fetch collection: ${response.status} ${response.statusText}`);

            const dataJson: any = await response.json();

            if (dataJson.status !== "success") return Promise.reject(dataJson.message);

            var newDataArray = dataJson.data.contents;
            var finalDataArray: Record<string, any>[] = [];

            for (var file of newDataArray) {

                if (file.type === "dir") {
                    // AUDIT:FIXME: add this to api? maybe it's already there?
                    if (args.recursive) {
                        finalDataArray = finalDataArray.concat(
                            await fetchPagesCmsCollectionWithConfig(config, schema, { collectionName: args.collectionName, path: file.path, recursive: true }) ?? []
                        )
                    }
                } else {
                    const dirPath = file.path.substring(0, file.path.lastIndexOf("/"));
                    const relativeDirPath = dirPath.replace(baseCollectionPath, "")
                    file.relativeCollectionPath = relativeDirPath.replace(/^\/|\/$/g, ''); // no leading /

                    const relativePath = file.path.replace(baseCollectionPath, "")
                    file.relativePath = relativePath.replace(/^\/|\/$/g, ''); // no leading /

                    finalDataArray.push(file)
                }
            }

            return finalDataArray
        },
        (rejectReason) => {
            console.error(rejectReason);
            return undefined
        }
    )

}
