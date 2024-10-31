import { Component, Node, Prefab, _decorator, instantiate } from "cc";
import { WebUtils } from "../utils/web_utils";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { ReferralOut } from "./data/views/referral_out";
import { FriendPanel } from "./friend_panel";
import { StateAction } from "../utils/state_machine/data/state_action";
const { ccclass, property } = _decorator;

@ccclass("friends-loader")
export class FriendsLoader extends Component {
    @property({type: Node})
    private holder: Node;
    @property({type: Prefab})
    private friendPanelPrefab: Prefab;

    private _friendsPanels: FriendPanel[] = [];

    protected onLoad(): void {
        coreStateEt.on(CoreState.REFERRAL, this.load, this);
    }

    protected onDestroy(): void {
        coreStateEt.off(CoreState.REFERRAL, this.load, this);
    }

    private load(stateAction: StateAction) {
        if (stateAction == StateAction.EXIT) {
            return;
        }

        WebUtils.get_with_auth("/referral/user_all").then((response) => response.json().then((json) => {
            const referralsOut: ReferralOut[] = json;
            
            for (let i = 0; i < referralsOut.length; i++) {
                if (i >= this._friendsPanels.length) {
                    this._friendsPanels.push(this.newPanel());
                }

                this._friendsPanels[i].updateData(referralsOut[i].username, referralsOut[i].score);
            }
        }))
    }

    private newPanel(): FriendPanel {
        const newFriendPanelNode = instantiate(this.friendPanelPrefab);
        const newFriendPanel = newFriendPanelNode.getComponent(FriendPanel);
        newFriendPanelNode.setParent(this.holder);

        return newFriendPanel;
    }
}