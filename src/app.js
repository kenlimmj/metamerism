// Load non-JS assets for Webpack
import './index.html';
import './css/styles.css';

// Bind Mobile Click Delay Polyfill
import FastClick from 'fastclick';
FastClick.attach(document.body);

// Load Graph Generators
import LightPowerDist from './js/LightPowerDist';
import HumanEyeResponse from './js/HumanEyeResponse';
import MetaResponse from './js/MetaResponse';

// Load Plotting Helper
import LinePlot from './js/LinePlot';

const MAIN_ELEM = document.querySelector('main');

let graphSetElem = document.createElement('section');
graphSetElem.classList.add('graph');
MAIN_ELEM.appendChild(graphSetElem);

let lpd = new LightPowerDist(graphSetElem);
let her = new HumanEyeResponse(graphSetElem);
let meta = new MetaResponse(graphSetElem);

LinePlot.group([lpd.plot, her.plot, meta.plot]);
