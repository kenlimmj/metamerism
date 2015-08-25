/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-10 19:18:48
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-13 13:06:04
 */

(function() {
  const globalData = _.sortBy(spd, (item) => {
    return item.id;
  });
  
  const domElem = document.querySelector('.result');
  const data = multiply(cf, globalData[0].data);

  const params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730,
    },
    yAxisClamp: {
      min: 0,
      max: 1,
    },
    yAxisLabel: 'Tristimulus Value',
  }

  const lineParams = {
    l: {
      id: 'lConeResult',
      x(data) {
        return data['wavelength'];
      },
      y(data) {
        return data['l-cone'];
      }
    },
    m: {
      id: 'mConeResult',
      x(data) {
        return data['wavelength'];
      },
      y(data) {
        return data['m-cone'];
      }
    },
    s: {
      id: 'sConeResult',
      x(data) {
        return data['wavelength'];
      },
      y(data) {
        return data['s-cone'];
      }
    }
  }

  function multiply(a, b) {
    return a.map(function(item, idx) {
      return {
        wavelength: item.wavelength,
        'l-cone': item['l-cone'] * b[idx].ri,
        'm-cone': item['m-cone'] * b[idx].ri,
        's-cone': item['s-cone'] * b[idx].ri,
      }
    });
  }

  let plot = new LinePlot(domElem, params);

  let lines = {
    l: new Line(data, lineParams.l),
    m: new Line(data, lineParams.m),
    s: new Line(data, lineParams.s)
  }

  Object.keys(lines).forEach((entry) => {
    plot.draw(lines[entry]);
  });

  const selectorElem = document.querySelector('.lpd--data-selector');

  selectorElem.addEventListener('change', (e) => {
    let updatedData = multiply(cf, globalData[e.target.value].data);

    let updatedLines = {
      l: new Line(updatedData, lineParams.l),
      m: new Line(updatedData, lineParams.m),
      s: new Line(updatedData, lineParams.s)
    }

    Object.keys(updatedLines).forEach((entry) => {
      plot.update(updatedLines[entry]);
    });
  });
})();
