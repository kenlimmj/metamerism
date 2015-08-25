'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DEFAULT_PARAMS = {
  id: _.uniqueId('line_'),
  x: function x(data) {
    return data.x;
  },
  y: function y(data) {
    return data.y;
  }
};

var Line = function Line() {
  var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var params = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_PARAMS : arguments[1];

  _classCallCheck(this, Line);

  this.data = data;
  this.id = params.id;
  this.x = params.x;
  this.y = params.y;

  this.func = function (scale) {
    var lineGenerator = d3.svg.line().x(function (d) {
      return scale.x(params.x(d));
    }).y(function (d) {
      return scale.y(params.y(d));
    });

    return lineGenerator(data);
  };

  this.mouseMove = function (scope, _this) {
    var xPos = d3.mouse(_this)[0];

    var xVal = scope.xScale.invert(xPos);
    var yVal = _.find(data, function (item) {
      return params.x(item) === d3.round(xVal, 0);
    });

    scope.lines[params.id].marker.attr('transform', 'translate(' + xPos + ',' + scope.yScale(params.y(yVal)) + ')');
  };
};
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DEFAULT_TARGET_ELEM = document.body;
var DEFAULT_PARAMS = {
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

var LinePlot = (function () {
  function LinePlot() {
    var domElem = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TARGET_ELEM : arguments[0];
    var params = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_PARAMS : arguments[1];

    _classCallCheck(this, LinePlot);

    this.id = _.uniqueId('plot_');
    this.domElem = domElem;

    if (params !== DEFAULT_PARAMS) {
      this.params = _.merge(_.cloneDeep(DEFAULT_PARAMS), params);
    } else {
      this.params = params;
    }

    this.lines = {};

    this.xLabel = this.params.xAxisLabel;
    this.yLabel = this.params.yAxisLabel;

    this.xAxisClass = this.id + '-' + this.params.xAxisClass;
    this.yAxisClass = this.id + '-' + this.params.yAxisClass;

    this.margin = this.params.margin;

    this.elemWidth = domElem.offsetWidth;
    this.elemHeight = domElem.offsetHeight;

    this.figWidth = this.elemWidth - this.margin.left - this.margin.right;
    this.figHeight = this.elemHeight - this.margin.top - this.margin.bottom;

    this.xScale = d3.scale.linear().range([0, this.figWidth]).clamp(true).nice();
    this.yScale = d3.scale.linear().range([this.figHeight, 0]).clamp(true).nice();

    this.xAxis = d3.svg.axis().scale(this.xScale).orient(this.params.xAxisOrientation);

    this.yAxis = d3.svg.axis().scale(this.yScale).tickValues([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]).orient(this.params.yAxisOrientation);

    this.isInit = false;

    return this;
  }

  _createClass(LinePlot, [{
    key: 'init',
    value: function init() {
      if (!this.isInit) {
        this.plot = d3.select(this.domElem).append('svg').attr('width', this.elemWidth).attr('height', this.elemHeight).append('g').attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');

        this.xAxisGroup = this.plot.append('g').classed(this.xAxisClass, true).classed('axis', true).attr('transform', 'translate(0, ' + this.figHeight + ')').call(this.xAxis).append('text').attr('transform', 'translate(' + this.figWidth + ', -5)').attr('style', 'text-anchor: end').text(this.xLabel);

        this.yAxisGroup = this.plot.append('g').classed(this.yAxisClass, true).classed('axis', true).call(this.yAxis).append('text').attr('transform', 'translate(15, 0) rotate(-90)').attr('style', 'text-anchor: end').text(this.yLabel);

        this.overlay = this.plot.datum(this).append('rect').classed('overlay', true).attr('width', this.elemWidth).attr('height', this.elemHeight).on('mouseover', this.mouseOver).on('mouseout', this.mouseOut).on('mousemove', this.mouseMove);

        this.isInit = true;
      }
    }
  }, {
    key: 'mouseOver',
    value: function mouseOver(scope) {
      Object.keys(scope.lines).forEach(function (key) {
        scope.lines[key].marker.style('display', 'inline');
      });
    }
  }, {
    key: 'mouseOut',
    value: function mouseOut(scope) {
      Object.keys(scope.lines).forEach(function (key) {
        scope.lines[key].marker.style('display', 'none');
      });
    }
  }, {
    key: 'mouseMove',
    value: function mouseMove(scope) {
      var _this = this;

      Object.keys(scope.lines).forEach(function (key) {
        scope.lines[key].mouseMove(scope, _this);
      });
    }
  }, {
    key: 'draw',
    value: function draw(line) {
      this.isInit || this.init();

      this.lines[line.id] = line;

      this.setAxisDomains(line, false);

      this.lines[line.id].lineGroup = this.plot.append('path').classed(line.id, true).classed('line', true).attr('d', line.func({
        x: this.xScale,
        y: this.yScale
      }));

      this.lines[line.id].marker = this.plot.append('circle').attr('r', 4.5).classed(line.id, true).classed('marker', true);
    }
  }, {
    key: 'update',
    value: function update(line) {
      this.setAxisDomains(line);

      this.plot.select('.' + line.id).transition().duration(this.params.updateDuration).attr('d', line.func({
        x: this.xScale,
        y: this.yScale
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy(lineId) {
      this.isInit ? d3.select('#' + lineId).remove() : console.error('destroy: Nothing to delete.');
    }
  }, {
    key: 'setAxisDomains',
    value: function setAxisDomains(line) {
      var enableTransition = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var xDomain = [];
      var yDomain = [];

      if (this.params.xAxisClamp.min !== -Infinity) {
        xDomain[0] = this.params.xAxisClamp.min;
      } else {
        xDomain[0] = d3.min(line.data, function (d) {
          return line.x(d);
        });
      }

      if (this.params.xAxisClamp.max !== Infinity) {
        xDomain[1] = this.params.xAxisClamp.max;
      } else {
        xDomain[1] = d3.max(line.data, function (d) {
          return line.x(d);
        });
      }

      if (this.params.yAxisClamp.min !== -Infinity) {
        yDomain[0] = this.params.yAxisClamp.min;
      } else {
        yDomain[0] = d3.min(line.data, function (d) {
          return line.y(d);
        });
      }

      if (this.params.yAxisClamp.max !== Infinity) {
        yDomain[1] = this.params.yAxisClamp.max;
      } else {
        yDomain[1] = d3.max(line.data, function (d) {
          return line.y(d);
        });
      }

      this.xScale.domain(xDomain);
      this.yScale.domain(yDomain);

      if (enableTransition) {
        d3.select('.' + this.xAxisClass).transition().duration(this.params.updateDuration).call(this.xAxis);

        d3.select('.' + this.yAxisClass).transition().duration(this.params.updateDuration).call(this.yAxis);
      } else {
        d3.select('.' + this.xAxisClass).call(this.xAxis);
        d3.select('.' + this.yAxisClass).call(this.yAxis);
      }
    }
  }], [{
    key: 'group',
    value: function group(arr) {}
  }]);

  return LinePlot;
})();
'use strict';

(function () {
  var domElem = document.querySelector('.humanEyeResponse');
  var data = cf;
  var params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730
    },
    yAxisLabel: 'Tristimulus Value'
  };

  var lineParams = {
    l: {
      id: 'lCone',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['l-cone'];
      }
    },
    m: {
      id: 'mCone',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['m-cone'];
      }
    },
    s: {
      id: 'sCone',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['s-cone'];
      }
    }
  };

  var plot = new LinePlot(domElem, params);

  var lines = {
    l: new Line(data, lineParams.l),
    m: new Line(data, lineParams.m),
    s: new Line(data, lineParams.s)
  };

  Object.keys(lines).forEach(function (entry) {
    plot.draw(lines[entry]);
  });
})();
'use strict';

