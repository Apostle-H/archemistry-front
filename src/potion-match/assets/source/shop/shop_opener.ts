import { Component, Node, _decorator } from "cc";
import { ShopLoader } from "./shop_loader";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { StateAction } from "../utils/state_machine/data/state_action";
const { ccclass, property } = _decorator;


@ccclass("shop-opener")
export class ShopOpener extends Component {
    @property({type: ShopLoader})
    private shopLoader: ShopLoader;

    protected onLoad(): void {
        coreStateEt.on(CoreState.MAIN, this.bindExpose, this);
    }

    protected onDestroy(): void {
        coreStateEt.off(CoreState.MAIN, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this.bind();
                break;
            case StateAction.EXIT:
                this.expose();
                break;
        }
    }

    private bind() {
        this.node.on(Node.EventType.TOUCH_END, this.open, this);
    }

    private expose() {
        this.node.off(Node.EventType.TOUCH_END, this.open, this);
    }

    private open() {
        this.shopLoader.open();
    }
}