import { Button, Component, Enum, EventHandler, _decorator } from "cc";
import { CoreState } from "./data/core_states";
import { StateAction } from "../../utils/state_machine/data/state_action";
import { coreStateEt, coreSwitchEt } from "./core_state_machine";
import { HapticTg } from "../../haptic/haptic_tg";
const { ccclass, property } = _decorator;

@ccclass("core-state-switch-button")
export class CoreStateSwitchButton extends Component {
    @property({type: Enum(CoreState)})
    private targetState: CoreState;

    private _button: Button;

    private readonly _switchHandler: EventHandler = new EventHandler();

    protected onLoad() {
        this._button = this.node.getComponent(Button);
        this._switchHandler.target = this.node;
        this._switchHandler.component = "core-state-switch-button";
        this._switchHandler.handler = 'switch'

        coreStateEt.on(this.targetState, this.bindExpose, this);
        this.bind();
    }

    protected onDestroy() {
        coreStateEt.off(this.targetState, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this.expose();
                break;
            case StateAction.EXIT:
                this.bind();
                break;
        }
    }

    private bind() {
        this._button.clickEvents.push(this._switchHandler);
    }

    private expose() {
        const targetIndex = this._button.clickEvents.indexOf(this._switchHandler);
        this._button.clickEvents.splice(targetIndex, 1);
    }

    public switch() {
        HapticTg.light();
        coreSwitchEt.emit(true.toString(), this.targetState);
    }
}