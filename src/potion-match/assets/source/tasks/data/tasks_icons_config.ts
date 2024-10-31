import { EventTarget, JsonAsset, resources, SpriteFrame } from "cc";

export const loadedTasksIconsEt = new EventTarget();

export abstract class TasksIconsConfig {
    private static _typeIconMap: Map<number, SpriteFrame> = new Map()

    private static _loaded: boolean;

    public static get loaded() {
        return this._loaded;
    }

    public static getIconByType(type: number): SpriteFrame {
        return this._typeIconMap.get(type);
    }

    public static load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load("tasks/configs/tasks-icons-config", JsonAsset, (err, config) => {
                const mapPromises: Promise<void>[] = [];
                for (const icon of config.json.icons) {
                    mapPromises.push(this.mapIcon(icon.type, icon.sprite_path));
                }
    
                Promise.all(mapPromises).then(() => {
                    this._loaded = true;
                    loadedTasksIconsEt.emit(true.toString());

                    resolve();
                }).catch(() => {
                    reject();
                });
            });
        });
    }

    private static mapIcon(type: number, iconPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(iconPath, SpriteFrame, (err, sprite) => {
                if (err) {
                    reject();
                    return;
                }

                this._typeIconMap.set(type, sprite);
                resolve();
            })
        });
    }
}