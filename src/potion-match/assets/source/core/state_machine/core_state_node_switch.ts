import { Component, Enum, _decorator } from "cc";
import { CoreState } from "./data/core_states";
import { StateAction } from "../../utils/state_machine/data/state_action";
import { coreStateEt, coreStateMachine } from "./core_state_machine";
import { NodeStateAction } from "../../utils/state_machine/data/node_state_action";
const { ccclass, property } = _decorator;

@ccclass("core-state-node-switch")
export class CoreStateNodeSwitch extends Component {
    @property({type: Enum(CoreState)})
    private targetState: CoreState;

    @property({type: [NodeStateAction]})
    private nodes: NodeStateAction[] = [];

    protected onLoad(): void {
        coreStateEt.once("any", this.init, this)
        coreStateEt.on(this.targetState, this.switch, this);
    }

    protected onDestroy() {
        coreStateEt.off(this.targetState, this.switch, this);
    }

    private init() {
        if (coreStateMachine.currentState == this.targetState) {
            return;
        }

        this.switch(StateAction.EXIT)
    }

    private switch(stateAction: StateAction) {
        this.nodes.forEach((node) => {
            const isActive = stateAction == StateAction.ENTER ? node.ActiveOnEnter : !node.ActiveOnEnter;
            return node.Node.active = isActive;
        });
    }
}