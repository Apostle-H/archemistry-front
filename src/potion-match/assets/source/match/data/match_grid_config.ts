import { Vec2 } from "cc";
import { WebUtils } from "../../utils/web_utils";
import { MatchConfigOut } from "./views/match_config_out";
import { matchGridConfig } from "./match_config_loader";

export class MatchGridConfig {
    private _size: Vec2;
    private _sets: Vec2[][];

    public get size() {
        return this._size;
    }

    public outOfBounds(index: Vec2): Boolean {
        return index.x < 0 || index.x >= this._size.x || index.y < 0 || index.y >= this._size.y;
    }

    public checkFromIndex(targetIndex: Vec2, gridState: string[][]): Vec2[][] {
        const patternsSet: Vec2[][] = []
        for (const set of this._sets) {
            for (const fromIndex of set) {
                let checkPos = set.map((setIndex) => new Vec2(targetIndex.x - fromIndex.x + setIndex.x, targetIndex.y - fromIndex.y + setIndex.y));
                if (checkPos.some((checkIndex) => this.outOfBounds(checkIndex))) {
                    continue;
                }

                let startElement = gridState[checkPos[0].x][checkPos[0].y];
                if (!checkPos.every((checkIndex) => gridState[checkIndex.x][checkIndex.y] == startElement)) {
                    continue;
                }

                const repeatsComplex = patternsSet.some((set) => checkPos.every((pos) => set.some((setPos) => setPos.equals(pos))));
                if (!repeatsComplex) {
                    patternsSet.push(checkPos);
                }
                
                break;
            }
        }

        return patternsSet;
    }

    public load(): Promise<void> {
        return this.fetchConfig();
    }

    private fetchConfig(): Promise<void> {
        return WebUtils.get_with_auth("/static/match").then((response) => response.json().then((json) => {
            let matchConfigOut: MatchConfigOut = json;

            this._size = new Vec2(matchConfigOut.size.x, matchConfigOut.size.y);
            this._sets = matchConfigOut.sets.map((set) => set.map((simpleVec2) => new Vec2(simpleVec2.x, simpleVec2.y)));
        }))
    }
}