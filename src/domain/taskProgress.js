export function summarizeProgress(completedFlags) {
  const total = completedFlags.length;
  const done = completedFlags.filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
