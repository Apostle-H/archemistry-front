import { EventTarget } from "cc";
import { WebUtils } from "../utils/web_utils";

export const softUpdatedEt = new EventTarget();
export const hardUpdatedEt = new EventTarget();
export const scoreUpdatedEt = new EventTarget();
export const energyUpdatedEt = new EventTarget();

export class UserGameState {
    private _softCurrency: number;
    private _hardCurrency: number;
    private _score: number;
    private _energy: number;
    private _maxEnergy: number;
    
    public get softCurrency() {
        return this._softCurrency;
    }

    public get hardCurrency() {
        return this._softCurrency;
    }

    public get score() {
        return this._score;
    }

    public get energy() {
        return this._energy;
    }

    public get maxEnergy() {
        return this._maxEnergy;
    }

    public load(): Promise<void> {
        return WebUtils.get_with_auth("/user/state").then((response: Response) => response.json().then((json) => {
            this.updateHard(json.hard);
            this.updateSoft(json.soft);
            this.updateScore(json.score);
            this.updateEnergy(json.energy, json.max_energy);
        }))
    }

    public updateSoft(value: number) {
        this._softCurrency = value;
        softUpdatedEt.emit(true.toString(), this._softCurrency);
    }

    public updateHard(value: number) {
        this._hardCurrency = value;
        hardUpdatedEt.emit(true.toString(), this._hardCurrency);
    }

    public updateScore(value: number) {
        this._score = value;
        scoreUpdatedEt.emit(true.toString(), this._score);
    }

    public updateEnergy(value: number, maxValue: number = -1) {
        this._energy = value;
        if (maxValue > 0) {
            this._maxEnergy = maxValue;
        }

        energyUpdatedEt.emit(true.toString(), this._energy, this._maxEnergy);
    }
}

export const userGameState = new UserGameState();