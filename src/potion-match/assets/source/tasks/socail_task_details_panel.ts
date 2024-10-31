import { Button, Component, EventHandler, EventTouch, ImageAsset, Input, Label, Sprite, SpriteFrame, Texture2D, UITransform, _decorator, assetManager, input } from "cc";
import { SocialTaskOut } from "./data/views/social_task_out";
import { socialTaskOpenEt } from "./task_panel";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { StateAction } from "../utils/state_machine/data/state_action";
import { fadeClickEt, fadeEt } from "../utils/ui/fade";
const { ccclass, property } = _decorator;

@ccclass('social-task-details-panel')
export class SocialTaskDetailsPanel extends Component {
    @property({type: Sprite})
    private iconSprite: Sprite;
    @property({type: Label})
    private descriptionLabel: Label;
    @property({type: Button})
    private checkClaimButton: Button;
    @property({type: Label})
    private checkClaimLabel: Label;
    @property({type: Button})
    private goButton: Button;

    private readonly _claimHandler: EventHandler = new EventHandler();
    private readonly _checkHandler: EventHandler = new EventHandler();
    private readonly _goHandler: EventHandler = new EventHandler();

    private _targetTask: SocialTaskOut;
    private _checkCallback: () => Promise<boolean>;
    private _claimCallback: () => Promise<boolean>;

    private _iconUrl: string;

    private readonly _spriteFrame = new SpriteFrame();
    private readonly _texture = new Texture2D();

    protected onLoad() {
        this._checkHandler.target = this.node;
        this._checkHandler.component = "social-task-details-panel";
        this._checkHandler.handler = "check";

        this._claimHandler.target = this.node;
        this._claimHandler.component = "social-task-details-panel";
        this._claimHandler.handler = "claim";

        this._goHandler.target = this.node;
        this._goHandler.component = "social-task-details-panel";
        this._goHandler.handler = "go";

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
        socialTaskOpenEt.on(true.toString(), this.open, this);
    }

    private expose() {
        socialTaskOpenEt.off(true.toString(), this.open, this);
    }

    private open(targetTask: SocialTaskOut, checkCallback: () => Promise<boolean>, claimCallback: () => Promise<boolean>) {
        this._targetTask = targetTask;
        this._checkCallback = checkCallback;
        this._claimCallback = claimCallback;

        this.node.active = true;
        fadeEt.emit(true.toString());
        this.draw();
        this.bindInner();
    }

    private close() {
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
        this.goButton.clickEvents.push(this._goHandler);

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

        const targetGoIndex = this.goButton.clickEvents.indexOf(this._goHandler);
        this.goButton.clickEvents.splice(targetGoIndex, 1);

        fadeClickEt.off(true.toString(), this.close, this);
    }

    private draw() {
        if (this._targetTask.icon_url != this._iconUrl) {
            this._iconUrl = this._targetTask.icon_url;
            assetManager.loadRemote<ImageAsset>(this._targetTask.icon_url, (err, imageAsset) => {
                if (err) {
                    return;
                }
    
                this._texture.image = imageAsset;
                this._spriteFrame.texture = this._texture;
                this.iconSprite.spriteFrame = this._spriteFrame;
            });
        }
        
        this.descriptionLabel.string = this._targetTask.description;

        this.drawCheckClaim();
    }

    private drawCheckClaim() {
        if (this._targetTask.progress < this._targetTask.target) {
            this.checkClaimLabel.string = "Check"
        } else if (this._targetTask.progress >= this._targetTask.target) {
            this.checkClaimLabel.string = "Claim"
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
            if (!result || !this.node.active) {
                return;
            }

            this.refresh();
        })
    }

    private go() {
        console.log("go");
        globalThis.open(this._targetTask.target_url);
    }
}