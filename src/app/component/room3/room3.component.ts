import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from "three"
import { SphereBufferGeometry } from '../../js/SphereBufferGeometry';
import { inside, uvToVector3 } from '../../class/point-utils';
import { HotPolygonService } from '../../service/hot-polygon/hot-polygon.service';
import { HotPolygon } from '../../model/hot-polygon';
import { Point } from '../../model/point';


@Component({
  selector: 'app-room3',
  templateUrl: './room3.component.html',
  styleUrl: './room3.component.css'
})
export class Room3Component implements AfterViewInit, OnDestroy {

  @ViewChild("canvas") cnv: ElementRef | undefined
  @ViewChild("info") info_: ElementRef | undefined

  camera: any; 
  scene: THREE.Scene | undefined
  renderer: THREE.WebGLRenderer | undefined
  e: any
  sphere: THREE.Mesh | undefined

  lon: number = 0; lat: number = 0 

  mouseDown: any;
  rectStart: any; 

  mouse: any; 
  raycaster: THREE.Raycaster | undefined;
  canvas: HTMLCanvasElement | undefined; 
  texture: THREE.Texture | undefined
  info: HTMLDivElement | undefined

  npoint = 1

  constructor(
    private svcHP: HotPolygonService
  ) {

    const point = {x: 50, y: 50}
    const vs = [
      {x: 0, y: 0}, 
      {x: 100, y: 0}, 
      {x: 100, y: 100}, 
      {x: 0, y: 100}, 
      // {x: 0, y: 0}, 
    ]
    const is_inside = inside(point, vs)
    console.log("Room3Component::constructor", is_inside)
  }

  ngAfterViewInit(): void {

    if(!this.isWebGLSupported()) {
      console.error("isWebGLSupported() == false")
      return
    }
    else {
      console.log("isWebGLSupported() == true")
    }

    this.info = this.info_?.nativeElement

    this.mouseDown = {};
    this.rectStart = {};
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
 
    this.init({
      texture: "assets/img/jevL9av.jpeg",  //"https://i.imgur.com/jevL9av.jpg",
      stencil: "assets/img/NUKbrbl.png", // "https://i.imgur.com/NUKbrbl.png",
    })
  }

  ngOnDestroy(): void {
    removeEventListener('mousedown', this.onPointerStart);
    removeEventListener('mousemove', this.onPointerMove);
    removeEventListener('mouseup', this.onPointerUp);
    removeEventListener('wheel', this.onDocumentMouseWheel);
    removeEventListener('touchstart', this.onPointerStart);
    removeEventListener('touchmove', this.onPointerMove);
    removeEventListener('touchend', this.onPointerUp);
    removeEventListener('resize', this.onWindowResize);
  }

  // Отобразить все hp
  displayHP() {

    // Сначала все удаляем
    this.sphere?.children.forEach(ch => {ch.parent?.remove(ch)})

    // Затем добавляем
    for(let hp of this.svcHP.getHP()) {

      if(!hp.points.length)
        continue

      // Отталкиваемся от статуса
      const status = hp.status

      // Обычный
      if(status === "") {
    
        // Из точек формируем полигон
        const points: THREE.Vector3[] = []
        hp.points.forEach(p => points.push(uvToVector3(this.sphere!, this.xyTouv(p)!)!))

        // Формируем замыкание
        points.push(uvToVector3(this.sphere!, this.xyTouv(hp.points[0])!)!)

        const material = new THREE.LineBasicMaterial({
          color: 0xF8FA19,  // yellow
          linewidth: 3
        });    

        // Формируем объект
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.sphere!.add(new THREE.Line(geometry, material))      
      }

    }
  }

  isWebGLSupported () {
    const test = document.createElement('canvas');
    const ok = !!(window.WebGLRenderingContext && test.getContext('webgl'));
    test.remove()
    return ok
  };

