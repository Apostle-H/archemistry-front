import { _decorator, Component, EventTarget, instantiate, Prefab, Vec2} from 'cc';
import { MatchSlot } from './match_slot';
import { WebUtils } from '../utils/web_utils';
import { MatchUserSlotOut } from './data/views/match_user_slot_out';
import { matchGridConfig, matchConfigsLoadedEt, matchElementsPool } from './data/match_config_loader';
import { coreStateEt, coreStateMachine } from '../core/state_machine/core_state_machine';
import { CoreState } from '../core/state_machine/data/core_states';
import { StateAction } from '../utils/state_machine/data/state_action';
const { ccclass, property } = _decorator;

export const matchGridLoadedEt = new EventTarget();

@ccclass('match-grid')
export class MatchGrid extends Component {
    @property({type: Prefab})
    private slot: Prefab = null;

    private _slots: MatchSlot[][] = [];

    public get slots() {
        return this._slots;
    }

    protected onLoad() {
        matchConfigsLoadedEt.once(true.toString(), this.loadSlots, this);

        coreStateEt.on(CoreState.MAIN, this.bindExpose, this);
    }

    protected onDestroy() {
        coreStateEt.off(CoreState.MAIN, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this.slots.forEach((slotsRow) => slotsRow.forEach((slot) => slot.bind()));
                break;
            case StateAction.EXIT:
                this.slots.forEach((slotsRow) => slotsRow.forEach((slot) => slot.expose()));
                break;
        }
    }

    public setSlot(slotOut: MatchUserSlotOut) {
        let slotElement = matchElementsPool.get(slotOut.element_id);
        this._slots[slotOut.pos.x][slotOut.pos.y].set(slotElement);
    }

    private loadSlots() {
        for (let x = 0; x < matchGridConfig.size.x; x++) {
            this._slots[x] = [];
            for (let y = 0; y < matchGridConfig.size.y; y++) {
                let new_slot = instantiate(this.slot)
                new_slot.setParent(this.node)

                let new_slot_component = new_slot.getComponent(MatchSlot);
                new_slot_component.init(new Vec2(x, y))
                if (coreStateMachine.currentState == CoreState.MAIN) {
                    new_slot_component.bind();
                }

                this._slots[x][y] = new_slot_component;
            }
        }

        WebUtils.get_with_auth("/match/user_all").then((response: Response) => response.json().then((json) => {
            let slotsOut: MatchUserSlotOut[] = json;

            slotsOut.forEach(this.setSlot.bind(this));

            matchGridLoadedEt.emit(true.toString())
        }));
    }
}


