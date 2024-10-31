import { _decorator, Label, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("place-view-config")
export class PlaceViewConfing {
    @property({type: SpriteFrame})
    public panelSprite: SpriteFrame;
    @property({type: SpriteFrame})
    public frameSprite: SpriteFrame;
}