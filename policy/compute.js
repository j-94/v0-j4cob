const fs = require('fs');
const path = require('path');

function compute(mode = 'fast') {
  const gammaConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'gamma.json'), 'utf8')
  );
  const costConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'cost.json'), 'utf8')
  );

  const gamma = 0;
  const gammaThreshold = gammaConfig[mode] ?? gammaConfig.fast;
  const costOk = true;
  const budgetNote = `window ${costConfig.window}`;

  return { gamma, gammaThreshold, costOk, budgetNote };
}

module.exports = { compute };
