import { Button, Component, EventHandler, EventTouch, Input, Label, UITransform, _decorator, input, js, tiledLayerAssembler } from "cc";
import { SocialTaskOut } from "./data/views/social_task_out";
import { dailyTaskOpenEt } from "./task_panel";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { StateAction } from "../utils/state_machine/data/state_action";
import { fadeClickEt, fadeEt } from "../utils/ui/fade";
import { DailyTaskOut } from "./data/views/daily_task_out";
const { ccclass, property } = _decorator;

@ccclass('rofl-task-details-panel')
export class RoflTaskDetailsPanel extends Component {
    @property({type: Button})
    private checkClaimButton: Button;
    @property({type: Label})
    private chechClaimLabel: Label;

    private readonly _checkHandler: EventHandler = new EventHandler();
    private readonly _claimHandler: EventHandler = new EventHandler();

    private _targetTask: DailyTaskOut;
    private _checkCallback: () => Promise<boolean>;
    private _claimCallback: () => Promise<boolean>;

    protected onLoad() {
        this._checkHandler.target = this.node;
        this._checkHandler.component = "rofl-task-details-panel";
        this._checkHandler.handler = "check";

        this._claimHandler.target = this.node;
        this._claimHandler.component = "rofl-task-details-panel";
        this._claimHandler.handler = "claim";

        coreStateEt.on(CoreState.TASKS, this.bindExpose, this);
        this.node.active = false;
    }

    protected onDestroy(): void {
        coreStateEt.off(CoreState.TASKS, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this.bind()
                break;
            case StateAction.EXIT:
                this.expose()
                break;
        }
    }

    private bind() {
        dailyTaskOpenEt.on(true.toString(), this.open, this);
    }

    private expose() {
        dailyTaskOpenEt.off(true.toString(), this.open, this);
    }

    private open(targetTask: SocialTaskOut, checkCallback: () => Promise<boolean>, claimCallback: () => Promise<boolean>) {
        if(targetTask.type != 1) {
            return;
        }

        this._targetTask = targetTask;
        this._checkCallback = checkCallback;
        this._claimCallback = claimCallback;

        this.node.active = true;
        this.drawCheckClaim();
        fadeEt.emit(true.toString());
        this.bindInner();
    }

    private close(evetTouch: EventTouch) {
        this.node.active = false;
        fadeEt.emit(false.toString());
        this.exposeInner();
    }

    private refresh() {
        this.drawCheckClaim();

        this.exposeInner();
        this.bindInner();
    }

    private bindInner() {
        if (this._targetTask.progress < this._targetTask.target) {
            this.checkClaimButton.clickEvents.push(this._checkHandler);
        } else if (this._targetTask.progress == this._targetTask.target) {
            this.checkClaimButton.clickEvents.push(this._claimHandler);
        }

        fadeClickEt.on(true.toString(), this.close, this);
    }

    private exposeInner() {
        const targetCheckIndex = this.checkClaimButton.clickEvents.indexOf(this._checkHandler);
        if (targetCheckIndex >= 0) {
            this.checkClaimButton.clickEvents.splice(targetCheckIndex, 1);
        }
        const targetClaimIndex = this.checkClaimButton.clickEvents.indexOf(this._claimHandler);
        if (targetClaimIndex >= 0) {
            this.checkClaimButton.clickEvents.splice(targetClaimIndex, 1);
        }

        fadeClickEt.off(true.toString(), this.close, this);
    }

    private drawCheckClaim() {
        if (this._targetTask.progress < this._targetTask.target) {
            this.chechClaimLabel.string = "Check"
        } else if (this._targetTask.progress >= this._targetTask.target) {
            this.chechClaimLabel.string = "Claim"
        }

        this.checkClaimButton.interactable = this._targetTask.progress <= this._targetTask.target;
    }

    private check() {
        this._checkCallback().then((result) => {
            if (!result || !this.node.active) {
                return;
            }

            this.refresh();
        })
    }

    private claim() {
        this._claimCallback().then((result) => {
            if (!result) {
                return;
            }

            if (this.node.active) {
                this.refresh();
            }
        })
    }
}