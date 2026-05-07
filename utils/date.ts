export const formatApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatEuropeanDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
      : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatReadableDate = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  fallback = "Not available",
  invalidFallback: "fallback" | "input" = "fallback",
) => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return invalidFallback === "input" ? value : fallback;
  }

  return date.toLocaleDateString("en-US", options);
};

export const formatBillingCycleLabel = (billingCycle: string | null | undefined) => {
  if (billingCycle === "1_year") return "Yearly";
  if (billingCycle === "1_month") return "Monthly";
  return "Not selected";
};

export const formatSubscriptionStatus = (status: string | null | undefined) => {
  if (!status) return "Not active";
  return status.charAt(0).toUpperCase() + status.slice(1);
};
