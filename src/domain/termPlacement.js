// Bewertet eine Zuordnung von Begriffen zu Slots.
// slots: [{ id, correct }]; placements: { [slotId]: term | null }.
// Liefert pro Slot ok/erwartet sowie eine Gesamtwertung.
export function evaluateTermPlacement(slots, placements) {
  const results = slots.map((slot) => {
    const placed = placements?.[slot.id] ?? null;
    return { id: slot.id, placed, expected: slot.correct, ok: placed === slot.correct };
  });
  const correctCount = results.filter((result) => result.ok).length;
  return {
    results,
    correctCount,
    total: slots.length,
    allCorrect: slots.length > 0 && correctCount === slots.length,
  };
}
