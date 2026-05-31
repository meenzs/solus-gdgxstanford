export interface CurrencyStatus {
  day: {
    status: "CURRENT" | "LAPSED" | "SOON";
    daysRemaining: number;
    text: string;
  };
  night: {
    status: "CURRENT" | "LAPSED" | "SOON";
    daysRemaining: number;
    text: string;
  };
  instrument: {
    status: "CURRENT" | "LAPSED" | "SOON";
    daysRemaining: number;
    text: string;
  };
}

export function computeFARCurrency(
  dayDate: string,
  nightDate: string,
  ifrDate: string,
  referenceDateStr: string = "2026-05-31"
): CurrencyStatus {
  const refDate = new Date(referenceDateStr);

  const get90DayStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { status: "LAPSED" as const, daysRemaining: -999, text: "NO DATA" };
    }
    // Exactly 90 days after the last landing date
    const expireDate = new Date(d.getTime() + 90 * 24 * 60 * 60 * 1000);
    const diffTime = expireDate.getTime() - refDate.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { status: "LAPSED" as const, daysRemaining, text: "LAPSED" };
    } else if (daysRemaining <= 10) {
      return { status: "SOON" as const, daysRemaining, text: `Lapses in ${daysRemaining} d` };
    } else {
      return { status: "CURRENT" as const, daysRemaining, text: `Lapses in ${daysRemaining} d` };
    }
  };

  const getIFRStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { status: "LAPSED" as const, daysRemaining: -999, text: "NO DATA" };
    }
    
    const lastYear = d.getFullYear();
    const lastMonth = d.getMonth(); // 0-indexed (e.g. 10 is Nov)
    
    // FAA FAR 61.57(c) instrument currency rules: 
    // Expires on the last day of the 6th calendar month after the month of the approaches.
    const expireYear = lastYear + Math.floor((lastMonth + 7) / 12);
    const expireMonth = (lastMonth + 7) % 12; // This is the first day of the 7th month after (June 1st), then day 0 gets the end of May.
    const expireDate = new Date(expireYear, expireMonth, 0); 
    
    const diffTime = expireDate.getTime() - refDate.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { status: "LAPSED" as const, daysRemaining, text: "LAPSED" };
    } else if (daysRemaining <= 15) {
      return { status: "SOON" as const, daysRemaining, text: `Lapses in ${daysRemaining} d` };
    } else {
      const monthsRemaining = Math.floor(daysRemaining / 30);
      const text = monthsRemaining > 0 
        ? `Lapses in ${monthsRemaining} mnth${monthsRemaining > 1 ? 's' : ''}` 
        : `Lapses in ${daysRemaining} d`;
      return { status: "CURRENT" as const, daysRemaining, text };
    }
  };

  return {
    day: get90DayStatus(dayDate),
    night: get90DayStatus(nightDate),
    instrument: getIFRStatus(ifrDate),
  };
}
