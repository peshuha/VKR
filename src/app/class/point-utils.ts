import {BufferGeometry, Mesh, Vector2, Vector3} from 'three';

const baryCoords = new Vector3();

const p1 = new Vector3();
const p2 = new Vector3();
const p3 = new Vector3();

const uv1 = new Vector2(0, 0);
const uv2 = new Vector2(0, 0);
const uv3 = new Vector2(0, 0);

const getVertex2d = (vertices: Float32Array, index: number, out: Vector2) => {
  out.x = vertices[index * 2] ?? 0;
  out.y = vertices[index * 2 + 1] ?? 0;
};

const getVertex = (vertices: Float32Array, index: number, out: Vector3) => {
  out.x = vertices[index * 3] ?? 0;
  out.y = vertices[index * 3 + 1] ?? 0;
  out.z = vertices[index * 3 + 2] ?? 0;
};

export function uvToVector3(mesh:Mesh, uv: Vector2): Vector3 | undefined {
    const v3 = new Vector3
    const norm = new Vector3

    if(!uvToWorldPosition(mesh, uv, v3, norm)) {
        return undefined
    }

    return v3
}

/**
 * Convert UV coordinates to world position
 * @param mesh mesh with indexed buffer geometry
 * @param uv
 * @param out
 * @param outNormal
 */
export const uvToWorldPosition = (
  mesh: Mesh,
  uv: Vector2,
  out: Vector3,
  outNormal?: Vector3
): boolean => {
  
    const geometry: BufferGeometry = mesh?.geometry as BufferGeometry;
    if(!geometry)
        return false

    const index = geometry.getIndex()?.array! as Uint32Array;
    const vertices = geometry.getAttribute("position")?.array! as Float32Array
    const normals = geometry.getAttribute("normal")?.array! as Float32Array;

  const uvs = geometry?.getAttribute("uv")?.array! as Float32Array;
  if (!uvs) return false;

  for (let i = 0; i < index.length / 3; i++) {
    const index1 = index[i * 3]!;
    const index2 = index[i * 3 + 1]!;
    const index3 = index[i * 3 + 2]!;

    getVertex2d(uvs, index1, uv1);
    getVertex2d(uvs, index2, uv2);
    getVertex2d(uvs, index3, uv3);

    if (getBarycentricCoordinates2d(uv, uv1, uv2, uv3, baryCoords)) {
      // Find the vertices corresponding to the triangle in the model
      getVertex(vertices, index1, p1);
      getVertex(vertices, index2, p2);
      getVertex(vertices, index3, p3);

      // Sum the barycentric coordinates and apply to the vertices to get the coordinate in local space
      out.set(
        p1.x * baryCoords.x + p2.x * baryCoords.y + p3.x * baryCoords.z,
        p1.y * baryCoords.x + p2.y * baryCoords.y + p3.y * baryCoords.z,
        p1.z * baryCoords.x + p2.z * baryCoords.y + p3.z * baryCoords.z
      );

      // Translate to world space
      out.applyMatrix4(mesh.matrixWorld);

      if (outNormal) {
        // Find the normals corresponding to the triangle in the model
        getVertex(normals, index1, p1);
        getVertex(normals, index2, p2);
        getVertex(normals, index3, p3);

        outNormal.set(
          p1.x * baryCoords.x + p2.x * baryCoords.y + p3.x * baryCoords.z,
          p1.y * baryCoords.x + p2.y * baryCoords.y + p3.y * baryCoords.z,
          p1.z * baryCoords.x + p2.z * baryCoords.y + p3.z * baryCoords.z
        );
      }
      return true;
    }
  }

  return false;
};

const signedArea = (v1: Vector2, v2: Vector2, v3: Vector2) => {
  return (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x);
}

/**
 * Check if a point is inside a triangle and return barycentric coordinates
 * @param p
 * @param v1
 * @param v2
 * @param v3
 * @param out
 * @return true if the point is inside the triangle
 */
function getBarycentricCoordinates2d(p: Vector2, v1: Vector2, v2: Vector2, v3: Vector2, out: Vector3) {
  const b0 = signedArea(v1, v2, v3);
  if (b0 == 0) return false;

  const b1 = signedArea(v2, v3, p) / b0;
  if (b1 <= 0) return false;

  const b2 = signedArea(v3, v1, p) / b0;
  if (b2 <= 0) return false;

  const b3 = signedArea(v1, v2, p) / b0;
  if (b3 <= 0) return false;

  out.set(b1, b2, b3);
  return true;
}



// Проверяет входит ли точка в полигон
export function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

