// Matrix

define(['Vector'], function (Vector) {

  var Matrix = function (rows, columns) {
    this.rows    = rows;
    this.columns = columns;

    this.data = new Array(rows);
    for (var i = 0; i < rows; i++) {
      this.data[i] = new Array(columns);
    }
  };

  Matrix.prototype = {
    configure: function (rot, scale, transx, transy) {
      var rad = (rot * Math.PI)/180.0;
      var sin = Math.sin(rad) * scale;
      var cos = Math.cos(rad) * scale;
      this.data[0][0] = cos;
      this.data[0][1] = -sin;
      this.data[0][2] = transx;
      this.data[1][0] = sin;
      this.data[1][1] = cos;
      this.data[1][2] = transy;
    },

    set: function () {
      var k = 0;
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          this.data[i][j] = arguments[k];
          k++;
        }
      }
    },

    // assuming 2x3 matrix
    vectorMultiply: function (vector, use) {
      // reuse vector if one is given to us
      var out = (use) ? use : Vector.create();
      out.x = this.data[0][0] * vector.x +
              this.data[0][1] * vector.y +
              this.data[0][2];
      out.y = this.data[1][0] * vector.x +
              this.data[1][1] * vector.y +
              this.data[1][2];
      return out;
    },

    multiply: function () {
      var vector = new Array(rows);
      for (var i = 0; i < rows; i++) {
        vector[i] = 0;
        for (var j = 0; j < columns; j++) {
          vector[i] += this.data[i][j] * arguments[j];
        }
      }
      return vector;
    }
  };

  return Matrix;
});
