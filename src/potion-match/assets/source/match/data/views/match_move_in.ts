import { Vec2 } from "cc";
import { SimpleVec2 } from "../../../utils/types/simple_vec2";
import { MatchDirection } from "../enums/match_direction"

export class MatchMoveIn {
    pos: SimpleVec2;
    direction: MatchDirection;

    public constructor(posX: number, posY: number, direction: MatchDirection) {
        this.pos = new Vec2(posX, posY) ;
        this.direction = direction;
    }
}