import { MultiBar, Presets } from "cli-progress";

export const createMultiBar = () => new MultiBar({
  format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}",
  hideCursor: false,
  clearOnComplete: false,
});

export const createProgressBar = (multibar: MultiBar, numTask: number) => multibar.create(numTask, 0, {
  ...Presets.shades_grey,
});

