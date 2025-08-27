const fs = require('fs');
const path = require('path');

function gammaScore() {
  return 1;
}

function gammaThreshold(mode) {
  const thresholds = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'gamma.json'), 'utf8')
  );
  return thresholds[mode] ?? thresholds.fast;
}

function costOk() {
  const policy = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'cost.json'), 'utf8')
  );
  return policy.spent <= policy.budget;
}

function compute() {
  const gamma = gammaScore();
  const gammaThresholdVal = gammaThreshold(process.env.MODE || 'fast');
  const costOkVal = costOk();
  const policy = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'cost.json'), 'utf8')
  );
  const budgetNote = `${policy.spent}/${policy.budget}`;
  return { gamma, gammaThreshold: gammaThresholdVal, costOk: costOkVal, budgetNote };
}

module.exports = { compute };
