import { Vec2 } from "cc";

export enum MatchDirection {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
}

export function applyToVec2(vec: Vec2, direction: MatchDirection): Vec2 {
    let result: Vec2;
        switch (direction) {
            case MatchDirection.LEFT:
                result = new Vec2(vec.x - 1, vec.y);
                break;
            case MatchDirection.UP:
                result = new Vec2(vec.x, vec.y + 1);
                break;
            case MatchDirection.RIGHT:
                result = new Vec2(vec.x + 1, vec.y);
                break;
            case MatchDirection.DOWN:
                result = new Vec2(vec.x, vec.y - 1);
                break;
        }

    return result;
}

export function directionFromVec2(from: Vec2, to: Vec2): MatchDirection {
    const xDelta = to.x - from.x;
    const yDelta = to.y - from.y;

    if (Math.abs(xDelta) > Math.abs(yDelta)) {
        if (from.x > to.x) {
            return MatchDirection.LEFT;
        } else if (from.x < to.x) {
            return MatchDirection.RIGHT;
        }
    } else {
        if (from.y < to.y) {
            return MatchDirection.UP;
        } else if (from.y > to.y) {
            return MatchDirection.DOWN;
        }
    }
}