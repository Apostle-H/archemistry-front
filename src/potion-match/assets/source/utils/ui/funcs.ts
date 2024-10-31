import { EventTouch, Node, UITransform, Vec3 } from "cc";

export function convertLocalToOtherLocal(toPosition: Vec3, targetUITransform: UITransform, toUITransform: UITransform): Vec3 {
    const toWorldPos = toUITransform.convertToWorldSpaceAR(toPosition);
    return targetUITransform.convertToNodeSpaceAR(toWorldPos);
}

export function inBounds(target: UITransform, event: EventTouch): Boolean {
    let touchLocation = event.getUILocation();
    let boundingBox = target.getBoundingBoxToWorld();

    return boundingBox.contains(touchLocation)
}