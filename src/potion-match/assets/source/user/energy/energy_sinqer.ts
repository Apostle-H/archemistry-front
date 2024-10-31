import { Component, EventTarget, _decorator, js, macro } from "cc";
import { WebUtils } from "../../utils/web_utils";
import { userGameState } from "../user_game_state";
const { ccclass, property } = _decorator

@ccclass('energy-sinqer')
export class EnergySinqer extends Component {
    private _busy: boolean;

    public launch() {
        this.restore();
        this.schedule(this.restore, 60, macro.REPEAT_FOREVER);
    }

    private restore() {
        if (this._busy) {
            return;
        }

        this._busy = true;
        WebUtils.post_with_auth("/match/restore", { }).then((response: Response) => response.json().then((json) => {
            userGameState.updateEnergy(json.energy, json.max_energy);
            this._busy = false;
        }));
    }
}