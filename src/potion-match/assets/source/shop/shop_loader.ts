import { Component, Node, Prefab, _decorator, instantiate, js } from "cc";
import { buyEnergyItemEt, ShopEnergyItemPanel } from "./shop_energy_item_panel";
import { WebUtils } from "../utils/web_utils";
import { ShopEnergyItemOut } from "./data/view/shop_energy_item_out";
import { fadeClickEt, fadeEt } from "../utils/ui/fade";
import { HapticTg } from "../haptic/haptic_tg";
import { userGameState } from "../user/user_game_state";
const { ccclass, property } = _decorator;


@ccclass("shop-loader")
export class ShopLoader extends Component {
    @property({type: Node})
    private holder: Node;
    @property({type: Prefab})
    private energyItemPanelPrefab: Prefab;

    private _energyItemsPanels: Map<number, ShopEnergyItemPanel> = new Map()

    protected onLoad() {
        this.node.active = false;
    }

    public open() {
        this.node.active = true;
        fadeEt.emit(true.toString());
        this.bind();

        this.load();
    }

    private close() {
        this.node.active = false;
        fadeEt.emit(false.toString());
        this.expose();
    }

    private bind() {
        for (const [_, energyItemPanel] of this._energyItemsPanels) {
            energyItemPanel.bind();
        }
        buyEnergyItemEt.on(true.toString(), this.buy, this);

        fadeClickEt.on(true.toString(), this.close, this);
    }

    private expose() {
        for (const [_, energyItemPanel] of this._energyItemsPanels) {
            energyItemPanel.expose();
        }
        buyEnergyItemEt.off(true.toString(), this.buy, this);

        fadeClickEt.off(true.toString(), this.close, this);
    }

    private load() {
        WebUtils.get_with_auth("/shop/energy").then((response) => response.json().then((json) => {
            const energyItemsOut: ShopEnergyItemOut[] = json;

            energyItemsOut.sort((a, b) => a.type - b.type);

            energyItemsOut.forEach(energyItemOut => {
                if (!this._energyItemsPanels.has(energyItemOut.type)) {
                    const newEnergyPanel = instantiate(this.energyItemPanelPrefab).getComponent(ShopEnergyItemPanel);
                    this._energyItemsPanels.set(energyItemOut.type, newEnergyPanel);
                    newEnergyPanel.bind();
                    newEnergyPanel.node.parent = this.holder;      
                }

                this._energyItemsPanels.get(energyItemOut.type).updateData(energyItemOut);
            });
        }))
    }

    // DO NOT RENAME "type"
    private buy(type: number) {
        WebUtils.post_with_auth("/shop/buy_energy", { type }).then((response) => response.json().then((json) => {
            if (!json.result) {
                HapticTg.error();
                return;
            }

            userGameState.updateSoft(json.soft);
            userGameState.updateEnergy(json.energy);
            HapticTg.success();
        }))
    }
}