import { Component, EventTarget, Node, _decorator } from "cc";
const { ccclass, property } = _decorator;

export const fadeEt: EventTarget = new EventTarget(); 
export const fadeClickEt: EventTarget = new EventTarget(); 

@ccclass('fade')
export class Fade extends Component {
    protected onLoad() {
        this.bind();

        this.hide();
    }

    protected onDestroy() {
        this.expose();
    }

    private bind() {
        fadeEt.on(true.toString(), this.show, this);
        fadeEt.on(false.toString(), this.hide, this);
        this.node.on(Node.EventType.TOUCH_END, this.clicked)
    }
    
    private expose() {
        fadeEt.off(true.toString(), this.show, this);
        fadeEt.off(false.toString(), this.hide, this);
        this.node.off(Node.EventType.TOUCH_END, this.clicked)
    }

    private show() {
        this.node.active = true;
    }

    private hide() {
        this.node.active = false;
    }

    private clicked() {
        fadeClickEt.emit(true.toString())
    }
}