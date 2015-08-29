import * as _ from 'lodash';
import * as lpdData from 'json!../data/lpd.json';
import * as herData from 'json!../data/her.json';
import Line from './Line';
import LinePlot from './LinePlot';

const LPD_DATA = _.sortBy(lpdData.default, (item) => {
  return item.id;
});

const HER_DATA = herData.default;

const DATA = multiply(HER_DATA, LPD_DATA[0].data);

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

function multiply(a, b) {
  return a.map((item, idx) => {
    return {
      wavelength: item.wavelength,
      'l-cone': item['l-cone'] * b[idx].ri,
      'm-cone': item['m-cone'] * b[idx].ri,
      's-cone': item['s-cone'] * b[idx].ri,
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

    return this;
  }
}
