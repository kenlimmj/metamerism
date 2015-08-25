const DEFAULT_PARAMS = {
  id: _.uniqueId('line_'),
  x(data) {
    return data.x;
  },
  y(data) {
    return data.y;
  },
};

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

    this.mouseMove = (scope, _this) => {
      let xPos = d3.mouse(_this)[0];

      let xVal = scope.xScale.invert(xPos);
      let yVal = _.find(data, (item) => {
        return params.x(item) === d3.round(xVal, 0);
      });

      scope.lines[params.id].marker
        .attr('transform', `translate(${xPos},${scope.yScale(params.y(yVal))})`);
    };
  }
}
