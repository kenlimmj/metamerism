/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-08 11:46:29
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-09 22:22:54
 */

const DEFAULT_PARAMS = {
  id: _.uniqueId('line_'),
  x(data) {
    return data.x;
  },
  y(data) {
    return data.y
  }
}

class Line {
  constructor(data = [], params = DEFAULT_PARAMS) {
    this.data = data;
    this.id = params.id;
    this.x = params.x;
    this.y = params.y;

    this.func = (scale) => {
      let lineGenerator = d3.svg
        .line()
        .x((d) => {
          return scale.x(params.x(d));
        })
        .y((d) => {
          return scale.y(params.y(d));
        });

      return lineGenerator(data);
    };
  }
}
