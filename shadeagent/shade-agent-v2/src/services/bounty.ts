import { getAgent } from "../index";
import { logPayout } from "../store/payoutLog";

const NEAR_TO_YOCTO = BigInt("1000000000000000000000000");

function toYocto(near: string): string {
  const nearNum = parseFloat(near);
  if (isNaN(nearNum)) return "0";
  return (BigInt(Math.floor(nearNum * 1e24))).toString();
}

function fromYocto(yocto: string): string {
  try {
    const yoctoNum = BigInt(yocto);
    return (Number(yoctoNum) / 1e24).toFixed(4);
  } catch {
    return "0";
  }
}

export async function registerRepo(
  repoId: string,
  maintainerNearId: string,
): Promise<{ success: boolean; error?: string }> {
  try {

    const agent = getAgent();
    console.log("Agent account ID:", agent.accountId());
    console.log("Is whitelisted:", await agent.isWhitelisted());
    await agent.call({
      methodName: "register_repo",
      args: {
        repo_id: repoId,
        maintainer_id: maintainerNearId,
      },
      gas: BigInt("30000000000000"),
    });
    console.log(`Registered repo: ${repoId} with maintainer: ${maintainerNearId}`);
    return { success: true };
  } catch (error: any) {
    const message = error?.message ? String(error.message) : "Unknown error";
    console.error("Failed to register repo:", error);
    return { success: false, error: message };
  }
}

export async function getBounty(repoFullName: string): Promise<string> {
  try {
    const agent = getAgent();
    const result = await agent.view<{ amount?: string }>({
      methodName: "get_bounty",
      args: { repo_id: repoFullName },
    });
    const yocto = result || "0";
    return fromYocto(String(yocto));
  } catch (error) {
    console.error("Failed to fetch bounty amount:", error);
    return "0";
  }
}

interface ReleaseBountyInput {
  repoFullName: string;
  contributorWallet: string;
  prNumber: number;
  amount?: string;
}

export async function releaseBounty(
  input: ReleaseBountyInput,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { repoFullName, contributorWallet, prNumber } = input;
  const amount = input.amount || (await getBounty(repoFullName));

  console.log(
    `Attempting bounty payout: repo=${repoFullName} pr=${prNumber} contributor=${contributorWallet} amount=${amount} NEAR`,
  );

  try {
    const agent = getAgent();
    const amountYocto = toYocto(amount);

    const result: any = await agent.call({
      methodName: "release_bounty",
      args: {
        repo_id: repoFullName,
        recipient: contributorWallet,
        amount: amountYocto,
      },
      gas: BigInt("100000000000000"),
    });

    if (process.env.DEBUG === "true") {
      console.log("Payout transaction result:", JSON.stringify(result, null, 2));
    }

    const txHash =
      result?.transaction?.hash ||
      result?.transaction_outcome?.id ||
      result?.id ||
      result?.hash ||
      (typeof result === "string" ? result : "unknown");

    logPayout({
      repo: repoFullName,
      prNumber,
      contributorWallet,
      amount,
      success: true,
      txHash,
      timestamp: new Date().toISOString(),
    });

    return { success: true, txHash };
  } catch (error: any) {
    const message = error?.message ? String(error.message) : "Unknown error";
    console.error("Bounty payout failed:", error);

    logPayout({
      repo: repoFullName,
      prNumber,
      contributorWallet,
      amount,
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });

    return { success: false, error: message };
  }
}
