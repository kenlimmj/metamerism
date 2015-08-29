import * as _ from 'lodash';

const DEFAULT_TARGET_ELEM = document.body;
const DEFAULT_PARAMS = {
  xAxisLabel: 'x',
  xAxisOrientation: 'bottom',
  xAxisClass: 'x',
  xAxisClamp: {
    min: -Infinity,
    max: Infinity,
  },
  xAxisTickValues: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  yAxisLabel: 'y',
  yAxisOrientation: 'left',
  yAxisClass: 'y',
  yAxisClamp: {
    min: -Infinity,
    max: Infinity,
  },
  updateDuration: 500,
  margin: {
    top: 10,
    right: 0,
    left: 30,
    bottom: 40,
  },
};

export default class LinePlot {
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

    this.lines = {};
    this.group = [];

    this.xLabel = this.params.xAxisLabel;
    this.yLabel = this.params.yAxisLabel;

    this.xAxisClass = `${this.id}-${this.params.xAxisClass}`;
    this.yAxisClass = `${this.id}-${this.params.yAxisClass}`;

    this.margin = this.params.margin;

    this.elemWidth = this.domElem.offsetWidth;
    this.elemHeight = this.domElem.offsetHeight;

    this.figWidth = this.elemWidth - this.margin.left - this.margin.right;
    this.figHeight = this.elemHeight - this.margin.top - this.margin.bottom;

    this.xScale = d3.scale.linear()
      .range([0, this.figWidth])
      .clamp(true)
      .nice();
    this.yScale = d3.scale.linear()
      .range([this.figHeight, 0])
      .clamp(true)
      .nice();

    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .orient(this.params.xAxisOrientation);

    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      .tickValues(this.params.xAxisTickValues)
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
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      // Draw the x-axis
      this.xAxisLine = this.plot
        .append('g')
        .classed(this.xAxisClass, true)
        .classed('axis', true)
        .attr('transform', `translate(0, ${this.figHeight})`)
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
        .call(this.yAxis);

      this.yAxisLabel = this.yAxisLine
        .append('text')
        .attr('transform', 'translate(15, 0) rotate(-90)')
        .attr('style', 'text-anchor: end')
        .text(this.yLabel);

      // Draw the tooltip overlay
      this.overlay = this.plot
        .datum(this)
        .append('rect')
        .classed('overlay', true)
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight)
        .on('mouseover', this.mouseOver)
        .on('mouseout', this.mouseOut)
        .on('mousemove', _.throttle(this.mouseMove, 10));

      // Draw the vertical marker line
      this.markerLine = this.plot
        .append('line')
        .attr('y1', 0)
        .attr('y2', this.figHeight)
        .classed('marker marker-bar', true);

      // Automatically redraw when the window is resized
      d3.select(window).on(`resize.${this.id}`, this.refresh.bind(this));

      this.isInit = true;
    }
  }

  mouseOver(scope) {
    scope.markerLine.style('display', 'inline');

    Object.keys(scope.lines).forEach((key) => {
      scope.lines[key].marker.style('display', 'inline');
    });

    scope.group.forEach((plot) => {
      plot.markerLine.style('display', 'inline');

      Object.keys(plot.lines).forEach((key) => {
        plot.lines[key].marker.style('display', 'inline');
      });
    });
  }

  mouseOut(scope) {
    scope.markerLine.style('display', 'none');

    Object.keys(scope.lines).forEach((key) => {
      scope.lines[key].marker.style('display', 'none');
    });

    scope.group.forEach((plot) => {
      plot.markerLine.style('display', 'none');

      Object.keys(plot.lines).forEach((key) => {
        plot.lines[key].marker.style('display', 'none');
      });
    });
  }

  mouseMove(scope) {
    // SHAME: No better way thus far to push the event handler
    // scope into the forEach closure other than backing it up here
    let _this = this;

    scope.markerLine
      .attr('x1', d3.mouse(_this)[0])
      .attr('x2', d3.mouse(_this)[0]);

    Object.keys(scope.lines).forEach((key) => {
      scope.lines[key].mouseMove(scope, _this);
    });

    scope.group.forEach((plot) => {
      plot.markerLine
        .attr('x1', d3.mouse(_this)[0])
        .attr('x2', d3.mouse(_this)[0]);

      Object.keys(plot.lines).forEach((key) => {
        plot.lines[key].mouseMove(plot, _this);
      });
    });
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
      this.yAxisLine.call(this.yAxis);
      this.xAxisLine
        .call(this.xAxis)
        .attr('transform', `translate(0, ${this.figHeight})`);

      // Redraw the SVG container
      this.svg
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight);

      // Redraw the mouse detection overlay
      this.overlay
        .attr('width', this.elemWidth)
        .attr('height', this.elemHeight);

      // Redraw the vertical marker line
      this.markerLine.attr('y2', this.figHeight);

      // Redraw the lines
      Object.keys(this.lines).forEach((key) => {
        this.plot
          .select(`.${this.lines[key].id}`)
          .attr('d', this.lines[key].func({
            x: this.xScale,
            y: this.yScale,
          }));
      });
    }
  }

  draw(line) {
    this.isInit || this.init();

    // Store the line information
    this.lines[line.id] = line;

    // Update the axes without animation
    this.setAxisDomains(line, false);

    // Draw the line plot
    this.lines[line.id].lineGroup = this.plot
      .append('path')
      .classed(line.id, true)
      .classed('line', true)
      .attr('d', line.func({
        x: this.xScale,
        y: this.yScale,
      }));

    // Draw the line marker
    this.lines[line.id].marker = this.plot
      .append('circle')
      .attr('r', 4.5)
      .classed(line.id, true)
      .classed('marker', true);
  }

  update(line) {
    // Update the corresponding line information
    // TODO: Check if the line id actually exists
    this.lines[line.id] = line;

    // Update the axes
    this.setAxisDomains(line);

    // Update the line itself
    this.plot
      .select(`.${line.id}`)
      .transition()
      .duration(this.params.updateDuration)
      .attr('d', line.func({
        x: this.xScale,
        y: this.yScale,
      }));

    // Update the line marker
    this.lines[line.id].marker = this.plot
      .append('circle')
      .attr('r', 4.5)
      .classed(line.id, true)
      .classed('marker', true);
  }

  destroy(lineId) {
    this.isInit ? d3.select(`#${lineId}`).remove() : console.error('destroy: Nothing to delete.');
  }

  setAxisDomains(line, enableTransition=true) {
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

    if (enableTransition) {
      d3.select(`.${this.xAxisClass}`)
        .transition()
        .duration(this.params.updateDuration)
        .call(this.xAxis);

      d3.select(`.${this.yAxisClass}`)
        .transition()
        .duration(this.params.updateDuration)
        .call(this.yAxis);
    } else {
      d3.select(`.${this.xAxisClass}`).call(this.xAxis);
      d3.select(`.${this.yAxisClass}`).call(this.yAxis);
    }
  }

  static group(arr) {
    arr.forEach((plot) => {
      arr.forEach((elem) => {
        if (elem.id !== plot.id) {
          plot.group.push(elem);
        }
      });
    });
  }
}
