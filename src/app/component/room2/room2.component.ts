import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from "three"
import { SphereBufferGeometry } from '../../js/SphereBufferGeometry'

@Component({
  selector: 'app-room2',
  templateUrl: './room2.component.html',
  styleUrl: './room2.component.css'
})
export class Room2Component implements AfterViewInit, OnDestroy {

  @ViewChild("canvas") cnv: ElementRef | undefined

  camera: any; 
  scene: THREE.Scene | undefined
  renderer: THREE.WebGLRenderer | undefined
  mesh: any; material: any; e: any
  sphere: THREE.Mesh | undefined

  objects: any
  uv: any
  info: any
  lon: number = 0; lat: number = 0 

  mouseDown: any;
  rectStart: any; 

  mouse: any; 
  raycaster: THREE.Raycaster | undefined;
  canvas: HTMLCanvasElement | undefined; imgData: any; ctx: any

  // Last mesh Added
  objLast: THREE.Object3D | undefined

  ngAfterViewInit(): void {

    if(!this.isWebGLSupported()) {
      console.error("isWebGLSupported() == false")
      return
    }
    else {
      console.log("isWebGLSupported() == true")
    }

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

    this.material = new THREE.Material()
    this.material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load(json.texture) } )
    this.sphere = new THREE.Mesh( geometry, this.material )

    
    this.scene.add(this.sphere!)

    this.renderer = new THREE.WebGLRenderer({canvas: this.cnv?.nativeElement});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(innerWidth, innerHeight);
    console.log("this.renderer.domElement", this.renderer.domElement)

    this.info = document.createElement('div');
    this.info.id = 'info';
    document.body.append(this.info);

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

  raycast(event) {

    var rect = this.renderer!.domElement.getBoundingClientRect();
    var x = (event.clientX - rect.left)/rect.width,
        y = (event.clientY - rect.top)/rect.height;

    this.mouse.set(x*2 - 1, 1 - y*2);
    this.raycaster!.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster!.intersectObjects( this.scene!.children );
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

      if(this.objLast) {

        // Удаляем предыд объект
        this.objLast.parent!.remove(this.objLast)
        this.objLast = undefined
      }

      // Формируем прямоугольник
      const material = new THREE.LineBasicMaterial({
        color: 0xFF65FC,
        linewidth: 3
      });

      const x = this.rectStart.x
      const y = this.rectStart.y
      const x2 = event.clientX || event.touches[ 0 ].clientX;
      const y2 = event.clientY || event.touches[ 0 ].clientY;

      // Используем точки от кликов
      const points: THREE.Vector3[] = []
      points.push(this.getSphereCoord(x, y))
      points.push(this.getSphereCoord(x2, y))
      points.push(this.getSphereCoord(x2, y2))
      points.push(this.getSphereCoord(x, y2))
      points.push(this.getSphereCoord(x, y))

      // // Формируем объект
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      this.objLast = new THREE.Line(geometry, material);
      console.log("onPointerUp() build line", this.objLast)
      this.sphere!.add(this.objLast)
      // return
    }
    this.rectStart.x = null;
  }

  onDocumentMouseWheel( event ) {
    let fov = this.camera.fov + event.deltaY * 0.05;
    this.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    // console.log("onDocumentMouseWheel( event ) - begin", event, this.camera.fov)
    this.camera.updateProjectionMatrix();
    // console.log("onDocumentMouseWheel( event ) - end", event, this.camera.fov)
  }
}
