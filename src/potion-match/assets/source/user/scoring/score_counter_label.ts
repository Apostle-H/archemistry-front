import { CCFloat, Component, _decorator, tween, Label } from "cc";
import { scoreUpdatedEt, userGameState } from "../../user/user_game_state";
import { StateAction } from "../../utils/state_machine/data/state_action";
import { coreStateEt } from "../../core/state_machine/core_state_machine";
import { CoreState } from "../../core/state_machine/data/core_states";
const { ccclass, property } = _decorator;

@ccclass("score-counter-label")
export class ScoreCounterLabel extends Component {
    @property({type: CCFloat})
    private popTime: number;
    @property({type: CCFloat})
    private scaleMultiplier: number;

    private _label: Label;

    protected onLoad() {
        this._label = this.node.getComponent(Label);

        coreStateEt.on(CoreState.MAIN, this.bindExpose, this);
    }

    protected onDestroy() {
        coreStateEt.off(CoreState.MAIN, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                if (userGameState.score) {
                    this.draw(userGameState.score);
                }
                this.bind();
                break;
            case StateAction.EXIT:
                this.expose();
                break;
        }
    }

    private bind() {
        scoreUpdatedEt.on(true.toString(), this.draw, this);
    }

    private expose() {
        scoreUpdatedEt.off(true.toString(), this.draw, this);
    }

    private draw(value: number) {
        const startFontSize = this._label.fontSize;
        const scaledUpFontSize = this._label.fontSize * this.scaleMultiplier;

        tween(this._label)
        .to(
            this.popTime,
            { fontSize: scaledUpFontSize },
            { easing: "quadOut" }
        )
        .to(
            this.popTime,
            { fontSize: startFontSize },
            { easing: "quadOut" }
        )
        .start();
        this._label.string = value.toString();
    }
}