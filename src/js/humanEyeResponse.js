import data from 'json!../data/her.json';

import Line from './Line';
import LinePlot from './LinePlot';

import uniqueId from 'lodash.uniqueid';

const DATA = data;
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

export default class HumanEyeResponse {
  constructor(parentElem = document.body) {
    this.parentElem = parentElem;
    this.plotElem = document.createElement('figure');

    this.plotTitle = document.createElement('figcaption');
    this.plotTitle.textContent = 'Color Matching Functions';
    this.plotElem.appendChild(this.plotTitle);

    // Inject the plot into the parent DOM element
    this.plotElem.classList.add('humanEyeResponse', 'plot');
    this.parentElem.appendChild(this.plotElem);

    this.plot = new LinePlot(this.plotElem, PLOT_PARAMS);
    this.line = [
      new Line(DATA, LINE_PARAMS.l),
      new Line(DATA, LINE_PARAMS.m),
      new Line(DATA, LINE_PARAMS.s),
    ];

    // Draw all the lines into the plot
    this.line.map((item) => {
      this.plot.draw(item);
    });

    return this;
  }
}
