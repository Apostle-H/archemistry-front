import { Component, Label, Sprite, _decorator, math } from "cc";
const { ccclass, property } = _decorator;

@ccclass("friend-panel")
export class FriendPanel extends Component {
    @property({type: Label})
    private usernameLabel: Label;
    @property({type: Label})
    private scoreLabel: Label;

    public updateData(username: string, score: number) {
        this.usernameLabel.string = username;
        this.scoreLabel.string = score.toString();
    }
}