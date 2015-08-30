import SplinePlot from './SplinePlot';

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

export default class UserPlot {
  constructor(parentElem = document.body) {
    this.parentElem = parentElem;
    this.plotElem = document.createElement('figure');

    this.plotTitle = document.createElement('figcaption');
    this.plotTitle.textContent = 'Draw The Result';
    this.plotElem.appendChild(this.plotTitle);

    // Inject the plot into the parent DOM element
    this.plotElem.classList.add('userDrawing', 'plot');
    this.parentElem.appendChild(this.plotElem);

    this.plot = new SplinePlot(this.plotElem, PLOT_PARAMS);
    this.plot.init();

    return this;
  }
}
