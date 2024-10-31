import { Animation, AnimationClip, Component, UITransform, _decorator } from "cc";
const { ccclass, property } = _decorator;

const idleIndex = 0;
const destroyIndex = 1;

@ccclass("match-element")
export class MatchElement extends Component {
    @property({type: Animation})
    private animaton: Animation;

    private _targetId: string;

    private _idleClip: AnimationClip;
    private _destroyClip: AnimationClip;

    public get targetId() {
        return this._targetId;
    }

    protected onLoad() {
        this._idleClip = this.animaton.clips[0];
        this._destroyClip = this.animaton.clips[1];
    }

    protected onEnable(): void {
        this.animaton.play(this._idleClip.name);
    }

    public init(targetId: string) {
        this._targetId = targetId;
    }

    public clear(): Promise<void> {
        return new Promise((resolve) => {
            this.animaton.play(this._destroyClip.name);
            this.animaton.once(Animation.EventType.FINISHED, resolve);
        })
    }
}