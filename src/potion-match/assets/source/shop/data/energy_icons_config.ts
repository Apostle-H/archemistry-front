import { EventTarget, JsonAsset, resources, sp, SpriteFrame } from "cc"

export const loadedEnergyIconsEt = new EventTarget();

export abstract class EnergyIconsConfig {
    private static _codeIconsMap: Map<number, SpriteFrame> = new Map(); 

    private static _loaded: boolean;

    public static get loaded() {
        return this._loaded;
    }

    public static getSpriteByCode(code: number): SpriteFrame {
        return this._codeIconsMap.get(code);
    }

    public static load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load("shop/configs/energy-icons-config", JsonAsset, (err, config) => {
                const mapPromises: Promise<void>[] = []
                for (const icon of config.json.icons) {
                    mapPromises.push(this.mapIcon(icon.code, icon.sprite_path));
                }
    
                Promise.all(mapPromises).then(() => {
                    this._loaded = true;
                    loadedEnergyIconsEt.emit(true.toString());

                    resolve();
                }).catch(() => {
                    reject();
                });
            });
        });
    }

    private static mapIcon(code: number, spritePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(spritePath, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    reject();
                    return;
                }

                this._codeIconsMap.set(code, spriteFrame);
                resolve();
            });
        })
    }
}