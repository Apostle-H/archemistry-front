import { Component, _decorator, tween, Label } from "cc";
import { softUpdatedEt } from "../../user/user_game_state";
const { ccclass, property } = _decorator;

@ccclass("soft-counter-label")
export class SoftCounterLabel extends Component {
    private _label: Label;

    protected onLoad() {
        this._label = this.node.getComponent(Label);

        this.bind();
    }

    protected onDestroy() {
        this.expose();
    }

    private bind() {
        softUpdatedEt.on(true.toString(), this.draw, this);
    }

    private expose() {
        softUpdatedEt.off(true.toString(), this.draw, this);
    }

    private draw(value: number) {
        this._label.string = value.toString();
    }
}