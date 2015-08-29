import * as data from 'json!../data/her.json';
import Line from './Line';
import LinePlot from './LinePlot';

const DATA = data.default;
const PLOT_PARAMS = {
  xAxisLabel: 'Wavelength (nm)',
  xAxisClamp: {
    min: 390,
    max: 730,
  },
  yAxisLabel: 'Tristimulus Value',
  yAxisClamp: {
    min: 0,
    max: 1,
  },
};

const LINE_PARAMS = {
  l: {
    id: _.uniqueId('lCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['l-cone'];
    },
  },
  m: {
    id: _.uniqueId('mCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['m-cone'];
    },
  },
  s: {
    id: _.uniqueId('sCone'),

    x(data) {
      return data.wavelength;
    },

    y(data) {
      return data['s-cone'];
    },
  },
};

export default class HumanEyeResponse {
  constructor(parentElem = document.body) {
    this.parentElem = parentElem;
    this.plotElem = document.createElement('figure');

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
