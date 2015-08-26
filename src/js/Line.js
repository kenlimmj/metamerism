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
    this.params = params;
  }

  func(scale) {
    let lineGenerator = d3.svg
      .line()
      .x((d) => {
        return scale.x(this.params.x(d));
      })
      .y((d) => {
        return scale.y(this.params.y(d));
      });

    return lineGenerator(this.data);
  }

  mouseMove({xScale, yScale, lines}, overlay) {
    let xPos = d3.mouse(overlay)[0];

    let xVal = xScale.invert(xPos);
    let yVal = _.find(this.data, (item) => {
      return this.params.x(item) === d3.round(xVal, 0);
    });

    lines[this.params.id].marker
      .attr('transform', `translate(${xPos},${yScale(this.params.y(yVal))})`);
  }

  get id() {
    return this.params.id;
  }

  get x() {
    return this.params.x;
  }

  get y() {
    return this.params.y;
  }
}
