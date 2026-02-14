export interface PayoutEntry {
  repo: string;
  prNumber: number;
  contributorWallet: string;
  amount: string;
  success: boolean;
  txHash?: string;
  error?: string;
  timestamp: string;
}

const payoutLog: PayoutEntry[] = [];

export function logPayout(entry: PayoutEntry): void {
  payoutLog.unshift(entry);
}

export function getPayouts(): PayoutEntry[] {
  return [...payoutLog];
}

export function getPayoutsByRepo(repo: string): PayoutEntry[] {
  return payoutLog.filter((entry) => entry.repo === repo);
}

export function getPayoutStats() {
  const total = payoutLog.length;
  const successful = payoutLog.filter((entry) => entry.success).length;
  const failed = total - successful;
  return { total, successful, failed };
}
