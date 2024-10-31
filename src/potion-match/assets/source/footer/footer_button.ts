import { Animation, AnimationClip, Button, Component, EventHandler, _decorator } from "cc";
import { CoreState } from "../core/state_machine/data/core_states";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { StateAction } from "../utils/state_machine/data/state_action";
const { ccclass, property } = _decorator;

const pressIndex = 0;
const releaseIndex = 1;

@ccclass("footer-button")
export class FooterButton extends Component {
    @property({type: CoreState})
    private targetState: CoreState;

    private _animaton: Animation;

    private _pressClip: AnimationClip;
    private _releaseClip: AnimationClip;

    protected onLoad() {
        this._animaton = this.node.getComponent(Animation);

        this._pressClip = this._animaton.clips[0];
        this._releaseClip = this._animaton.clips[1];

        coreStateEt.on(this.targetState, this.switch, this);
    }

    protected onDestroy() {
        coreStateEt.off(this.targetState, this.switch, this);
    }

    private switch(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this._animaton.play(this._pressClip.name);
                break;
            case StateAction.EXIT:
                this._animaton.play(this._releaseClip.name);
                break;
        }
    }
}