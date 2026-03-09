export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(numericAmount || 0);
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
