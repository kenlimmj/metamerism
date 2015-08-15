/*
* @Author: Lim Mingjie, Kenneth
* @Date:   2015-08-10 13:52:57
* @Last Modified by:   Lim Mingjie, Kenneth
* @Last Modified time: 2015-08-10 18:47:15
*/

const M_PLOT_ELEM = document.querySelector('.metamer');

const M_PLOT_PARAMS = {
  xAxisLabel: 'Wavelength (nm)',
  xAxisClamp: {
    min: 390,
    max: 800
  },
  yAxisLabel: 'Relative Intensity (%)'
}

const M_PLOT_DATA = multiply(spd[100].data, cf);

function multiply(spdData, cfData) {
  return _.compact(spdData.map((item, idx) => {
    if (item.wavelength >= M_PLOT_PARAMS.xAxisClamp.min ||
        item.wavelength <= M_PLOT_PARAMS.xAxisClamp.max) {
      return {
        wavelength: item.wavelength,
        result: item.ri * cfData[idx].combined
      };
    } else {
      return null;
    }
  }));
}

const RI_PARAMS = {
  id: 'm line',
  x(data) {
    return data['wavelength'];
  },
  y(data) {
    return data['result'];
  }
}

let riLine = new Line(M_PLOT_DATA, RI_PARAMS);
let mPlot = new LinePlot(M_PLOT_ELEM, M_PLOT_PARAMS);

mPlot.draw(riLine);