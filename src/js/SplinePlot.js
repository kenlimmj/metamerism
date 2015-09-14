import cloneDeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';
import merge from 'lodash.merge';
import throttle from 'lodash.throttle';
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
    bottom: 45,
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
    this.lineFunc = d3.svg.line().interpolate('basis');

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
      .domain([this.params.xAxisClamp.min, this.params.xAxisClamp.max])
      .clamp(true);
    this.yScale = d3.scale.linear()
      .range([this.figHeight, 0])
      .domain([this.params.yAxisClamp.min, this.params.yAxisClamp.max])
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

      this.svg
        .datum(this)
        .on('mousedown', this.mouseDown)
        .on('mouseup', this.mouseUp)
        .on('touchstart', this.touchStart)
        .on('touchend', this.touchEnd)
        .on('contextmenu', this.clearDrawing);

      this.line = this.plot
        .append('path')
        .data([this.points])
        .classed('line', true);

      // Automatically redraw when the window is resized
      d3.select(window).on(`resize.${this.id}`, debounce(this.refresh, 200).bind(this));

      this.isInit = true;
    }
  }

  clearDrawing(scope) {
    d3.event.preventDefault();

    scope.points.length = 0;
    scope.line.attr('d', d => { return scope.lineFunc(d); });
  }

  cursorMove(scope) {
    let coords = [];

    if (d3.event && d3.event.type === 'mousemove') {
      coords = d3.mouse(this);
    } else if (d3.event && d3.event.type === 'touchmove') {
      coords = d3.touches(this)[0];
    }

    // Clamp the coordinates to the boundaries of
    // the figure where they may cross the axes
    if (coords[0] < scope.margin.left) {
      coords[0] = scope.margin.left;
    }

    if (coords[1] > scope.elemHeight - scope.margin.bottom) {
      coords[1] = scope.elemHeight - scope.margin.bottom;
    }

    // Push the cursor coordinates onto the stack
    scope.points.push(coords);

    // Update the line path
    scope.line.attr('d', d => { return scope.lineFunc(d); });
  }

  touchStart(scope) {
    // Enable cursor point tracking only when the finger is down
    scope.svg.on('touchmove', scope.cursorMove);
  }

  mouseDown(scope) {
    // Enable cursor point tracking only when the mouse is down
    scope.svg.on('mousemove', scope.cursorMove);
  }

  touchEnd(scope) {
    // When the finger is up, delete the cursor point tracking handler
    scope.svg.on('touchmove', null);
  }

  mouseUp(scope) {
    // When the mouse is up, delete the cursor point tracking handler
    scope.svg.on('mousemove', null);
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

      // TODO: Redraw the user's line
      this.line.attr('d', d => { return this.lineFunc(d); });
    }
  }
}
