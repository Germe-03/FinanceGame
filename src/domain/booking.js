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

