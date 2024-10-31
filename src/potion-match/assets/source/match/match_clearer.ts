import { _decorator, Node, Component, tween, Tween, Vec2, Vec3, UITransform, instantiate, CCFloat, EventTarget, tiledLayerAssembler } from 'cc';
import { WebUtils } from '../utils/web_utils';
import { matchElementsPool, matchGridConfig } from './data/match_config_loader';
import { MatchClearOut } from './data/views/match_clear_out';
import { MatchGrid, matchGridLoadedEt } from './match_grid';
import { moveEt } from './match_mover';
import { convertLocalToOtherLocal } from '../utils/ui/funcs';
import { tweenWithPromiseCall as startTweenWithPromiseCall } from '../utils/tweening/funcs';
import { MatchElement } from './match_element';
import { MatchClear } from './data/enums/match_clear';
import { MatchMove } from './data/enums/match_move';
import { coreStateEt } from '../core/state_machine/core_state_machine';
import { CoreState } from '../core/state_machine/data/core_states';
import { StateAction } from '../utils/state_machine/data/state_action';
import { userGameState } from '../user/user_game_state';
import { eventTargetWithPormise, promiseAny } from '../utils/async/funcs';
const { ccclass, property } = _decorator;

export const clearEt = new EventTarget();

@ccclass('match-clearer')
export class MatchClearer extends Component {
    @property({type: MatchGrid})
    private matchGrid: MatchGrid;

    @property({type: UITransform})
    private matchElementsSpawn: UITransform;

    @property({type: CCFloat})
    private fallDelayTime: number;
    @property({type: CCFloat})
    private fallTime: number;

    protected onLoad() {
        coreStateEt.on(CoreState.MAIN, this.bindExpose, this);
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
        matchGridLoadedEt.once(true.toString(), this.checkLoaded, this);
        moveEt.on(MatchMove.SUCCESS, this.checkMoved, this);
    }

    private expose() {
        moveEt.off(MatchMove.SUCCESS, this.checkMoved, this);
    }

    private checkLoaded() {
        let gridIndexes = [].concat(...this.matchGrid.slots).map((slot) => slot.index);
        this.checkClear(gridIndexes);
    }

    private checkMoved(fromMatchIndex: Vec2, toMatchIndex: Vec2) {
        this.checkClear([fromMatchIndex, toMatchIndex]);
    }

    private checkClear(targetIndexes: Vec2[]) { // DO NOT RENAME "clusters"
        let gridState = this.matchGrid.slots.map((slotsRow) => slotsRow.map((slot) => slot.element.targetId));
        let clusters: Vec2[][] = []
        for (const targetIndex of targetIndexes) {
            matchGridConfig.checkFromIndex(targetIndex, gridState).forEach((set) => {
                for (const cluster of clusters) {
                    if (set.every((pos) => cluster.some((clusterPos) => clusterPos.equals(pos)))) {
                        return;
                    }
                }

                clusters.push(set);
            })
        }
        clusters = clusters.filter((cluster) => cluster.length > 0);
        if (clusters.length < 1) {
            clearEt.emit(MatchClear.EMPTY);
            return;
        }

        clearEt.emit(MatchClear.STARTED);
        WebUtils.post_with_auth("/match/clear", { clusters }).then((response) => response.json().then((json) => {
            const clearOut: MatchClearOut = json;

            if (clearOut.refresh_pos.length < 1) {
                clearEt.emit(MatchClear.CLEARED);
                return;
            }

            const clearedClusters = clusters.filter((cluster, index) => clearOut.results[index]);
            const clearedPos = [].concat(...clearedClusters);

            const slotsElementsIds: Map<string, string> = new Map<string, string>();
            for (const refreshPos of clearOut.refresh_pos) {
                slotsElementsIds.set(`${refreshPos.pos.x}-${refreshPos.pos.y}`, refreshPos.element_id);
            } 

            userGameState.updateSoft(clearOut.soft);
            userGameState.updateScore(clearOut.score);
            this.clear(clearedPos, slotsElementsIds);
        }))
    }

