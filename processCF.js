/*
* @Author: Lim Mingjie, Kenneth
* @Date:   2015-08-09 22:46:21
* @Last Modified by:   Lim Mingjie, Kenneth
* @Last Modified time: 2015-08-09 22:50:01
*/

'use strict';

let fs = require('fs');
let _ = require('lodash');

let data = fs.readFileSync('./dist/data/coneFundamentals.json');

let result = JSON.parse(data).map(function(item) {
  return {
    wavelength: item.wavelength,
    xbar: item.xbar,
    ybar: item.ybar,
    zbar: item.zbar,
    combined: item.xbar + item.ybar + item.zbar
  }
});

fs.writeFile('./dist/data/coneFundamentals.json', JSON.stringify(result));