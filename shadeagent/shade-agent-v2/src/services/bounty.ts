import crypto from "crypto";
import { JsonRpcProvider } from "@near-js/providers";
import {
  actionCreators,
  createTransaction,
  Signature,
  SignedTransaction,
} from "@near-js/transactions";
import { KeyPair, KeyType } from "@near-js/crypto";
import { baseDecode, parseNearAmount } from "@near-js/utils";
import { requestSignature } from "@neardefi/shade-agent-js";
import { getAgent } from "../index";
import { logPayout } from "../store/payoutLog";

export async function getBounty(repoFullName: string): Promise<string> {
  try {
    const agent = getAgent();
    const result = await agent.view<{ amount?: string }>(
      {
        methodName: "get_bounty",
        args: { repo: repoFullName },
      },
    );
    return result?.amount ?? "0";
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
    const networkId = (process.env.NETWORK_ID || "testnet") as
      | "testnet"
      | "mainnet";
    const rpcUrl =
      networkId === "mainnet"
        ? "https://rpc.mainnet.near.org"
        : "https://rpc.testnet.near.org";
    const provider = new JsonRpcProvider({ url: rpcUrl });

    const agentAccountId = agent.accountId();
    const [privateKey] = agent.getPrivateKeys(true);
    const keyPair = KeyPair.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();

    const accessKey = await provider.viewAccessKey(
      agentAccountId,
      publicKey.toString(),
    );

    const block = await provider.block({ finality: "final" });
    const blockHash = baseDecode(block.header.hash);

    const yoctoAmount = parseNearAmount(amount) || "0";

    const actions = [actionCreators.transfer(BigInt(yoctoAmount))];
    const transaction = createTransaction(
      agentAccountId,
      publicKey,
      contributorWallet,
      accessKey.nonce + BigInt(1),
      actions,
      blockHash,
    );

    const encodedTx = transaction.encode();
    const txHashBytes = crypto.createHash("sha256").update(encodedTx).digest();
    const payloadHex = Buffer.from(txHashBytes).toString("hex");

    const signatureHex = await requestSignature({
      path: "bounty-payouts",
      payload: payloadHex,
      keyType: "Eddsa",
      keyVersion: 0,
    } as any);

    const signatureBytes = Buffer.from(
      String(signatureHex).replace(/^0x/, ""),
      "hex",
    );

    const signedTx = new SignedTransaction({
      transaction,
      signature: new Signature({
        keyType: KeyType.ED25519,
        data: signatureBytes,
      }),
    });

    const outcome = await provider.sendTransaction(signedTx);
    const txHash = outcome.transaction.hash;

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
