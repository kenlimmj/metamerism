import LinePlot from './LinePlot';

import LightPowerDist from './LightPowerDist';
import HumanEyeResponse from './HumanEyeResponse';
import MetaResponse from './MetaResponse';
import UserPlot from './UserPlot';

export default class GraphGenerator {
  constructor(parentElem = document.body, beforeElem) {
    this.parentElem = parentElem;
    this.beforeElem = beforeElem;

    // Create <span class="operator">×</span>
    this.multOperator = document.createElement('span');
    this.multOperator.classList.add('operator');
    this.multOperator.innerHTML = '&times;';

    // Create <span class="operator">=</span>
    this.equalOperator = document.createElement('span');
    this.equalOperator.classList.add('operator');
    this.equalOperator.innerHTML = '=';

    // Create <section class="graph">...</section>
    this.graphSetElem = document.createElement('section');
    this.graphSetElem.classList.add('graph');
    this.parentElem.insertBefore(this.graphSetElem, this.beforeElem);

    // Insert in the following order:
    // 1. Light Power Distribution Graph (includes dropdown selector)
    // 2. Multiply Sign
    // 3. Human Eye Response Graph
    // 4. Equal Sign
    // 5. Metamerism Response Graph
    this.lpd = new LightPowerDist(this.graphSetElem);
    this.graphSetElem.appendChild(this.multOperator);
    this.her = new HumanEyeResponse(this.graphSetElem);
    this.graphSetElem.appendChild(this.equalOperator);
    // this.meta = new MetaResponse(this.graphSetElem, this.lpd.selectorElem);
    this.userPlot = new UserPlot(this.graphSetElem);

    // Group all the graphs to synchronize mouse events
    // LinePlot.group([this.lpd.plot, this.her.plot, this.meta.plot]);

    return this;
  }
}
