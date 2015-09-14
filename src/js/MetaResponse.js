import lpdData from 'json!../data/lpd.json';
import herData from 'json!../data/her.json';

import Line from './Line';
import LinePlot from './LinePlot';

import sortBy from 'lodash.sortby';
import uniqueId from 'lodash.uniqueid';

const LPD_DATA = sortBy(lpdData, (item) => {
  return item.id;
});

const HER_DATA = herData;

const DATA = multiply(HER_DATA, LPD_DATA[0].data);

const PLOT_PARAMS = {
  xAxisLabel: 'Wavelength (nm)',
  xAxisClamp: {
    min: 393,
    max: 714,
  },
  yAxisLabel: 'Response',
  yAxisClamp: {
    min: -0.5,
    max: 3,
  },
};

const LINE_PARAMS = {
  l: {
    id: uniqueId('lCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['l-Cone'];
    },
  },
  m: {
    id: uniqueId('mCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['m-Cone'];
    },
  },
  s: {
    id: uniqueId('sCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['s-Cone'];
    },
  },
};

function multiply(a, b) {
  return a.map((item, idx) => {
    return {
      wavelength: item.wavelength,
      'l-Cone': item['l-Cone'] * b[idx].ri,
      'm-Cone': item['m-Cone'] * b[idx].ri,
      's-Cone': item['s-Cone'] * b[idx].ri,
    };
  });
}

export default class MetaResponse {
  constructor(parentElem = document.body, selectorElem) {
    this.parentElem = parentElem;
    this.selectorElem = selectorElem;

    // Bind dropdown selection behavior
    this.selectorElem.addEventListener('change', (e) => {
      let updatedData = multiply(HER_DATA, LPD_DATA[e.target.value].data);

      this.line = [
        new Line(updatedData, LINE_PARAMS.l),
        new Line(updatedData, LINE_PARAMS.m),
        new Line(updatedData, LINE_PARAMS.s),
      ];

      this.line.forEach((item) => {
        this.plot.update(item);
      });

      let redSum = updatedData.reduce((acc, curr) => {
        return acc + curr['l-Cone'];
      }, 0);

      let greenSum = updatedData.reduce((acc, curr) => {
        return acc + curr['m-Cone'];
      }, 0);

      let blueSum = updatedData.reduce((acc, curr) => {
        return acc + curr['s-Cone'];
      }, 0);

      this.plot.sums
        .transition()
        .duration(this.plot.params.updateDuration)
        .text(`Blue: ${blueSum.toFixed(2)}, Green: ${greenSum.toFixed(2)}, Red: ${redSum.toFixed(2)}`);

      this.plot.color
        .transition()
        .duration(this.plot.params.updateDuration)
        .style('fill', d3.rgb(redSum, greenSum, blueSum).toString());
    });

    // Inject the plot into the parent DOM element
    this.plotElem = document.createElement('figure');
    this.plotElem.classList.add('metaResponse', 'plot');
    this.parentElem.appendChild(this.plotElem);

    this.plot = new LinePlot(this.plotElem, PLOT_PARAMS);
    this.line = [
      new Line(DATA, LINE_PARAMS.l),
      new Line(DATA, LINE_PARAMS.m),
      new Line(DATA, LINE_PARAMS.s),
    ];

    // Draw all the lines into the plot
    this.line.forEach((item) => {
      this.plot.draw(item);
    });

    let redSum = DATA.reduce((acc, curr) => {
      return acc + curr['l-Cone'];
    }, 0);

    let greenSum = DATA.reduce((acc, curr) => {
      return acc + curr['m-Cone'];
    }, 0);

    let blueSum = DATA.reduce((acc, curr) => {
      return acc + curr['s-Cone'];
    }, 0);

    this.plot.sums = this.plot.plot
      .append('text')
      .attr('transform', `translate(${this.plot.figWidth}, 20)`)
      .attr('style', 'text-anchor: end')
      .text(`Blue: ${blueSum.toFixed(2)}, Green: ${greenSum.toFixed(2)}, Red: ${redSum.toFixed(2)}`);

    this.plot.color = this.plot.plot
      .append('rect')
      .attr('x', this.plot.figWidth - 20)
      .attr('y', 30)
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', d3.rgb(redSum, greenSum, blueSum).toString());

    return this;
  }

  hide() {
    this.plotElem.style.display = 'none';
  }

  show() {
    this.plotElem.style.display = null;
  }
}
