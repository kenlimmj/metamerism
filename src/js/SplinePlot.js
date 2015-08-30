import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import uniqueId from 'lodash.uniqueid';

const DEFAULT_TARGET_ELEM = document.body;
const DEFAULT_PARAMS = {
  xAxisLabel: 'x',
  xAxisOrientation: 'bottom',
  xAxisClass: 'x',
  xAxisClamp: {
    min: -Infinity,
    max: Infinity,
  },
  yAxisLabel: 'y',
  yAxisOrientation: 'left',
  yAxisClass: 'y',
  yAxisClamp: {
    min: -Infinity,
    max: Infinity,
  },
  margin: {
    top: 10,
    right: 0,
    left: 35,
    bottom: 40,
  },
  updateDuration: 500,
};

export default class SplinePlot {
  constructor(domElem = DEFAULT_TARGET_ELEM, params = DEFAULT_PARAMS) {
    this.id = uniqueId('plot_');
    this.domElem = domElem;

    // Merge the input params with the default params to fill any settings
    // that were not specified in the input
    if (params !== DEFAULT_PARAMS) {
      this.params = merge(cloneDeep(DEFAULT_PARAMS), params);
    } else {
      this.params = params;
    }

    this.points = [];
    this.selected = null;
    this.dragged = null;
    this.lineFunc = d3.svg.line().interpolate('cardinal');

    this.margin = this.params.margin;

    this.elemWidth = this.domElem.offsetWidth;
    this.elemHeight = this.domElem.offsetHeight;

    this.figWidth = this.elemWidth - this.margin.left - this.margin.right;
    this.figHeight = this.elemHeight - this.margin.top - this.margin.bottom;

    this.xLabel = this.params.xAxisLabel;
    this.yLabel = this.params.yAxisLabel;

    this.xAxisClass = `${this.id}-${this.params.xAxisClass}`;
    this.yAxisClass = `${this.id}-${this.params.yAxisClass}`;

    this.xScale = d3.scale.linear()
      .range([0, this.figWidth])
      .domain([390, 730])
      .clamp(true);
    this.yScale = d3.scale.linear()
      .range([this.figHeight, 0])
      .domain([0, 1])
      .clamp(true);

    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .orient(this.params.xAxisOrientation);

    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      .orient(this.params.yAxisOrientation);

    this.isInit = false;

    return this;
  }

  init() {
    if (!this.isInit) {
      // Initialize the svg placeholder
      this.svg = d3.select(this.domElem)
        .append('svg')
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight)
        .classed(this.id, true);

      // Draw the plot placeholder
      this.plot = this.svg
        .append('g');

      // Draw the x-axis
      this.xAxisLine = this.plot
        .append('g')
        .classed(this.xAxisClass, true)
        .classed('axis', true)
        .attr('transform', `translate(${this.margin.left}, ${this.figHeight + this.margin.top})`)
        .call(this.xAxis);

      this.xAxisLabel = this.xAxisLine
        .append('text')
        .attr('transform', `translate(${this.figWidth}, -5)`)
        .attr('style', 'text-anchor: end')
        .text(this.xLabel);

      // Draw the y-axis
      this.yAxisLine = this.plot
        .append('g')
        .classed(this.yAxisClass, true)
        .classed('axis', true)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .call(this.yAxis);

      this.yAxisLabel = this.yAxisLine
        .append('text')
        .attr('transform', 'translate(17.5, 0) rotate(-90)')
        .attr('style', 'text-anchor: end')
        .text(this.yLabel);

      // Draw the line canvas
      this.canvas = this.plot
        .datum(this)
        .append('rect')
        .classed('canvas', true)
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight)
        .on('mousedown', this.mouseDown);

      this.svg
        .datum(this)
        .on('mousemove', this.mouseMove)
        .on('mouseup', this.mouseUp);

      this.line = this.plot
        .append('path')
        .datum(this.points)
        .classed('line', true);

      this.line.call(this.redrawLine.bind(this));

      this.svg.node().focus();

      // Automatically redraw when the window is resized
      d3.select(window).on(`resize.${this.id}`, debounce(this.refresh, 200).bind(this));

      this.isInit = true;
    }
  }

  mouseMove(scope) {
    if (!scope.dragged) return;

    let m = d3.mouse(scope.svg.node());
    scope.dragged[0] = Math.max(scope.margin.left, Math.min(scope.elemWidth - scope.margin.right, m[0]));
    scope.dragged[1] = Math.max(scope.margin.top, Math.min(scope.elemHeight - scope.margin.bottom, m[1]));

    scope.redrawLine();
  }

  mouseDown(scope) {
    scope.points.push(scope.selected = scope.dragged = d3.mouse(scope.svg.node()));
    scope.redrawLine();
  }

  mouseUp(scope) {
    if (!scope.dragged) return;

    scope.mouseMove(scope);
    scope.dragged = null;
  }

  redrawLine() {
    this.line.attr('d', this.lineFunc);

    let marker = this.plot
      .selectAll('circle')
      .data(this.points, (d) => { return d; });

    marker
      .enter()
      .append('circle')
      .attr('r', 1e-6)
      .classed('point', true)
      .on('mousedown', (d) => {
        this.selected = this.dragged = d;
        this.redrawLine();
      })
      .transition()
      .duration(this.params.updateDuration)
      .ease('elastic')
      .attr('r', 4.5);

    marker
      .classed('selected', (d) => { return d === this.selected; })
      .attr('cx', (d) => { return d[0]; })
      .attr('cy', (d) => { return d[1]; });

    marker.exit().remove();

    if (d3.event) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }

  refresh() {
    if (this.isInit) {
      // Re-acquire the element dimensions
      this.elemWidth = this.domElem.offsetWidth;
      this.elemHeight = this.domElem.offsetHeight;

      // Re-calculate the figure dimensions
      this.figWidth = this.elemWidth - this.margin.left - this.margin.right;
      this.figHeight = this.elemHeight - this.margin.top - this.margin.bottom;

      // Re-calibrate the scales
      this.xScale.range([0, this.figWidth]);
      this.yScale.range([this.figHeight, 0]);

      // Re-calibrate the axes
      this.xAxis.scale(this.xScale);
      this.yAxis.scale(this.yScale);

      this.xAxisLabel.attr('transform', `translate(${this.figWidth}, -5)`);

      // Redraw the axis lines
      this.yAxisLine
        .call(this.yAxis)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
      this.xAxisLine
        .call(this.xAxis)
        .attr('transform', `translate(${this.margin.left}, ${this.figHeight + this.margin.top})`);

      // Redraw the SVG container
      this.svg
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight);

      // Redraw the mouse detection overlay
      this.canvas
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight);

      this.line.call(this.redrawLine.bind(this));
    }
  }
}
