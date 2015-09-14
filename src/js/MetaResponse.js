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

  hide() {
    this.plotElem.style.display = 'none';
  }

  show() {
    this.plotElem.style.display = null;
  }
}
