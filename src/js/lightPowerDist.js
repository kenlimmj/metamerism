import Line from './Line';
import LinePlot from './LinePlot';

import data from 'json!../data/lpd.json';

import sortBy from 'lodash.sortby';
import uniqueId from 'lodash.uniqueid';

const DATA = sortBy(data, (item) => {
  return item.id;
});

const PLOT_PARAMS = {
  xAxisLabel: 'Wavelength (nm)',
  xAxisClamp: {
    min: 393,
    max: 714,
  },
  yAxisLabel: 'Relative Intensity',
  yAxisClamp: {
    min: 0,
    max: 1,
  },
};

const LINE_PARAMS = {
  id: uniqueId('ri'),

  x(data) {
    return data.wavelength;
  },

  y(data) {
    return data.ri;
  },
};

export default class LightPowerDist {
  constructor(parentElem = document.body) {
    this.parentElem = parentElem;
    this.plotElem = document.createElement('figure');
    this.selectorElem = document.createElement('select');

    // Configure the selector
    this.selectorElem.classList.add('lightPowerDist', 'selector');
    this.parentElem.appendChild(this.selectorElem);

    // Initialize a document fragment to cache DOM updates
    let optCache = document.createDocumentFragment();

    // Populate the document fragment with selector options
    DATA.forEach((item, idx) => {
      let opt = document.createElement('option');
      opt.textContent = item.id;
      opt.value = idx;
      optCache.appendChild(opt);
    });

    // Update the actual selector
    this.selectorElem.appendChild(optCache);

    // Bind dropdown selection behavior
    this.selectorElem.addEventListener('change', (e) => {
      this.line = new Line(DATA[e.target.value].data, LINE_PARAMS);
      this.plot.update(this.line);
    });

    this.plotTitle = document.createElement('figcaption');
    this.plotTitle.textContent = 'Illuminant Spectral Distribution';
    this.plotElem.appendChild(this.plotTitle);

    // Inject the plot into the parent DOM element
    this.plotElem.classList.add('lightPowerDist', 'plot');
    this.parentElem.appendChild(this.plotElem);

    this.plot = new LinePlot(this.plotElem, PLOT_PARAMS);
    this.line = new Line(DATA[0].data, LINE_PARAMS);

    this.plot.draw(this.line);

    return this;
  }
}
