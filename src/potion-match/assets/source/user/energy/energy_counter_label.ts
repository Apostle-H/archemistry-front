import { CCFloat, Node, Component, RichText, Vec3, _decorator, tween, Vec2, Label } from "cc";
import { energyUpdatedEt, userGameState } from "../user_game_state";
import { StateAction } from "../../utils/state_machine/data/state_action";
import { coreStateEt } from "../../core/state_machine/core_state_machine";
import { CoreState } from "../../core/state_machine/data/core_states";
const { ccclass, property } = _decorator;

@ccclass("energy-counter-label")
export class EnergyCounterLabel extends Component {
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
                if (userGameState.energy && userGameState.maxEnergy) {
                    this.draw(userGameState.energy, userGameState.maxEnergy);
                }
                this.bind();
                break;
            case StateAction.EXIT:
                this.expose();
                break;
        }
    }

    private bind() {
        energyUpdatedEt.on(true.toString(), this.draw, this);
    }

    private expose() {
        energyUpdatedEt.off(true.toString(), this.draw, this);
    }

    private draw(value: number, max_value: number) {
        this._label.string = `${value}/${max_value}`;
    }
}