import { Component, _decorator, EventTarget, Node } from "cc";
import { WebUtils } from "../utils/web_utils";
import { MatchConfigsLoader } from "../match/data/match_config_loader";
import { userGameState } from "../user/user_game_state";
import { EnergySinqer } from "../user/energy/energy_sinqer";
import { coreStateMachine } from "./state_machine/core_state_machine";
import { CoreState } from "./state_machine/data/core_states";
import { TasksIconsConfig } from "../tasks/data/tasks_icons_config";
import { HapticTg } from "../haptic/haptic_tg";
import { EnergyIconsConfig } from "../shop/data/energy_icons_config";
const { ccclass, property } = _decorator

@ccclass("bootstrapper")
export class Bootstrapper extends Component {
    @property({type: Node})
    private preloader: Node;
    @property({type: EnergySinqer})
    private energySinqer: EnergySinqer;

    protected onLoad() {
        WebUtils.authorizedEt.once(true.toString(), this.load, this);
        TasksIconsConfig.load();
        EnergyIconsConfig.load();

        this.bind();
    }

    protected onEnable() {
        WebUtils.auth();
    }

    protected onDestroy() {
        this.expose();
    }

    private load() {
        coreStateMachine.start(CoreState.MAIN);
        this.energySinqer.launch();

        Promise.all([
            userGameState.load(),
            MatchConfigsLoader.load(),
            new Promise<void>((resolve) => {
                setTimeout(resolve, 1000);
            })
        ]).then(() => {
            this.preloader.active = false;
        })
    }

    private bind() {
        HapticTg.bind();
    }

    private expose() {
        HapticTg.expose();
    }
}