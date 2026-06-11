export function getAccountLedgerItems(tasks, accountName) {
  const items = [];
  for (const task of tasks) {
    if (task.noBooking) continue;
    const isCompound = Boolean(task.bookings);
    const bookings = isCompound ? task.bookings : [task];
    bookings.forEach((booking, bookingIndex) => {
      const side = booking.debit?.account === accountName ? "soll"
        : booking.credit?.account === accountName ? "haben"
        : null;
      if (!side) return;
      items.push({
        id: isCompound ? `${task.id}-${bookingIndex}` : task.id,
        taskId: task.id,
        scenario: task.scenario,
        amount: booking.amount,
        amountValue: parseAmount(booking.amount),
        side,
        counterAccount: side === "soll" ? booking.credit.account : booking.debit.account,
      });
    });
  }
  return items;
}

export function parseAmount(value) {
  return parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
}

export function formatSwissAmount(value) {
  const [integer, decimals] = value.toFixed(2).split(".");
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.${decimals}`;
}

const AMOUNT_TOLERANCE = 0.05;

export function evaluateLedgerClosing(items, placements, { saldo, saldoSide, kontrollsumme }) {
  let correctSollTotal = 0;
  let correctHabenTotal = 0;
  let placementScore = 0;
  for (const item of items) {
    if (item.side === "soll") correctSollTotal += item.amountValue;
    else correctHabenTotal += item.amountValue;
    if (placements[item.id] === item.side) placementScore++;
  }

  const correctKS = Math.max(correctSollTotal, correctHabenTotal);
  const correctSaldo = Math.abs(correctSollTotal - correctHabenTotal);
  const correctSaldoSide = correctSollTotal > correctHabenTotal ? "haben" : "soll";

  return {
    correctSollTotal,
    correctHabenTotal,
    correctKS,
    correctSaldo,
    correctSaldoSide,
    placementScore,
    userSaldoOk: Math.abs(parseAmount(saldo) - correctSaldo) < AMOUNT_TOLERANCE,
    userSaldoSideOk: saldoSide === correctSaldoSide,
    userKsOk: Math.abs(parseAmount(kontrollsumme) - correctKS) < AMOUNT_TOLERANCE,
  };
}
