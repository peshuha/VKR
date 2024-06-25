

// SphereBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
// SphereBufferGeometry.prototype.constructor = SphereBufferGeometry;

import { Float32BufferAttribute, BufferGeometry, Vector3 } from "three";


export class SphereBufferGeometry extends BufferGeometry {

    override readonly  type: string | "SphereBufferGeometry";
    private parameters: any
        
    constructor(
            radius: any, 
            widthSegments?: any, 
            heightSegments?: any, 
            phiStart?: number, 
            phiLength?: number, 
            thetaStart?: number, 
            thetaLength?: number
    ) {
        
        // BufferGeometry.call( this );
        super()

    
        this.type = 'SphereBufferGeometry';
    
        this.parameters = {
            radius: radius,
            widthSegments: widthSegments,
            heightSegments: heightSegments,
            phiStart: phiStart,
            phiLength: phiLength,
            thetaStart: thetaStart,
            thetaLength: thetaLength
        };
    
        radius = radius || 1;
    
        widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
        heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );
    
        phiStart = phiStart !== undefined ? phiStart : 0;
        phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;
    
        thetaStart = thetaStart !== undefined ? thetaStart : 0;
        thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;
    
        var thetaEnd = thetaStart + thetaLength;
    
        var ix, iy;
    
        var index: number = 0;
        var grid: any[] = [];
    
        var vertex = new Vector3();
        var normal = new Vector3();
    
        // buffers
    
        var indices: number[] = [];
        var vertices: number[] = [];
        var normals: number[] = [];
        var uvs: number[] = [];
    
        // generate vertices, normals and uvs
    
        for ( iy = 0; iy <= heightSegments; iy ++ ) {
    
            var verticesRow: number[] = [];
    
            var v = iy / heightSegments;
    
            // special case for the poles
    
            var uOffset = ( iy == 0 ) ? 0.5 / widthSegments : ( ( iy == heightSegments ) ? - 0.5 / widthSegments : 0 );
    
            for ( ix = 0; ix <= widthSegments; ix ++ ) {
    
                var u = ix / widthSegments;
    
                // vertex
    
                vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
                vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
                vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
    
                vertices.push( vertex.x, vertex.y, vertex.z );
    
                // normal
    
                normal.copy( vertex ).normalize();
                normals.push( normal.x, normal.y, normal.z );
    
                // uv
    
                uvs.push( u + uOffset, 1 - v );
    
                verticesRow.push( index ++ );
    
            }
    
            grid.push( verticesRow );
    
        }
    
        // indices
    
        for ( iy = 0; iy < heightSegments; iy ++ ) {
    
            for ( ix = 0; ix < widthSegments; ix ++ ) {
    
                var a = grid[ iy ][ ix + 1 ];
                var b = grid[ iy ][ ix ];
                var c = grid[ iy + 1 ][ ix ];
                var d = grid[ iy + 1 ][ ix + 1 ];
    
                if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
                if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );
    
            }
    
        }
    
        // build geometry
    
        super.setIndex( indices );
        super.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
        super.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
        super.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

    }
}