  init(json: any) {

    // Сцена
    this.scene = new THREE.Scene();
    
    // Камера
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    // Сфера с изображением
    const geometry = new SphereBufferGeometry(500, 60, 40)// , 0, 1.39, 1.23, 0.30); //)
    geometry.scale(-1, 1, 1);

    this.texture = new THREE.TextureLoader().load(json.texture)
    const material = new THREE.MeshBasicMaterial( { map: this.texture} )
    this.sphere = new THREE.Mesh( geometry, material )

    
    this.scene.add(this.sphere!)

    this.renderer = new THREE.WebGLRenderer({canvas: this.cnv?.nativeElement});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(innerWidth, innerHeight);
    console.log("this.renderer.domElement", this.renderer.domElement)

    addEventListener('mousedown', this.onPointerStart.bind(this));
    addEventListener('mousemove', this.onPointerMove.bind(this));
    addEventListener('mouseup', this.onPointerUp.bind(this));
    addEventListener('wheel', this.onDocumentMouseWheel.bind(this));
    addEventListener('touchstart', this.onPointerStart.bind(this));
    addEventListener('touchmove', this.onPointerMove.bind(this));
    addEventListener('touchend', this.onPointerUp.bind(this));
    addEventListener('resize', this.onWindowResize.bind(this));
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    let phi = THREE.MathUtils.degToRad( 90 - this.lat );
    let theta = THREE.MathUtils.degToRad( this.lon );
    this.camera.target.x = 0.001*Math.sin(phi)*Math.cos(theta);
    this.camera.target.y = 0.001*Math.cos(phi);
    this.camera.target.z = 0.001*Math.sin(phi)*Math.sin(theta);
    this.camera.lookAt(this.camera.target);
    this.e && this.raycast(this.e);
    this.renderer!.render(this.scene!, this.camera);
  }

  getSphereCoord(clientX, clientY) {
    var rect = this.renderer!.domElement.getBoundingClientRect();
    var x = (clientX - rect.left)/rect.width,
        y = (clientY - rect.top)/rect.height;

    this.mouse.set(x*2 - 1, 1 - y*2);
    this.raycaster!.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster!.intersectObjects( this.scene!.children );
    return intersects[0].point;
  }

  getUVCoord(clientX, clientY) {
    var rect = this.renderer!.domElement.getBoundingClientRect();
    var x = (clientX - rect.left)/rect.width,
        y = (clientY - rect.top)/rect.height;

    this.mouse.set(x*2 - 1, 1 - y*2);
    this.raycaster!.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster!.intersectObjects( this.scene!.children );
    return intersects[0].uv;
  }

  raycast(event) {

    var rect = this.renderer!.domElement.getBoundingClientRect();
    var x = (event.clientX - rect.left)/rect.width,
        y = (event.clientY - rect.top)/rect.height;

    this.mouse.set(x*2 - 1, 1 - y*2);
    this.raycaster!.setFromCamera(this.mouse, this.camera);

    this.info!.innerText = ""
    
    const x2 = event.clientX || event.touches[0].clientX;
    const y2 = event.clientY || event.touches[0].clientY;  
    
    // Получаем пересечения
    var intersects = this.raycaster!.intersectObjects( this.scene!.children );
    if(!intersects || !intersects[0] || !intersects[0].uv?.y)
      return

    // Получаем точку в координатах исходника
    const p = this.uvToxy(intersects[0].uv!)
    const p2 = this.uvToxy(this.getUVCoord(x2, y2)!)

    // console.log("raycast(event)", intersects[0].uv, p)
    // return 

    // Ищем ту область, в которой у нас точка
    for(let hp of this.svcHP.getHP()) {
      
      if(!inside(p, hp.points))
        continue

      // console.log("raycast(event):hp", p, p2, hp)
      this.info!.innerText = hp.comment || ""
      break
    }

  }

  onPointerMove( event ) {

    this.raycast(this.e = event);
    if (!this.mouseDown.x) return;

    // console.log("onPointerMove", this.camera.position, this.camera.target)

    let clientX = event.clientX || event.touches[0].clientX;
    let clientY = event.clientY || event.touches[0].clientY;
    this.lon = (this.mouseDown.x - clientX)*this.camera.fov/600 + this.mouseDown.lon;
    this.lat = (clientY - this.mouseDown.y)*this.camera.fov/600 + this.mouseDown.lat;
    this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
  }

  onPointerStart( event ) {

    if(event.ctrlKey) {
      this.rectStart.x = event.clientX || event.touches[ 0 ].clientX;
      this.rectStart.y = event.clientY || event.touches[ 0 ].clientY;
      this.rectStart.lon = this.lon;
      this.rectStart.lat = this.lat;

      // var vector = new THREE.Vector3( this.rectStart.x, this.rectStart.y, -1 ).unproject( this.camera );
      // console.log("ctrl-from", vector)
      return
    }
    this.mouseDown.x = event.clientX || event.touches[ 0 ].clientX;
    this.mouseDown.y = event.clientY || event.touches[ 0 ].clientY;
    this.mouseDown.lon = this.lon;
    this.mouseDown.lat = this.lat;
  }

