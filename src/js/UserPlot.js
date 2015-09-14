import SplinePlot from './SplinePlot';

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

export default class UserPlot {
  constructor(parentElem = document.body) {
    this.parentElem = parentElem;
    this.plotElem = document.createElement('figure');

    // Inject the plot into the parent DOM element
    this.plotElem.classList.add('userDrawing', 'plot');
    this.parentElem.appendChild(this.plotElem);

    this.plot = new SplinePlot(this.plotElem, PLOT_PARAMS);
    this.plot.init();

    return this;
  }

  hide() {
    this.plotElem.style.display = 'none';
  }

  show() {
    this.plotElem.style.display = null;
  }
}
