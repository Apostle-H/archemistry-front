import { Button, Component, EventHandler, _decorator, debug } from "cc";
import { StateAction } from "../utils/state_machine/data/state_action";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { generate_referral_link } from "./referral_link_generator";
import { WebUtils } from "../utils/web_utils";
import { checkApiAvailablity } from "../utils/tg/funcs";
const { ccclass, property} = _decorator;


@ccclass("invite-widget-button")
export class InviteWidgetButton extends Component {
    private _button: Button;

    private _copyHandler: EventHandler = new EventHandler();

    protected onLoad() {
        this._button = this.node.getComponent(Button);
        this._copyHandler.target = this.node;
        this._copyHandler.component = "invite-widget-button";
        this._copyHandler.handler = "widget";

        coreStateEt.on(CoreState.REFERRAL, this.bindExpose, this);
    }

    protected onDestroy() {
        coreStateEt.off(CoreState.REFERRAL, this.bindExpose, this);
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
        this._button.clickEvents.push(this._copyHandler);
    }

    private expose() {
        const targetIndex = this._button.clickEvents.indexOf(this._copyHandler);
        this._button.clickEvents.splice(targetIndex, 1);
    }

    private widget() {
        const shareLink = `https://t.me/share/url?url=${encodeURIComponent(generate_referral_link(WebUtils.tgId))}&text=🧪%20Archemistry:%20Join%20the%20Alchemical%20Adventure!`;
        if (!checkApiAvailablity()) {
            globalThis.open(shareLink);
        } else {
            globalThis.Telegram.WebApp.openTelegramLink(shareLink);
        }
    }
}