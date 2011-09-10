// Matrix

define(['Vector'], function (Vector) {

  var Matrix = function (rows, columns) {
    var i, j, k, rad, sin, cos, vector, out;

    this.data = new Array(rows);
    for (i = 0; i < rows; i++) {
      this.data[i] = new Array(columns);
    }

    this.configure = function (rot, scale, transx, transy) {
      rad = (rot * Math.PI)/180.0;
      sin = Math.sin(rad) * scale;
      cos = Math.cos(rad) * scale;
      this.data[0][0] = cos;
      this.data[0][1] = -sin;
      this.data[0][2] = transx;
      this.data[1][0] = sin;
      this.data[1][1] = cos;
      this.data[1][2] = transy;
    };

    this.set = function () {
      k = 0;
      for (i = 0; i < rows; i++) {
        for (j = 0; j < columns; j++) {
          this.data[i][j] = arguments[k];
          k++;
        }
      }
    }

    // assuming 2x3 matrix
    this.vectorMultiply = function (vector, use) {
      // reuse vector if one is given to us
      out = (use) ? use : new Vector();
      out.x = this.data[0][0] * vector.x +
              this.data[0][1] * vector.y +
              this.data[0][2];
      out.y = this.data[1][0] * vector.x +
              this.data[1][1] * vector.y +
              this.data[1][2];
      return out;
    };

    this.multiply = function () {
      vector = new Array(rows);
      for (i = 0; i < rows; i++) {
        vector[i] = 0;
        for (j = 0; j < columns; j++) {
          vector[i] += this.data[i][j] * arguments[j];
        }
      }
      return vector;
    };
  };

  window.Vector = Vector;
  window.Matrix = Matrix;

  return Matrix;
});
