import { EventTarget, tiledLayerAssembler } from "cc";
import { CoreState } from "./data/core_states";
import { StateAction } from "../../utils/state_machine/data/state_action";

export const coreSwitchEt = new EventTarget();
export const coreStateEt = new EventTarget();

export class CoreStateMachine {
    private _started: boolean;

    private _currentState: CoreState;

    public get currentState() {
        return this._currentState;
    }

    public start(startState: CoreState) {
        this.switch(startState);
        this._started = true;

        this.bind();
    }

    private bind() {
        coreSwitchEt.on(true.toString(), this.switch, this);
    }
    
    public expose() {
        coreSwitchEt.off(true.toString(), this.switch, this);
    }

    private switch(newState: CoreState) {
        if (this._currentState == newState && this._started) {
            return;
        }
        
        coreStateEt.emit(this._currentState, StateAction.EXIT);
        this._currentState = newState;
        coreStateEt.emit(this._currentState, StateAction.ENTER);
        coreStateEt.emit("any", StateAction.ENTER);
    }
}

export const coreStateMachine = new CoreStateMachine();