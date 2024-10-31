import { Component, Label, Sprite, _decorator, math } from "cc";
import { PlaceViewConfing as RatingSprites } from "./data/place_view_config";
const { ccclass, property } = _decorator;

@ccclass("rating-panel")
export class RatingPanel extends Component {
    @property({type: Sprite})
    private panelSprite: Sprite;
    @property({type: Sprite})
    private frameSprite: Sprite;
    @property({type: Label})
    private usernameLabel: Label;
    @property({type: Label})
    private scoreLabel: Label;
    @property({type: Label})
    private placeLabel: Label;

    @property
    private targetViewPlace: number = 1;
    @property({type: [RatingSprites]})
    private ratingsSprites: RatingSprites[] = [];

    protected onLoad(): void {
        this.panelSprite.spriteFrame = this.ratingsSprites[this.targetViewPlace - 1].panelSprite;
        this.frameSprite.spriteFrame = this.ratingsSprites[this.targetViewPlace - 1].frameSprite;
    }

    public updateData(username: string, score: string, place: number = this.targetViewPlace) {
        const viewPlace = math.clamp(place, 1, 4)
        if (this.targetViewPlace != viewPlace) {
            this.panelSprite.spriteFrame = this.ratingsSprites[viewPlace - 1].panelSprite;
            this.frameSprite.spriteFrame = this.ratingsSprites[viewPlace - 1].frameSprite;

            this.targetViewPlace = place;
        }

        this.usernameLabel.string = username;
        this.scoreLabel.string = score;
        this.placeLabel.string = place.toString();
    }


}