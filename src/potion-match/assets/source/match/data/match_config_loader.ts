import { EventTarget} from "cc";
import { MatchElementsConfig, matchElemetsLoadedEt } from "./match_elements_config";
import { MatchGridConfig } from "./match_grid_config";
import { MatchElement } from "../match_element";
import { MapPool } from "../../utils/pooling/map_pool";

export const matchConfigsLoadedEt = new EventTarget();

export const matchGridConfig = new MatchGridConfig();
const matchElementsConfig = new MatchElementsConfig();
export const matchElementsPool = new MapPool<string, MatchElement>(
    matchElementsConfig.getInstanceById.bind(matchElementsConfig), 
    (item) => item.node.active = true,
    (item) => item.node.active = false
)

export abstract class MatchConfigsLoader {
    public static load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all([
                matchGridConfig.load(),
                matchElementsConfig.load()
            ]).then(() => {
                matchConfigsLoadedEt.emit(true.toString());

                resolve();
            }).catch(() => {
                reject();
            });
        });
    }
}