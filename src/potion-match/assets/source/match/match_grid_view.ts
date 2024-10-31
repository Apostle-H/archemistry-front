import { _decorator, Component, EventTarget, instantiate, Prefab } from 'cc';
import { matchGridConfig, matchConfigsLoadedEt } from './data/match_config_loader';
const { ccclass, property } = _decorator;

export const matchGridLoadedEt = new EventTarget();

@ccclass('match-grid-view')
export class MatchGridView extends Component {
    @property({type: Prefab})
    private slotView: Prefab = null;

    protected onLoad(): void {
        matchConfigsLoadedEt.once(true.toString(), this.loadSlots, this)
    }

    private loadSlots() {
        for (let x = 0; x < matchGridConfig.size.x; x++) {
            for (let y = 0; y < matchGridConfig.size.y; y++) {
                let new_slot = instantiate(this.slotView)
                new_slot.setParent(this.node)
            }
        }
    }
}


