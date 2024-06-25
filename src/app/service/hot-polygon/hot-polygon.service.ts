import { Injectable } from '@angular/core';
import { HotPolygon } from '../../model/hot-polygon';
import { Point } from '../../model/point';
import { v4 as uuidv4 } from 'uuid'

@Injectable({
  providedIn: 'root'
})
export class HotPolygonService {

  hps: HotPolygon[] = []

  constructor() { }

  getHotPolygons() {
    return this.hps
  }

  addHP(points: Point[], comment?: string): HotPolygon {

    comment = comment || ""

    const hp: HotPolygon = {
      id: uuidv4(),
      points,
      comment
    }

    this.hps.push(hp)
    return hp
  }

  removeHP(id: string): void {
    this.hps = this.hps.filter(hp => hp.id !== id)
  }
}
