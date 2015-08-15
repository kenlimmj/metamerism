/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-05 22:11:48
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-13 11:06:23
 */

const DEFAULT_TARGET_ELEM = document.body;
const DEFAULT_PARAMS = {
  xAxisLabel: 'x',
  xAxisOrientation: 'bottom',
  xAxisClass: 'x',
  xAxisClamp: {
    min: -Infinity,
    max: Infinity
  },
  yAxisLabel: 'y',
  yAxisOrientation: 'left',
  yAxisClass: 'y',
  yAxisClamp: {
    min: -Infinity,
    max: Infinity
  },
  updateDuration: 500,
  margin: {
    top: 10,
    right: 0,
    left: 30,
    bottom: 40
  }
};

class LinePlot {
  constructor(domElem = DEFAULT_TARGET_ELEM, params = DEFAULT_PARAMS) {
    this.id = _.uniqueId('plot_');
    this.domElem = domElem;

    // Merge the input params with the default params to fill any settings
    // that were not specified in the input
    if (params !== DEFAULT_PARAMS) {
      this.params = _.merge(_.cloneDeep(DEFAULT_PARAMS), params);
    } else {
      this.params = params;
    }

    this.xLabel = this.params.xAxisLabel;
    this.yLabel = this.params.yAxisLabel;

    this.xAxisClass = `${this.id}-${this.params.xAxisClass}`;
    this.yAxisClass = `${this.id}-${this.params.yAxisClass}`;

    this.margin = this.params.margin;

    this.elemWidth = domElem.offsetWidth;
    this.elemHeight = domElem.offsetHeight;

    this.figWidth = this.elemWidth - this.margin.left - this.margin.right;
    this.figHeight = this.elemHeight - this.margin.top - this.margin.bottom;

    this.xScale = d3.scale.linear().range([0, this.figWidth]).clamp(true).nice();
    this.yScale = d3.scale.linear().range([this.figHeight, 0]).clamp(true).nice();

    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .orient(this.params.xAxisOrientation);

    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      .tickValues([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
      .orient(this.params.yAxisOrientation);

    this.isInit = false;

    return this;
  }

  init() {
    if (!this.isInit) {
      // Draw the svg placeholder
      this.plot = d3.select(this.domElem)
        .append('svg')
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      // Draw the x-axis
      this.plot
        .append('g')
        .classed(this.xAxisClass, true)
        .classed('axis', true)
        .attr('transform', `translate(0, ${this.figHeight})`)
        .call(this.xAxis)
        .append('text')
        .attr('transform', `translate(${this.figWidth}, -5)`)
        .attr('style', 'text-anchor: end')
        .text(this.xLabel);

      // Draw the y-axis
      this.plot
        .append('g')
        .classed(this.yAxisClass, true)
        .classed('axis', true)
        .call(this.yAxis)
        .append('text')
        .attr('transform', 'translate(15, 0) rotate(-90)')
        .attr('style', 'text-anchor: end')
        .text(this.yLabel);

      this.isInit = true;
    }
  }

  draw(line) {
    if (!this.isInit) {
      this.init();
    }

    this.setAxisDomains(line);

    // Draw the line plot
    this.plot
      .append('path')
      .classed(line.id, true)
      .classed('line', true)
      .attr('d', line.func({
        x: this.xScale,
        y: this.yScale
      }));
  }

  update(line) {
    this.setAxisDomains(line);

    this.plot
      .select(`.${line.id}`)
      .transition()
      .duration(500)
      .attr('d', line.func({
        x: this.xScale,
        y: this.yScale
      }));
  }

  destroy(lineId) {
    if (this.isInit) {
      return d3.select(`#${lineId}`).remove();
    }
  }

  setAxisDomains(line) {
    let xDomain = [];
    let yDomain = [];

    if (this.params.xAxisClamp.min !== -Infinity) {
      xDomain[0] = this.params.xAxisClamp.min;
    } else {
      xDomain[0] = d3.min(line.data, (d) => {
        return line.x(d);
      });
    }

    if (this.params.xAxisClamp.max !== Infinity) {
      xDomain[1] = this.params.xAxisClamp.max;
    } else {
      xDomain[1] = d3.max(line.data, (d) => {
        return line.x(d);
      });
    }

    if (this.params.yAxisClamp.min !== -Infinity) {
      yDomain[0] = this.params.yAxisClamp.min;
    } else {
      yDomain[0] = d3.min(line.data, (d) => {
        return line.y(d);
      });
    }

    if (this.params.yAxisClamp.max !== Infinity) {
      yDomain[1] = this.params.yAxisClamp.max;
    } else {
      yDomain[1] = d3.max(line.data, (d) => {
        return line.y(d);
      });
    }

    // Update the axis domains
    this.xScale.domain(xDomain);
    this.yScale.domain(yDomain);

    d3.select(`.${this.xAxisClass}`)
      .transition()
      .duration(500)
      .call(this.xAxis);

    d3.select(`.${this.yAxisClass}`)
      .transition()
      .duration(500)
      .call(this.yAxis);
  }
}
