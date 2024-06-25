import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from "three"
import { SphereBufferGeometry } from '../../js/SphereBufferGeometry'

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements AfterViewInit {

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
  ctlmouseDown: any; 
  vectorStart: THREE.Vector3 | undefined
  vectorEnd: THREE.Vector3 | undefined

  mouse: any; 
  raycaster: THREE.Raycaster | undefined;
  canvas: HTMLCanvasElement | undefined; imgData: any; ctx: any

  ngAfterViewInit(): void {

    if(!this.isWebGLSupported()) {
      console.error("isWebGLSupported() == false")
      return
    }
    else {
      console.log("isWebGLSupported() == true")
    }

    this.mouseDown = {};
    this.ctlmouseDown = {};
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas!.getContext('2d');
    console.log("ngAfterViewInit()", this.ctx)
  
    this.init({
      texture: "assets/img/jevL9av.jpeg",  //"https://i.imgur.com/jevL9av.jpg",
      stencil: "assets/img/NUKbrbl.png", // "https://i.imgur.com/NUKbrbl.png",
      objects: {
        "255,0,0": "Розетка 1",
        "245,0,0": "Окно 1",
        "235,0,0": "Лоток",
        "225,0,0": "Коробка",
        "215,0,0": "Ящик стола",
        "205,0,0": "Розетка 2",
        "195,0,0": "Камин",
        "185,0,0": "Окно 2",
        "175,0,0": "А здесь был лось",
        "165,0,0": "Стол"
      }
    })
  }

  isWebGLSupported () {
    const canvas = document.createElement('canvas');
    const ok = !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    canvas.remove()
    return ok
  };

  init(json: any) {

    this.objects = json.objects;
    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);
    
    const geometry = new SphereBufferGeometry(500, 60, 40) //, 0, 1.39, 1.23, 0.30);
    geometry.scale(-1, 1, 1);

    this.material = new THREE.Material()
    this.material = this.createMaterial(json.texture, json.stencil);

    this.sphere = new THREE.Mesh( geometry, this.material )
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );
    
    this.scene.add(this.sphere!)

    this.renderer = new THREE.WebGLRenderer({canvas: this.cnv?.nativeElement});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(innerWidth, innerHeight);
    // document.body.append(this.renderer.domElement);
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

  createMaterial(img, stencil) {
    let textureLoader = new THREE.TextureLoader();
    let stencilImage = new Image();
    stencilImage.crossOrigin = "anonymous";
    stencilImage.src = stencil;

    const self = this;
    stencilImage.onload = function(event) {
      self.canvas!.width = stencilImage.width;
      self.canvas!.height = stencilImage.height;
      self.ctx.drawImage(stencilImage,0,0);
      self.imgData = self.ctx.getImageData(0, 0, self.canvas!.width, self.canvas!.height);
      console.log("stencilImage.onload", self.imgData)
    };


  return new THREE.ShaderMaterial({
        uniforms: {
            mouse: { type: "2f", value: self.mouse } as {type: string, value: any},
            texture1: { type: "t", value: textureLoader.load( img ) } as {type: string, value: any},
            texture2: { type: "t", value: textureLoader.load( stencil ) } as {type: string, value: any}
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `
            precision highp float;
            varying vec2 vUv;
            uniform vec2 mouse;
            uniform sampler2D texture1;
            uniform sampler2D texture2;
            void main() {
                vec4 stencil = texture2D(texture2, vUv);
                gl_FragColor = texture2D(texture1, vUv);
                vec4 c = texture2D(texture2, mouse);
                if (abs(c.x - stencil.x) < 0.0001 && stencil.x > 0.)
                    gl_FragColor += vec4(0.,0.2,0,0.);
            }`
    })
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // console.log("animate()", this)
    let phi = THREE.MathUtils.degToRad( 90 - this.lat );
    let theta = THREE.MathUtils.degToRad( this.lon );
    this.camera.target.x = 0.001*Math.sin(phi)*Math.cos(theta);
    this.camera.target.y = 0.001*Math.cos(phi);
    this.camera.target.z = 0.001*Math.sin(phi)*Math.sin(theta);
    this.camera.lookAt(this.camera.target);
    this.e && this.raycast(this.e);
    // console.log("this.renderer!.render()", this.scene, this.camera)
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

    if (intersects.length > 0 && intersects[0].uv) {
        // console.log("raycast -- intersects", intersects)
        this.material.uniforms.mouse.value = this.uv = intersects[0].uv;

        if (!this.imgData)
          return;

        // console.log("raycast(event)", this)
        let y = Math.floor((1-this.uv.y)*this.canvas!.height);
        let x = Math.floor(this.uv.x*this.canvas!.width);
        let off = Math.floor(y*this.canvas!.width + x)*4;
        let r = this.imgData.data[off];
        let g = this.imgData.data[off+1];
        let b = this.imgData.data[off+2];

        this.info.innerHTML = this.objects[`${r},${g},${b}`];
        // this.info.innerHTML = `Hello World! ${r},${g},${b}`;
        this.info.style.left = event.clientX + 15 + 'px';
        this.info.style.top = event.clientY + 'px';
        this.info.style.opacity = r+g+b ? 1 : 0;
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
    console.log("onPointerStart( event )", event)
    if(event.ctrlKey) {
      this.ctlmouseDown.x = event.clientX || event.touches[ 0 ].clientX;
      this.ctlmouseDown.y = event.clientY || event.touches[ 0 ].clientY;
      this.ctlmouseDown.lon = this.lon;
      this.ctlmouseDown.lat = this.lat;

      // var vector = new THREE.Vector3( this.ctlmouseDown.x, this.ctlmouseDown.y, -1 ).unproject( this.camera );
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
    console.log("onPointerUp()", event)
    if(event.ctrlKey && this.ctlmouseDown.x) {

      // Формируем прямоугольник
      const material = new THREE.LineBasicMaterial({
        color: 0xFF65FC,
        linewidth: 3
      });

      console.log("onPointerUp() ctrl", this.vectorStart, this.vectorEnd)
      const x = this.ctlmouseDown.x
      const y = this.ctlmouseDown.y
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

      const line = new THREE.Line(geometry, material);
      console.log("onPointerUp() build line", line)
      this.sphere!.add(line)
      // return
    }
    this.ctlmouseDown.x = null;
  }

  onDocumentMouseWheel( event ) {
    let fov = this.camera.fov + event.deltaY * 0.05;
    this.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    // console.log("onDocumentMouseWheel( event ) - begin", event, this.camera.fov)
    this.camera.updateProjectionMatrix();
    // console.log("onDocumentMouseWheel( event ) - end", event, this.camera.fov)
  }
}
