import { Point } from "./point";

export interface HotPolygon {
    id: string
    points: Point[]
    segments?: Point[][]
    comment: string
    status: string
}