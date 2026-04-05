export function generatePeriodsFromStartDate(startDate: string, currentMonth: string) {
  const periods: { value: string; label: string }[] = [];
  const start = new Date(startDate);
  let currentPeriod = new Date(start.getFullYear(), start.getMonth(), 1);
  const endPeriod = new Date(
    parseInt(currentMonth.split('-')[0], 10),
    parseInt(currentMonth.split('-')[1], 10) - 1,
    1
  );

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  while (currentPeriod <= endPeriod) {
    const year = currentPeriod.getFullYear();
    const month = String(currentPeriod.getMonth() + 1).padStart(2, '0');
    const periodKey = `${year}-${month}`;
    periods.push({
      value: periodKey,
      label: `${monthNames[currentPeriod.getMonth()]} ${year}`,
    });
    currentPeriod.setMonth(currentPeriod.getMonth() + 1);
  }
  return periods;
}

export function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
}
