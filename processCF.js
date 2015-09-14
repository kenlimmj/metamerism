'use strict';

let fs = require('fs');
let _ = require('lodash');

let data = fs.readFileSync('./src/data/raw/coneFundamentals.json');

let result = JSON.parse(data).map(function(item) {
  return {
    wavelength: item.wavelength,
    'l-Cone': item.xbar,
    'm-Cone': item.ybar,
    's-Cone': item.zbar,
    combined: item.xbar + item.ybar + item.zbar,
  };
});

fs.writeFile('./src/data/her.json', JSON.stringify(result));
