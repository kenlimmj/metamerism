/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-08 20:23:46
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-09 11:41:00
 */

const BASE_URL = 'http://galileo.graphycs.cegepsherbrooke.qc.ca/app/en/lamps/';

let http = require('http');
let fs = require('fs');

function download(url, dest) {
  let file = fs.createWriteStream(dest);
  let request = http.get(url, (response) => {
    response.pipe(file);
  });
};

for (let i = 2469; i <= 2656; i++) {
  download(`${BASE_URL}${i}.json`, `./dist/data/spd/${i}.json`);
};