    private clear(clearedIndexes: Vec2[], slotsElementsIds: Map<string, string>) {
        const clearedColumns: Record<number, [number, number]> = {};
        const affectedPos: Vec2[] = [];
        for (const clearedIndex of clearedIndexes) {
            if (clearedIndex.x in clearedColumns) {
                if (clearedIndex.y < clearedColumns[clearedIndex.x][0]) {
                    clearedColumns[clearedIndex.x][0] = clearedIndex.y;
                    affectedPos.push(clearedIndex.clone())
                } else if (clearedIndex.y > clearedColumns[clearedIndex.x][1] - 1) {
                    clearedColumns[clearedIndex.x][1] = clearedIndex.y + 1;
                }
            } else {
                clearedColumns[clearedIndex.x] = [clearedIndex.y, clearedIndex.y + 1];

                for (let y = clearedIndex.y; y < matchGridConfig.size.y; y++) {
                    affectedPos.push(new Vec2(clearedIndex.x, y));    
                }
            }
        }

        const fallTweens: Tween<Vec3>[] = [];
        
        for (const columnKey in clearedColumns) {
            const column = columnKey as unknown as number;
            const clearLenght = clearedColumns[column][1] - clearedColumns[column][0];
            for (let y = clearedColumns[column][0]; y < matchGridConfig.size.y; y++) {
                const targetSlot = this.matchGrid.slots[column][y];
                let newElementUIScope: UITransform;
                let newElement: MatchElement;

                if (y < clearedColumns[columnKey][1]) {
                    promiseAny([
                        targetSlot.element.clear(), 
                        eventTargetWithPormise(coreStateEt, CoreState.MAIN, (value, resolve) => resolve())
                    ]).then(() => matchElementsPool.put(targetSlot.element.targetId, targetSlot.element));
                }

                if (y + clearLenght < matchGridConfig.size.y) {
                    const fromSlot = this.matchGrid.slots[column][y + clearLenght];
                    newElementUIScope = fromSlot.getComponent(UITransform);
                    newElement = fromSlot.element;
                } else {
                    newElementUIScope = this.matchElementsSpawn;

                    const newElementId = slotsElementsIds.get(`${column}-${y}`);
                    newElement = matchElementsPool.get(newElementId);
                    newElement.node.setParent(this.matchElementsSpawn.node);
                    newElement.node.setPosition(new Vec3());
                }

                const fallTween = this.elementFallTween(
                    newElement.node, 
                    targetSlot.element.node.position,
                    newElementUIScope,
                    targetSlot.getComponent(UITransform)
                )
                .call(() => {
                    targetSlot.set(newElement)
                });


                fallTweens.push(fallTween);
            }
        }

        const fallTweensWithPromises = fallTweens.map((fallTween) => startTweenWithPromiseCall(fallTween));
        promiseAny([
            new Promise<void>((resolve, reject) => Promise.all(fallTweensWithPromises).then(() => resolve()).catch(() => reject())), 
            eventTargetWithPormise(coreStateEt, CoreState.MAIN, (value, resolve) => {
                if (value == StateAction.ENTER) {
                    resolve();
                }
            })
        ]).then(() => this.checkClear(affectedPos));
    }

    private elementFallTween(targetNode: Node, toPostion: Vec3, fromUIScope: UITransform, toUIScope: UITransform): Tween<Vec3> {
        const toLocalPos = convertLocalToOtherLocal(toPostion, fromUIScope, toUIScope);
        targetNode.setPosition(new Vec3(toLocalPos.x))

        return tween(targetNode.position)
        .delay(this.fallDelayTime)
        .to(
            this.fallTime, 
            toLocalPos,
            {
                easing: "quartOut",
                onUpdate(target: Vec3, ratio) {
                    targetNode.setPosition(target);
                },
            }
        );
    }
}


