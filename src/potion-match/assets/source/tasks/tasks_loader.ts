import { Node, Component, Prefab, _decorator, instantiate, JsonAsset } from "cc";
import { StateAction } from "../utils/state_machine/data/state_action";
import { WebUtils } from "../utils/web_utils";
import { DailyTaskOut } from "./data/views/daily_task_out";
import { TaskPanel } from "./task_panel";
import { coreStateEt } from "../core/state_machine/core_state_machine";
import { CoreState } from "../core/state_machine/data/core_states";
import { SocialTaskOut } from "./data/views/social_task_out";
const { ccclass, property } = _decorator;


@ccclass('tasks-loader')
export class TasksLoader extends Component {
    @property({type: Node})
    private dailyHolder;
    @property({type: Node})
    private socialHolder;
    @property({type: Prefab})
    private taskPanelPrefab: Prefab;

    private _dailyTasksPanels: Map<number, TaskPanel> = new Map<number, TaskPanel>()
    private _socialTasksPanels: Map<number, TaskPanel> = new Map<number, TaskPanel>()

    protected onLoad() {
        coreStateEt.on(CoreState.TASKS, this.bindExpose, this);
    }

    protected onDestroy() {
        coreStateEt.off(CoreState.TASKS, this.bindExpose, this);
    }

    private bindExpose(stateAction: StateAction) {
        switch (stateAction) {
            case StateAction.ENTER:
                this.bind();
                this.load();
                break;
            case StateAction.EXIT:
                this.expose();
                break;
        }
    }

    private bind() {
        for (const [_, dailyTaskPanel] of this._dailyTasksPanels) {
            dailyTaskPanel.bind();
        }
        for (const [_, socialTaskPanel] of this._socialTasksPanels) {
            socialTaskPanel.bind();
        }
    }

    private expose() {
        for (const [_, dailyTaskPanel] of this._dailyTasksPanels) {
            dailyTaskPanel.expose();
        }
        for (const [_, socialTaskPanel] of this._socialTasksPanels) {
            socialTaskPanel.expose();
        }
    }

    private load() {
        WebUtils.get_with_auth("/tasks/daily").then((response) => response.json().then((json) => {
            const dailyTasksOut: DailyTaskOut[] = json;

            dailyTasksOut.sort((a, b) => a.type - b.type);

            dailyTasksOut.forEach(dailyTaskOut => {
                if (!this._dailyTasksPanels.has(dailyTaskOut.type)) {
                    const newTaskPanel = instantiate(this.taskPanelPrefab).getComponent(TaskPanel);
                    this._dailyTasksPanels.set(dailyTaskOut.type, newTaskPanel);
                    newTaskPanel.bind();
                    newTaskPanel.node.parent = this.dailyHolder;      
                }

                this._dailyTasksPanels.get(dailyTaskOut.type).updateTask(dailyTaskOut);
            });
        }))

        WebUtils.get_with_auth("/tasks/social").then((response) => response.json().then((json) => {
            const socialTasksOut: SocialTaskOut[] = json;

            socialTasksOut.forEach(socialTaskOut => {
                if (!this._socialTasksPanels.get(socialTaskOut.type)) {
                    const newTaskPanel = instantiate(this.taskPanelPrefab).getComponent(TaskPanel);
                    this._socialTasksPanels.set(socialTaskOut.type, newTaskPanel);
                    newTaskPanel.bind();
                    newTaskPanel.node.parent = this.socialHolder;
                }
                    
                this._socialTasksPanels.get(socialTaskOut.type).updateTask(socialTaskOut);
            });
        }))
    }
}