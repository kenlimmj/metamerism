/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-10 19:18:48
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-12 22:19:40
 */

(function() {
  const globalData = _.sortBy(spd, (item) => {
    return item.id;
  });

  const domElem = document.querySelector('.lightPowerDist');

  const params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730,
    },
    yAxisLabel: 'Relative Intensity',
  };

  const lineParams = {
    id: 'ri',
    x(data) {
      return data.wavelength;
    },
    y(data) {
      return data.ri;
    },
  };

  let plot = new LinePlot(domElem, params);
  let line = new Line(globalData[0].data, lineParams);

  plot.draw(line);

  const selectorElem = document.querySelector('.lpd--data-selector');

  globalData.forEach((item, idx) => {
    let opt = document.createElement('option');
    opt.textContent = item.id;
    opt.value = idx;
    selectorElem.appendChild(opt);
  });

  selectorElem.addEventListener('change', (e) => {
    line = new Line(globalData[e.target.value].data, lineParams);
    plot.update(line);
  });
})();
