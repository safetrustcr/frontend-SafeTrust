export interface TransactionRow {
  bookingId: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  asset: string;
  status: string;
}

export function exportTransactionsToCSV(
  transactions: TransactionRow[],
  filename = "safetrust-transactions.csv",
): void {
  const headers = [
    "Booking ID",
    "Hotel",
    "Check-in",
    "Check-out",
    "Amount",
    "Asset",
    "Status",
  ];

  const rows = transactions.map((t) => [
    t.bookingId,
    t.hotel,
    t.checkIn,
    t.checkOut,
    t.amount.toFixed(2),
    t.asset,
    t.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
