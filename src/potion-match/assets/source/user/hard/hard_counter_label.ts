import { Component, _decorator, Label } from "cc";
import { hardUpdatedEt } from "../../user/user_game_state";
const { ccclass, property } = _decorator;

@ccclass("hard-counter-label")
export class HardCounterLabel extends Component {
    private _label: Label;

    protected onLoad() {
        this._label = this.node.getComponent(Label);

        this.bind();
    }

    protected onDestroy() {
        this.expose();
    }

    private bind() {
        hardUpdatedEt.on(true.toString(), this.draw, this);
    }

    private expose() {
        hardUpdatedEt.off(true.toString(), this.draw, this);
    }

    private draw(value: number) {
        this._label.string = value.toString();
    }
}