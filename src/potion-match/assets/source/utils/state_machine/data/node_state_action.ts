import { CCBoolean, Node, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("node-state-action")
export class NodeStateAction {
    @property({type: Node})
    public Node: Node;
    @property
    public ActiveOnEnter: boolean = false;
}