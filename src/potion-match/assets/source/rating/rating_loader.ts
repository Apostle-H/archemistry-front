import { Component, JsonAsset, _decorator } from "cc";
import { WebUtils } from "../utils/web_utils";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { RatingOut } from "./data/views/rating_out";
import { RatingPanel } from "./rating_panel";
import { StateAction } from "../utils/state_machine/data/state_action";
const { ccclass, property } = _decorator;

@ccclass("rating-loader")
export class RatingLoader extends Component {
    @property({type: [RatingPanel]})
    private topFourPanels: RatingPanel[] = [];
    @property({type: RatingPanel})
    private selfPanel: RatingPanel;

    protected onLoad(): void {
        coreStateEt.on(CoreState.LEADERBOARD, this.load, this);
    }

    protected onDestroy(): void {
        coreStateEt.off(CoreState.LEADERBOARD, this.load, this);
    }

    private load(stateAction: StateAction) {
        if (stateAction == StateAction.EXIT) {
            return;
        }

        WebUtils.get_with_auth("/rating/score").then((response) => response.json().then((json) => {
            const ratingOut: RatingOut = json;
            
            for (let i = 0; i < this.topFourPanels.length; i++) {
                const hasRating = i < ratingOut.top_four.length;

                this.topFourPanels[i].updateData(
                    hasRating ? ratingOut.top_four[i].username : "---",
                    hasRating ? ratingOut.top_four[i].score.toString() : "---"
                );
            }

            this.selfPanel.updateData(ratingOut.self.username, ratingOut.self.score.toString(), ratingOut.self.place);
        }))
    }
}