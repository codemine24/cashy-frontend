export function formatCurrency(
  amount: number | string,
  options?: {
    currency?: string;
    showSymbol?: boolean;
  },
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: options?.showSymbol ? "currency" : "decimal",
    currency: options?.currency || "USD",
  }).format(numericAmount || 0);
}

export function formatNumber(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount || 0);
}

/**
 * Convert local date to UTC and format as YYYY-MM-DD
 */
export function formatDateToUTC(date: Date): string {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert local date to UTC and format as HH:mm:ss
 */
export function formatTimeToUTC(date: Date): string {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const hours = String(utcDate.getHours()).padStart(2, "0");
  const minutes = String(utcDate.getMinutes()).padStart(2, "0");
  const seconds = String(utcDate.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Convert local date to UTC ISO string
 */
export function toUTCISOString(date: Date): string {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toISOString();
}

/**
 * Convert local date to UTC Date object
 */
export function toUTCDate(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function formatUpdateDate(dateString: string | undefined): string {
  if (!dateString) return "Updated just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Updated ${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    }
    const hours = Math.floor(diffHours);
    return `Updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(",", "");

  return `Updated on ${formattedDate}`;
}
export function timeAgo(dateString: string | undefined): string {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    }
    const hours = Math.floor(diffHours);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(",", "");

  return formattedDate;
}

export function getWalletColorCombination(index: number) {
  const colorCombinations = [
    { bg: "#DBEAFE", text: "#2563EB" }, // blue
    { bg: "#DCFCE7", text: "#16A34A" }, // green
    { bg: "#F3E8FF", text: "#9333EA" }, // purple
    { bg: "#FED7AA", text: "#EA580C" }, // orange
    { bg: "#FCE7F3", text: "#EC4899" }, // pink
  ];

  return colorCombinations[index % colorCombinations.length];
}
