import { _decorator, Node, Component, EventTarget, Tween, tween, UITransform, Vec2, Vec3, CCFloat, EventTouch, input, Input } from 'cc';
import { matchSwipeEt } from './match_slot';
import { MatchSwipe } from './data/enums/match_swipe';
import { WebUtils } from '../utils/web_utils';
import { applyToVec2 as applyDirectionToVec2, directionFromVec2, MatchDirection } from './data/enums/match_direction';
import { MatchMoveIn } from './data/views/match_move_in';
import { matchGridConfig } from './data/match_config_loader';
import { MatchGrid } from './match_grid';
import { tweenWithPromiseCall } from '../utils/tweening/funcs';
import { convertLocalToOtherLocal } from '../utils/ui/funcs';
import { userGameState } from '../user/user_game_state';
import { MatchMove } from './data/enums/match_move';
import { coreStateEt } from '../core/state_machine/core_state_machine';
import { CoreState } from '../core/state_machine/data/core_states';
import { StateAction } from '../utils/state_machine/data/state_action';
import { clearEt } from './match_clearer';
import { MatchClear } from './data/enums/match_clear';
const { ccclass, property } = _decorator;

export const moveEt = new EventTarget();

const swapTweenTag = 11;

@ccclass('match-mover')
export class MatchMover extends Component {
    @property({type: MatchGrid})
    private matchGrid: MatchGrid;

    @property({type: CCFloat})
    private moveTime: number;

    private _fromMatchIndex: Vec2;
    private _fromMatchIndexValid: boolean;

    private _bind: boolean;
    private _blocked: boolean = false;

    protected onLoad() {
        coreStateEt.on(CoreState.MAIN, this.bindExpose, this);
        
        clearEt.once(MatchClear.STARTED, this.block, this);
        clearEt.once(MatchClear.EMPTY, this.unblock, this);
        clearEt.once(MatchClear.CLEARED, this.unblock, this);
    }
    
    protected onDestroy() {
        coreStateEt.off(CoreState.MAIN, this.bindExpose, this);
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
        if (this._bind) {
            return;
        }
        
        matchSwipeEt.on(MatchSwipe.START, this.swipeStart, this);
        input.on(Input.EventType.TOUCH_END, this.swipeEnd, this);

        this._bind = true;
    }

    private expose() {
        if (!this._bind) {
            return;
        }

        matchSwipeEt.off(MatchSwipe.START, this.swipeStart, this);
        input.off(Input.EventType.TOUCH_END, this.swipeEnd, this);

        this._bind = false;
    }

    private swipeStart(index: Vec2) {
        this._fromMatchIndex = index;
        this._fromMatchIndexValid = true;
    }

    private swipeEnd(event: EventTouch) {
        if (!this._fromMatchIndexValid || this._blocked) {
            return;
        }
        
        if (userGameState.energy <= 0) {
            moveEt.emit(MatchMove.FAILED);
            return;
        }

        const direction = directionFromVec2(event.getStartLocation(), event.getLocation());
        matchSwipeEt.emit(MatchSwipe.END, direction);

        const toMatchIndex = applyDirectionToVec2(this._fromMatchIndex, direction);
        if (matchGridConfig.outOfBounds(this._fromMatchIndex) || matchGridConfig.outOfBounds(toMatchIndex)) {
            return;
        }

        this.block();
        this._fromMatchIndexValid = false;
        clearEt.once(MatchClear.EMPTY, this.unblock, this);
        clearEt.once(MatchClear.CLEARED, this.unblock, this);
        this.tryMove(this._fromMatchIndex, direction);
    }

    public tryMove(index: Vec2, direction: MatchDirection) {
        const sinqed = new Promise<void>((resolve, reject) => {
            WebUtils.post_with_auth("/match/move", new MatchMoveIn(index.x, index.y, direction)).then((response: Response) => response.json().then((json) => {
                if (!json.result) {
                    reject();
                    return;
                }
    
                userGameState.updateEnergy(json.energy);
                resolve();
            }));
        });
        moveEt.emit(MatchMove.STARTED);
        this.move(index, direction, sinqed);
    }

    private move(fromMatchIndex: Vec2, direction: MatchDirection, sinqed: Promise<void>) {
        const toMatchIndex = applyDirectionToVec2(fromMatchIndex, direction);

        const fromSlot = this.matchGrid.slots[fromMatchIndex.x][fromMatchIndex.y];
        const toSlot = this.matchGrid.slots[toMatchIndex.x][toMatchIndex.y];

        const fromSlotUITransform = fromSlot.getComponent(UITransform);
        const toSlotUITransform = toSlot.getComponent(UITransform);

        const fromElement = fromSlot.element;
        const toElement = toSlot.element;

        const fromToTween = this.elementMoveTween(fromElement.node, toElement.node.position, fromSlotUITransform, toSlotUITransform);
        const toFromTween = this.elementMoveTween(toElement.node, fromElement.node.position, toSlotUITransform, fromSlotUITransform); 

        Promise.all([
            tweenWithPromiseCall(fromToTween),
            tweenWithPromiseCall(toFromTween),
            sinqed
        ]).then(() => {
            fromSlot.set(toElement);
            toSlot.set(fromElement);

            moveEt.emit(MatchMove.SUCCESS, fromMatchIndex, toMatchIndex);
        }).catch(() => {
            Tween.stopAllByTag(swapTweenTag);

            fromSlot.set(fromElement);
            toSlot.set(toElement);

            moveEt.emit(MatchMove.FAILED)
        });
    }

    private block() {
        this._blocked = true;
    }

    private unblock() {
        this._blocked = false;
    }

    private elementMoveTween(targetNode: Node, toPostion: Vec3, fromUIScope: UITransform, toUIScope: UITransform): Tween<Vec3> {
        const toLocalPos = convertLocalToOtherLocal(toPostion, fromUIScope, toUIScope);

        return tween(targetNode.position)
        .to(
            this.moveTime, 
            toLocalPos,
            {
                easing: "backOut",
                onUpdate(target: Vec3, ratio) {
                    targetNode.setPosition(target);
                },
            }
        ).tag(swapTweenTag);
    }
}


