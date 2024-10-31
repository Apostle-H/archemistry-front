import { EventTarget, JsonAsset, Prefab, _decorator, instantiate, resources } from "cc";
import { WebUtils } from "../../utils/web_utils";
import { MatchElementOut } from "./views/match_element_out";
import { MatchElement } from "../match_element";

export const matchElemetsLoadedEt = new EventTarget();

export class MatchElementsConfig {
    private elementsMap: JsonAsset;

    private idsElementsMap: Record<string, Prefab> = {};
    private titlesIdsMap: Record<string, string> = {};

    public getInstanceByTitle(title: string): MatchElement {
        return this.getInstanceById(this.titlesIdsMap[title])
    }

    public getInstanceById(id: string): MatchElement {
        let instance = instantiate(this.idsElementsMap[id]).getComponent(MatchElement);
        instance.init(id);
        return instance;
    }

    public async load(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load("match/configs/match-elements-config", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    reject();
                }

                this.elementsMap = jsonAsset;

                this.fetchElements().then(resolve);
            })
        })
    }

    private fetchElements(): Promise<void> {
        return WebUtils.get_with_auth("/match/all").then((response) => response.json().then((json) => {
            let elementsOut: MatchElementOut[] = json;
            return this.mapElements(elementsOut);
        }));
    }

    private mapElements(elementsOut: MatchElementOut[]): Promise<void> {
        let mapPromises: Promise<void>[] = [];
        for (const elementOut of elementsOut) {
            mapPromises.push(this.mapElement(elementOut));
        }

        return Promise.all(mapPromises).then(() => {
            matchElemetsLoadedEt.emit(true.toString());
        });
    }

    private mapElement(elementOut: MatchElementOut): Promise<void> {
        return new Promise((resolve, reject) => {
            this.titlesIdsMap[elementOut.title] = elementOut.id;
            for (const localElement of this.elementsMap.json.elements) {
                if (localElement.title != elementOut.title)
                    continue;

                resources.load(localElement.prefab_path, Prefab, (err, prefab) => {
                    if (err) {
                        reject();
                    }

                    this.idsElementsMap[elementOut.id] = prefab;

                    resolve();
                });
            }
        })
        
    }
}