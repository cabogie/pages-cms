import { useConfig } from "@/contexts/config-context";
import { Config } from "@/types/config";


export async function fetchPagesCmsCollection(collectionName: string, path: string, recursive: boolean): Promise<Record<string, any>[] | undefined> {
    
    const { config } = useConfig();

    if (!config) {
        console.error("No config.");
        return
    }

    return fetchPagesCmsCollectionWithConfig(config, collectionName, path, recursive);
}


export async function fetchPagesCmsCollectionWithConfig(config: Config, collectionName: string, path: string, recursive: boolean): Promise<Record<string, any>[] | undefined> {

    const apiPath = `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collections/${encodeURIComponent(collectionName)}?path=${encodeURIComponent(path)}`

    return fetch(apiPath).then(
        async (response) => {

            if (!response.ok) return Promise.reject(`Failed to fetch collection: ${response.status} ${response.statusText}`);

            const dataJson: any = await response.json();

            if (dataJson.status !== "success") return Promise.reject(dataJson.message);

            var newDataArray = dataJson.data.contents;
            var finalDataArray: Record<string, any>[] = [];

            for (var file of newDataArray) {
                // FIXME: add to api (maybe it's already there?)
                if (file.type === "dir") {
                    if (recursive) {
                        finalDataArray = finalDataArray.concat(
                            await fetchPagesCmsCollectionWithConfig(config, collectionName, file.path, true) ?? []
                        )
                    }
                } else {
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
