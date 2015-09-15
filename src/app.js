// Load non-JS assets for Webpack
import './index.html';
import './css/styles.css';

// Bind Mobile Click Delay Polyfill
import FastClick from 'fastclick';
FastClick.attach(document.body);

import GraphGenerator from './js/GraphGenerator';

const MAIN_ELEM = document.querySelector('main');

const LEFT_BOUND_BUTTON = document.querySelector('.leftMost > .addGraph');
const LEFT_HELPER_TEXT = document.querySelector('.leftMost > .helperText');

const RIGHT_BOUND = document.querySelector('.rightMost');
const RIGHT_BOUND_BUTTON = document.querySelector('.rightMost > .addGraph');
const RIGHT_HELPER_TEXT = document.querySelector('.rightMost > .helperText');

let graphList = [];
graphList.push(new GraphGenerator(MAIN_ELEM, RIGHT_BOUND));

RIGHT_BOUND_BUTTON.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Insert the new set of graphs to the left of the right button
  graphList.push(new GraphGenerator(MAIN_ELEM, RIGHT_BOUND));

  if (graphList.length === 2) {
    LEFT_HELPER_TEXT.classList.add('hidden');
    RIGHT_HELPER_TEXT.classList.add('hidden');
  }

  if (graphList.length === 3) {
    LEFT_BOUND_BUTTON.disabled = true;
    RIGHT_BOUND_BUTTON.disabled = true;
  }

  graphList.forEach((item) => {
    item.lpd.plot.refresh();
    item.her.plot.refresh();
    item.meta.plot.refresh();
    item.meta.redraw();
    item.userPlot.plot.refresh();
  });
});

LEFT_BOUND_BUTTON.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Insert the new set of graphs to the right of the left button
  graphList.push(new GraphGenerator(MAIN_ELEM, document.querySelectorAll('.graph')[0]));

  if (graphList.length === 2) {
    LEFT_HELPER_TEXT.classList.add('hidden');
    RIGHT_HELPER_TEXT.classList.add('hidden');
  }

  if (graphList.length === 3) {
    LEFT_BOUND_BUTTON.disabled = true;
    RIGHT_BOUND_BUTTON.disabled = true;
  }

  graphList.forEach((item) => {
    item.lpd.plot.refresh();
    item.her.plot.refresh();
    item.meta.plot.refresh();
    item.meta.redraw();
    item.userPlot.plot.refresh();
  });
});
