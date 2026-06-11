export function getUniqueAccounts(tasks, registry) {
  const seen = new Set();
  for (const task of tasks) {
    if (task.noBooking) continue;
    for (const { debit, credit } of task.bookings ?? [task]) {
      seen.add(debit.account);
      seen.add(credit.account);
    }
  }
  return [...seen]
    .map((name) => {
      const entry = registry.find((r) => r.name === name);
      return { number: entry?.number ?? "", name };
    })
    .sort((a, b) => {
      if (a.number && b.number) {
        const cmp = a.number.localeCompare(b.number);
        return cmp !== 0 ? cmp : a.name.localeCompare(b.name, "de-CH");
      }
      if (a.number) return -1;
      if (b.number) return 1;
      return a.name.localeCompare(b.name, "de-CH");
    });
}

export function filterAccounts(accounts, query) {
  const q = query.trim().toLowerCase();
  if (!q) return accounts;
  return accounts.filter(
    ({ number, name }) => name.toLowerCase().includes(q) || number.includes(q),
  );
}

export function getAccountLedgerItems(tasks, accountName) {
  const items = [];
  for (const task of tasks) {
    if (task.noBooking) continue;
    const isCompound = Boolean(task.bookings);
    const bookings = isCompound ? task.bookings : [task];
    bookings.forEach((booking, bIdx) => {
      const id = isCompound ? `${task.id}-${bIdx}` : task.id;
      if (booking.debit?.account === accountName) {
        items.push({
          id,
          taskId: task.id,
          scenario: task.scenario,
          amount: booking.amount,
          amountValue: parseSwissAmount(booking.amount),
          side: "soll",
          counterAccount: booking.credit.account,
        });
      } else if (booking.credit?.account === accountName) {
        items.push({
          id,
          taskId: task.id,
          scenario: task.scenario,
          amount: booking.amount,
          amountValue: parseSwissAmount(booking.amount),
          side: "haben",
          counterAccount: booking.debit.account,
        });
      }
    });
  }
  return items;
}

function parseSwissAmount(str) {
  return parseFloat(String(str).replace(/'/g, "").replace(/[^0-9.]/g, "")) || 0;
}