  onWindowResize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer!.setSize( innerWidth, innerHeight );
  }

  onPointerUp(event) {
    this.mouseDown.x = null;
    if(event.ctrlKey && this.rectStart.x) {

      // Формируем прямоугольник
      const points = this.buildRectXY(event)
      console.log("onPointerUp(event)", points)

      // Добавляем его к списку HP
      this.svcHP.addHP(points, `rect ${this.npoint}`)
      this.npoint += 1

      // Перерисовываем 
      this.displayHP()
    }
    this.rectStart.x = null;
  }

  buildRect1(event) {

    const material = new THREE.LineBasicMaterial({
      color: 0xFF65FC,
      linewidth: 3
    });

    const x = this.rectStart.x
    const y = this.rectStart.y
    const x2 = event.clientX || event.touches[0].clientX;
    const y2 = event.clientY || event.touches[0].clientY;

    // Используем точки от кликов
    const points: THREE.Vector3[] = []
    points.push(this.getSphereCoord(x, y))
    points.push(this.getSphereCoord(x2, y))
    points.push(this.getSphereCoord(x2, y2))
    points.push(this.getSphereCoord(x, y2))
    points.push(this.getSphereCoord(x, y))

    // // Формируем объект
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const objLast = new THREE.Line(geometry, material);
    console.log("onPointerUp() build line", objLast)
    this.sphere!.add(objLast)

  }

  buildRect2(event) {

    const material = new THREE.LineBasicMaterial({
      color: 0xF8FA19,
      linewidth: 3
    });

    const x = this.rectStart.x
    const y = this.rectStart.y
    const x2 = event.clientX || event.touches[0].clientX;
    const y2 = event.clientY || event.touches[0].clientY;

    // Используем точки от кликов
    const points: THREE.Vector3[] = []
    points.push(uvToVector3(this.sphere!, this.getUVCoord(x, y)!)!)
    points.push(uvToVector3(this.sphere!, this.getUVCoord(x2, y)!)!)
    points.push(uvToVector3(this.sphere!, this.getUVCoord(x2, y2)!)!)
    points.push(uvToVector3(this.sphere!, this.getUVCoord(x, y2)!)!)
    points.push(uvToVector3(this.sphere!, this.getUVCoord(x, y)!)!)

    // // Формируем объект
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const objLast = new THREE.Line(geometry, material);
    console.log("onPointerUp() build line", objLast)
    this.sphere!.add(objLast)
  }

  buildRectXY(event): Point[] {

    const x = this.rectStart.x
    const y = this.rectStart.y
    const x2 = event.clientX || event.touches[0].clientX;
    const y2 = event.clientY || event.touches[0].clientY;

    // Используем точки от кликов
    const points: Point[] = []
    points.push(this.uvToxy(this.getUVCoord(x, y)!)!)
    points.push(this.uvToxy(this.getUVCoord(x2, y)!)!)
    points.push(this.uvToxy(this.getUVCoord(x2, y2)!)!)
    points.push(this.uvToxy(this.getUVCoord(x, y2)!)!)

    return points
  }

  uvToxy(uv: THREE.Vector2): Point {

    const data = this.texture?.source.data
    // console.log("uvToxy texture", data.height, data.width)

    const y = Math.floor((1-uv.y)*data!.height);
    const x = Math.floor(uv.x*data!.width);
    return {x, y} as Point 
  }

  xyTouv(xy: Point): THREE.Vector2 {

    const data = this.texture?.source.data
    // console.log("xyTouv texture", data.height, data.width)

    const ux = xy.x / data!.width
    const uy = 1 - xy.y / data!.height
    return new THREE.Vector2(ux, uy) 
  }

  onDocumentMouseWheel( event ) {
    let fov = this.camera.fov + event.deltaY * 0.05;
    this.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    // console.log("onDocumentMouseWheel( event ) - begin", event, this.camera.fov)
    this.camera.updateProjectionMatrix();
    // console.log("onDocumentMouseWheel( event ) - end", event, this.camera.fov)
  }
}
