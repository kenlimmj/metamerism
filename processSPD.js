'use strict';

let fs = require('fs');
let csv = require('babyparse');
let _ = require('lodash');
let json = require('json-format');
let store = [];

function isInteger(input) {
  return input % 1 === 0;
}

function parseData(input) {
  const lowerBound = 393;
  const upperBound = 714;

  const PARSE_CONFIG = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  };

  let result = csv.parse(input, PARSE_CONFIG).data;

  let filteredResults = _.compact(result.map(function(item) {
    if (isInteger(item.wavelength) &&
      item.wavelength >= lowerBound &&
      item.wavelength <= upperBound) {
      return {
        wavelength: item.wavelength,
        ri: item[Object.keys(item)[1]],
      };
    } else {
      return null;
    }
  }));

  let maxY = _.max(filteredResults, function(item) {
    return item.ri;
  }).ri;

  filteredResults.forEach(function(item) {
    item.ri /= maxY;
  });

  return filteredResults;
}

for (let i = 2469; i <= 2656; i++) {
  let data = fs.readFileSync(`./src/data/raw/${i}.json`);
  store.push(JSON.parse(data));
}

let processedStore = store.map(function(item) {
  let lightName = '';

  if (item.brand && item.brand !== '-') {
    lightName += item.brand.charAt(0).toUpperCase() + item.brand.slice(1);
  }

  if (item.category &&
    item.category !== item.brand) {
    lightName += ` ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`;
  }

  if (item.lamptype &&
    item.lamptype !== item.brand &&
    item.lamptype !== item.category) {
    lightName += ` ${item.lamptype.charAt(0).toUpperCase() + item.lamptype.slice(1)}`;
  }

  let lightPB = item.percentblue ? ` [PB: ${item.percentblue}]` : '';

  return {
    id: `${lightName}${lightPB}`,
    data: parseData(item.spectraldata),
  };
});

fs.writeFile('./src/data/lpd.json', `${json(processedStore)}`);
