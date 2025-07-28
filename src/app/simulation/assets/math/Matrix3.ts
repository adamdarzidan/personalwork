import { Vector3 } from "./Vector3";

export class Matrix3 {
  elements: number[][];
  constructor(elements: number[][]) {
    this.elements = elements;
  }

  static identity(): Matrix3 {
    return new Matrix3([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  }

  subtract(m: Matrix3): Matrix3 {
    return new Matrix3([
      [
        this.elements[0][0] - m.elements[0][0],
        this.elements[0][1] - m.elements[0][1],
        this.elements[0][2] - m.elements[0][2],
      ],
      [
        this.elements[1][0] - m.elements[1][0],
        this.elements[1][1] - m.elements[1][1],
        this.elements[1][2] - m.elements[1][2],
      ],
      [
        this.elements[2][0] - m.elements[2][0],
        this.elements[2][1] - m.elements[2][1],
        this.elements[2][2] - m.elements[2][2],
      ],
    ]);
  }

  multiplyVector(v: Vector3): Vector3 {
    const e = this.elements;
    return new Vector3(
      e[0][0] * v.x + e[0][1] * v.y + e[0][2] * v.z,
      e[1][0] * v.x + e[1][1] * v.y + e[1][2] * v.z,
      e[2][0] * v.x + e[2][1] * v.y + e[2][2] * v.z
    );
  }

  multiplyMatricies(other: Matrix3): Matrix3 {
    const result: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        for (let k = 0; k < 3; k++) {
          result[row][col] += this.elements[row][k] * other.elements[k][col];
        }
      }
    }

    return new Matrix3(result);
  }
  scale(n: number): Matrix3 {
    return new Matrix3([
      [
        this.elements[0][0] * n,
        this.elements[0][1] * n,
        this.elements[0][2] * n,
      ],
      [
        this.elements[1][0] * n,
        this.elements[1][1] * n,
        this.elements[1][2] * n,
      ],
      [
        this.elements[2][0] * n,
        this.elements[2][1] * n,
        this.elements[2][2] * n,
      ],
    ]);
  }

  static determinant(matrix: Matrix3): number {
    const m = matrix.elements;
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
      m[0][1] * (m[1][0] * m[2][2] - m[2][0] * m[1][2]) +
      m[0][2] * (m[1][0] * m[2][1] - m[2][0] * m[1][1])
    );
  }

  static cofactor(matrix: Matrix3): Matrix3 {
    const m = matrix.elements;
    let result: number[][] = [];
    for (let i = 0; i < 3; i++) {
      result[i] = [];
      for (let j = 0; j < 3; j++) {
        const rowIndices = [0, 1, 2].filter((r) => r !== i);
        const colIndices = [0, 1, 2].filter((c) => c !== j);

        const a = m[rowIndices[0]][colIndices[0]];
        const b = m[rowIndices[0]][colIndices[1]];
        const c = m[rowIndices[1]][colIndices[0]];
        const d = m[rowIndices[1]][colIndices[1]];

        const minor = a * d - b * c;
        const sign = (i + j) % 2 === 0 ? 1 : -1;

        result[i][j] = sign * minor;
      }
    }
    return new Matrix3(result);
  }

  static transpose(matrix: Matrix3): Matrix3 {
    const m = matrix.elements;
    let result: number[][] = [[], [], []];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[j][i] = m[i][j];
      }
    }
    return new Matrix3(result);
  }

  inverse(): Matrix3 {
    if (Matrix3.determinant(this) === 0) {
      throw new Error("This Matrix is not inversible");
    }

    return Matrix3.transpose(Matrix3.cofactor(this)).scale(
      1 / Matrix3.determinant(this)
    );
  }
}
