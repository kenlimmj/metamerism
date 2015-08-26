;(() => {
  const domElem = document.querySelector('.humanEyeResponse');
  const data = cf;
  const params = {
    xAxisLabel: 'Wavelength (nm)',
    xAxisClamp: {
      min: 390,
      max: 730,
    },
    yAxisLabel: 'Tristimulus Value',
  };

  const lineParams = {
    l: {
      id: 'lCone',

      x(data) {
        return data.wavelength;
      },

      y(data) {
        return data['l-cone'];
      },
    },
    m: {
      id: 'mCone',

      x(data) {
        return data.wavelength;
      },

      y(data) {
        return data['m-cone'];
      },
    },
    s: {
      id: 'sCone',

      x(data) {
        return data.wavelength;
      },

      y(data) {
        return data['s-cone'];
      },
    },
  };

  let plot = new LinePlot(domElem, params);

  let lines = {
    l: new Line(data, lineParams.l),
    m: new Line(data, lineParams.m),
    s: new Line(data, lineParams.s),
  };

  Object.keys(lines).forEach((entry) => {
    plot.draw(lines[entry]);
  });

  window.her = plot;
})();
