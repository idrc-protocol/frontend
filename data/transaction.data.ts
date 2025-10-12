export const transactionData = [
  {
    dateTime: 1736937600,
    transactionType: "Deposit",
    product: "3-Month Government Bond",
    amount: 2500.0,
    profitEarned: 0,
    status: "Completed",
  },
  {
    dateTime: 1736937600,
    transactionType: "Claim",
    product: "6-Month Corporate Bond",
    amount: 2500.0,
    profitEarned: 150.0,
    status: "Completed",
  },
  {
    dateTime: 1736937600,
    transactionType: "Withdrawal",
    product: "12-Month High Yield Bond",
    amount: 2500.0,
    profitEarned: 150.0,
    status: "Active",
  },
  {
    dateTime: 1736937600,
    transactionType: "Withdrawal",
    product: "3-Month Government Bond",
    amount: 2500.0,
    profitEarned: 150.0,
    status: "Active",
  },
];

export type TransactionType = typeof transactionData;
