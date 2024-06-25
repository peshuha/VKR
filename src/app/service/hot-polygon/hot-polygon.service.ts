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

  getHP() {
    return this.hps
  }

  addHP(points: Point[], comment?: string): HotPolygon {

    comment = comment || ""

    const hp: HotPolygon = {
      id: uuidv4(),
      points,
      comment,
      status: ""
    }

    this.hps.push(hp)
    console.log("addHP()", this.hps)
    return hp
  }

  removeHP(id: string): void {
    this.hps = this.hps.filter(hp => hp.id !== id)
  }

  changeHP(hp: HotPolygon): void {
    this.hps = this.hps.map(p => p.id === hp.id ? hp : p)
  }

}
