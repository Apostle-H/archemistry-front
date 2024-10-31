import { MatchClear } from "../match/data/enums/match_clear";
import { MatchMove } from "../match/data/enums/match_move";
import { clearEt } from "../match/match_clearer";
import { moveEt } from "../match/match_mover";

export abstract class HapticTg {
    public static bind() {
        moveEt.on(MatchMove.SUCCESS, this.light, this);
        moveEt.on(MatchMove.FAILED, this.error, this);

        clearEt.on(MatchClear.STARTED, this.heavy, this);
    }

    public static expose() {
        moveEt.off(MatchMove.SUCCESS, this.light, this);
        moveEt.off(MatchMove.FAILED, this.error, this);

        clearEt.off(MatchClear.STARTED, this.heavy, this);
    }

    public static light() {
        this.impact("light");
    }

    public static heavy() {
        this.impact("heavy");
    }

    private static impact(type: string) {
        if (globalThis.Telegram == null || globalThis.Telegram.WebApp == null) {
            return;
        }

        globalThis.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }

    public static success() {
        this.notification("success");
    }

    public static error() {
        this.notification("error");
    }

    private static notification(type: string) {
        if (globalThis.Telegram == null || globalThis.Telegram.WebApp == null) {
            return;
        }

        globalThis.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
}