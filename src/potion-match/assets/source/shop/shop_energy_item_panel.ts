import { Button, Component, EventHandler, RichText, EventTarget, Sprite, _decorator, Node, UITransform } from "cc";
import { ShopEnergyItemOut } from "./data/view/shop_energy_item_out";
import { EnergyIconsConfig } from "./data/energy_icons_config";
const { ccclass, property } = _decorator;

export const buyEnergyItemEt = new EventTarget();

@ccclass("shop-energy-item-panel")
export class ShopEnergyItemPanel extends Component {
    @property({type: Sprite})
    private iconSpite: Sprite;
    @property({type: RichText})
    private amountLabel: RichText;
    @property({type: RichText})
    private costLabel: RichText;
    @property({type: Button})
    private buyButton: Button;
    @property({type: UITransform})
    private amountLabelUITransform: UITransform;

    private _buyEventHandler: EventHandler = new EventHandler();

    private _targetEnergyItem: ShopEnergyItemOut;

    protected onLoad() {
        this._buyEventHandler.target = this.node;
        this._buyEventHandler.component = "shop-energy-item-panel";
        this._buyEventHandler.handler = "buy";
    }

    public bind() {
        this.buyButton.clickEvents.push(this._buyEventHandler);

        this.amountLabel.node.on(Node.EventType.SIZE_CHANGED, this.updateSizes, this);
    }

    public expose() {
        const buyIndex = this.buyButton.clickEvents.indexOf(this._buyEventHandler);
        this.buyButton.clickEvents.splice(buyIndex, 1);

        this.amountLabel.node.off(Node.EventType.SIZE_CHANGED, this.updateSizes, this);
    }

    public updateData(targetEnergyItem: ShopEnergyItemOut) {
        this._targetEnergyItem = targetEnergyItem;

        this.iconSpite.spriteFrame = EnergyIconsConfig.getSpriteByCode(targetEnergyItem.type);
        this.amountLabel.string = `${targetEnergyItem.amount}<img src='energy_icon' width=${this.amountLabel.fontSize} height=${this.amountLabel.fontSize} align=center />`;
        this.costLabel.string = `${targetEnergyItem.cost}<img src='soft_icon' width=${this.costLabel.fontSize} height=${this.costLabel.fontSize} align=center />`;
    }

    public updateSizes() {
        this.amountLabel.maxWidth = this.amountLabelUITransform.width;
    }

    private buy() {
        buyEnergyItemEt.emit(true.toString(), this._targetEnergyItem.type);
    }
}