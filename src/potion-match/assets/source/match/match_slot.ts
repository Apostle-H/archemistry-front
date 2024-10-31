import { Component, EventTouch, Input, UITransform, Vec2, EventTarget, _decorator, input, Vec3 } from "cc";
import { MatchElement } from "./match_element";
import { MatchSwipe } from "./data/enums/match_swipe";
import { inBounds } from "../utils/ui/funcs";
const { ccclass, property } = _decorator;

export const matchSwipeEt = new EventTarget();

@ccclass("match-slot")
export class MatchSlot extends Component {
    private _uiTransform: UITransform;
    
    private _index: Vec2;
    private _element: MatchElement;

    private initialized: Boolean;

    public get index(): Vec2 {
        return this._index;
    }

    public get element(): MatchElement {
        return this._element;
    }

    protected onLoad(): void {
        this._uiTransform = this.node.getComponent(UITransform);
    }

    public bind(): void {
        input.on(Input.EventType.TOUCH_START, this.swipeStart, this);
    }

    public expose(): void {
        input.off(Input.EventType.TOUCH_START, this.swipeStart, this);
    }

    public init(index: Vec2): void {
        if (this.initialized) {
            return;
        }

        this._index = index;
        this.initialized = true;
    }

    public set(element: MatchElement): void {
        this._element = element;
        this._element.node.setPosition(new Vec3());
        this._element.node.setParent(this.node);
    }

    private swipeStart(event: EventTouch) {
        if (!inBounds(this._uiTransform, event)) {
            return;
        }

        matchSwipeEt.emit(MatchSwipe.START, this._index)
    }
}