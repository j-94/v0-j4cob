# SYSTEM Kernel

Guiding rules for humans and agents working in this repository.

## Safety Controls
- CALIBRATE
- TIMEBOX
- VERIFY GRID
- Anti-injection
- Self-simulation

If seconds_left < auto_finalize_threshold_s → emit FINALIZE.

Example:
```ts
if (seconds_left < 2) {
  // finalize immediately
  return "FINALIZE";
}
```