(function () {
  var globalData = _.sortBy(spd, function (item) {
    return item.id;
  });

  var domElem = document.querySelector('.lightPowerDist');

  var params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730
    },
    yAxisLabel: 'Relative Intensity'
  };

  var lineParams = {
    id: 'ri',
    x: function x(data) {
      return data.wavelength;
    },
    y: function y(data) {
      return data.ri;
    }
  };

  var plot = new LinePlot(domElem, params);
  var line = new Line(globalData[0].data, lineParams);

  plot.draw(line);

  var selectorElem = document.querySelector('.lpd--data-selector');

  globalData.forEach(function (item, idx) {
    var opt = document.createElement('option');
    opt.textContent = item.id;
    opt.value = idx;
    selectorElem.appendChild(opt);
  });

  selectorElem.addEventListener('change', function (e) {
    line = new Line(globalData[e.target.value].data, lineParams);
    plot.update(line);
  });
})();
'use strict';

(function () {
  var globalData = _.sortBy(spd, function (item) {
    return item.id;
  });

  var domElem = document.querySelector('.result');
  var data = multiply(cf, globalData[0].data);

  var params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730
    },
    yAxisClamp: {
      min: 0,
      max: 1
    },
    yAxisLabel: 'Tristimulus Value'
  };

  var lineParams = {
    l: {
      id: 'lConeResult',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['l-cone'];
      }
    },
    m: {
      id: 'mConeResult',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['m-cone'];
      }
    },
    s: {
      id: 'sConeResult',
      x: function x(data) {
        return data['wavelength'];
      },
      y: function y(data) {
        return data['s-cone'];
      }
    }
  };

  function multiply(a, b) {
    return a.map(function (item, idx) {
      return {
        wavelength: item.wavelength,
        'l-cone': item['l-cone'] * b[idx].ri,
        'm-cone': item['m-cone'] * b[idx].ri,
        's-cone': item['s-cone'] * b[idx].ri
      };
    });
  }

  var plot = new LinePlot(domElem, params);

  var lines = {
    l: new Line(data, lineParams.l),
    m: new Line(data, lineParams.m),
    s: new Line(data, lineParams.s)
  };

  Object.keys(lines).forEach(function (entry) {
    plot.draw(lines[entry]);
  });

  var selectorElem = document.querySelector('.lpd--data-selector');

  selectorElem.addEventListener('change', function (e) {
    var updatedData = multiply(cf, globalData[e.target.value].data);

    var updatedLines = {
      l: new Line(updatedData, lineParams.l),
      m: new Line(updatedData, lineParams.m),
      s: new Line(updatedData, lineParams.s)
    };

    Object.keys(updatedLines).forEach(function (entry) {
      plot.update(updatedLines[entry]);
    });
  });
})();
//# sourceMappingURL=app.js.map