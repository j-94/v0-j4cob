import gamma from './gamma.json' assert { type: 'json' };
import cost from './cost.json' assert { type: 'json' };

export function gammaScore() {
  return 1.0;
}

export function gammaThreshold(mode = 'fast') {
  return gamma[mode] ?? gamma.fast;
}

export function costOk(value) {
  return value <= cost.cap;
}
