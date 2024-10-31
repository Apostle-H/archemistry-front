import { Node, Component, EventTarget, Input, Label, Sprite, _decorator, Button, EventHandheld, EventHandler, JsonAsset, tiledLayerAssembler, RichText, UITransform, Widget, assetManager, ImageAsset, SpriteFrame, Texture2D } from "cc";
import { DailyTaskOut } from "./data/views/daily_task_out";
import { SocialTaskOut } from "./data/views/social_task_out";
import { WebUtils } from "../utils/web_utils";
import { userGameState } from "../user/user_game_state";
import { HapticTg } from "../haptic/haptic_tg";
import { TasksIconsConfig } from "./data/tasks_icons_config";
const { ccclass, property } = _decorator;

export const dailyTaskOpenEt: EventTarget = new EventTarget();
export const socialTaskOpenEt: EventTarget = new EventTarget();

@ccclass("task-panel")
export class TaskPanel extends Component {
    @property({type: UITransform})
    private rewardsPanelUITransform: UITransform;
    @property({type: Sprite})
    private iconSprite: Sprite;
    @property({type: Label})
    private descriptionLabel: Label;
    @property({type: RichText})
    private rewardLabel: RichText;
    @property({type: Button})
    private claimButton: Button;
    @property({type: Node})
    private arrow: Node;
    @property({type: JsonAsset})
    private rewards_icons_config: JsonAsset;

    private _targetTask: DailyTaskOut;
    private _iconUrl: string;

    private readonly _claimHandler: EventHandler = new EventHandler();

    private readonly _spriteFrame = new SpriteFrame();
    private readonly _texture = new Texture2D();

    protected onLoad() {
        this._claimHandler.target = this.node;
        this._claimHandler.component = "task-panel";
        this._claimHandler.handler = "claim";
    }


    public bind() {
        this.node.on(Node.EventType.TOUCH_END, this.open, this);
        this.claimButton.clickEvents.push(this._claimHandler);

        this.rewardsPanelUITransform.node.on(Node.EventType.SIZE_CHANGED, this.updateSizes, this);
    }

    public expose() {
        this.node.off(Node.EventType.TOUCH_END, this.open, this);
        const targetIndex = this.claimButton.clickEvents.indexOf(this._claimHandler);
        this.claimButton.clickEvents.splice(targetIndex, 1);

        this.rewardsPanelUITransform.node.off(Node.EventType.SIZE_CHANGED, this.updateSizes, this);
    }

    public updateTask(targetTask: DailyTaskOut) {
        this._targetTask = targetTask;

        let progress_string: string;
        if (this._targetTask.progress <= this._targetTask.target) {
            progress_string = `${this._targetTask.progress}/${this._targetTask.target}`;
        } else {
            progress_string = "Done";
        }
        const fullDescription = `${this._targetTask.description} (${progress_string})`;
        const sprite_title = this.rewards_icons_config.json.map.find(reward => reward.code == this._targetTask.reward_type).sprite_title;
        const rewards = `+${this._targetTask.reward}<img src='${sprite_title}' width=${this.rewardLabel.fontSize} height=${this.rewardLabel.fontSize} align=center/>`;
        this.updateLabels(fullDescription, rewards);

        this.updateClaimButton(this._targetTask.progress >= this._targetTask.target, this._targetTask.progress == this._targetTask.target);

        this.arrow.active = this._targetTask.type > 100;

        if (this._targetTask.type < 100) {
            if (TasksIconsConfig.loaded) {
                this.iconSprite.spriteFrame = TasksIconsConfig.getIconByType(this._targetTask.type);
            }
            return;
        }

        
        const socialTask = this._targetTask as SocialTaskOut;
        if (socialTask.icon_url != this._iconUrl) {
            this._iconUrl = socialTask.icon_url;
            assetManager.loadRemote<ImageAsset>(socialTask.icon_url, (err, imageAsset) => {
                if (err) {
                    return;
                }
    
                this._texture.image = imageAsset;
                this._spriteFrame.texture = this._texture;
                this.iconSprite.spriteFrame = this._spriteFrame;
            });
        }
    }

    private updateLabels(description: string, rewards: string) {
        this.descriptionLabel.string = description;
        this.rewardLabel.string = rewards;
    }

    private updateClaimButton(onOff: boolean, interactable: boolean) {
        this.claimButton.node.active = onOff;
        this.claimButton.interactable = interactable;
    }

    private updateSizes() {
        this.rewardLabel.maxWidth = this.rewardsPanelUITransform.width;
        this.rewardsPanelUITransform.height = this.rewardLabel.lineHeight;
    }

    private open() {
        if (this._targetTask.type < 100) {
            dailyTaskOpenEt.emit(true.toString(), this._targetTask, this.check.bind(this), this.claim.bind(this))
        } else {
            socialTaskOpenEt.emit(true.toString(), this._targetTask, this.check.bind(this), this.claim.bind(this));
        }
    }

    private check(): Promise<boolean> {
        if (this._targetTask.type < 100 && this._targetTask.type != 1) {
            return new Promise((resolve, reject) => {
                reject();
            })
        }

        let path = ""
        if (this._targetTask.type == 1) {
            path = "/tasks/rofl";
        } else {
            path = `/tasks/social/validate/${this._targetTask.type}`;
        }
        return new Promise<boolean>((resovle, reject) => {
            WebUtils.get_with_auth(path).then((response) => response.json().then((json) => {
                if (json.progress == this._targetTask.progress) {
                    resovle(false);
                    return;
                }

                this._targetTask.progress = this._targetTask.target;
                console.log(this._targetTask.progress);
                this.updateTask(this._targetTask);
                resovle(true);
            }));
        });
    }

    private claim(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            WebUtils.post_with_auth(`/tasks/claim/${this._targetTask.type}`, {}).then((response) => response.json().then((json) => {
                if (!json.result) {
                    HapticTg.error();
                    resolve(false);
                    return;
                }

                userGameState.updateEnergy(json.energy);
                userGameState.updateSoft(json.soft);
                userGameState.updateHard(json.hard);

                this._targetTask.progress = this._targetTask.target + 1;
                this.updateClaimButton(true, false);

                HapticTg.success();
                resolve(true);
             }));
        })
    }
}