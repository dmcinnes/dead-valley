// Matrix

define(function () {
  return function (rows, columns) {
    var i, j, k, rad, sin, cos, vector;

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
});
