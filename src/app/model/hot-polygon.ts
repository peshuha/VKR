import { Point } from "./point";

export interface HotPolygon {
    id: string
    points: Point[]
    comment: string
    status: string
}