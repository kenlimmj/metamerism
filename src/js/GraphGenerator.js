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

    this.answerButton = document.createElement('button');
    this.answerButton.classList.add('modeButton');
    this.answerButton.textContent = 'Answer';
    this.answerButton.addEventListener('click', (e) => {
      e.preventDefault();

      this.answerButton.classList.add('modeSelected');
      this.drawButton.classList.remove('modeSelected');

      this.userPlot.hide();
      this.meta.show();
      this.meta.plot.refresh();
    });

    this.drawButton = document.createElement('button');
    this.drawButton.classList.add('modeButton', 'modeSelected');
    this.drawButton.textContent = 'Draw';
    this.drawButton.addEventListener('click', (e) => {
      e.preventDefault();

      this.drawButton.classList.add('modeSelected');
      this.answerButton.classList.remove('modeSelected');

      this.meta.hide();
      this.userPlot.show();
    });

    this.modeSwitch = document.createElement('div');
    this.modeSwitch.classList.add('modeToggle');

    this.modeSwitch.appendChild(this.answerButton);
    this.modeSwitch.appendChild(this.drawButton);

    // Insert in the following order:
    // 1. Light Power Distribution Graph (includes dropdown selector)
    // 2. Multiply Sign
    // 3. Human Eye Response Graph
    // 4. Equal Sign
    // 5. Metamerism Response Graph (Hidden)
    // 6. User Drawing Canvas
    // 7. Mode Selector
    this.lpd = new LightPowerDist(this.graphSetElem);
    this.graphSetElem.appendChild(this.multOperator);

    this.her = new HumanEyeResponse(this.graphSetElem);
    this.graphSetElem.appendChild(this.equalOperator);

    this.meta = new MetaResponse(this.graphSetElem, this.lpd.selectorElem);
    this.meta.hide();

    this.userPlot = new UserPlot(this.graphSetElem);
    this.graphSetElem.appendChild(this.modeSwitch);

    // Group all the graphs to synchronize mouse events
    LinePlot.group([this.lpd.plot, this.her.plot, this.meta.plot]);

    return this;
  }
}
