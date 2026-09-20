import { IDENTITIES } from "./identities.ts";
import {
  MAX_FEE_SATS,
  PER_PAYMENT_SATS,
  buildBoundedReleaseArtifact,
  reviewedBoundedRelease,
  type ReviewedArtifact,
} from "./artifacts.ts";
import { publicConfig } from "./config.server.ts";
import { lockingBytecodeHexFromAddress } from "./encoding.ts";
import { organizationForNetwork, pkhForAccount } from "./org.server.ts";
import type { Network } from "./types.ts";

async function liveOrganization(network: Network) {
  const organization = await organizationForNetwork(network);
  if (!organization)
    throw new Error("Create a WalletConnect organization before preparing a covenant");
  if (!organization.recipientAccount) {
    throw new Error("Enroll a payout recipient wallet before preparing a covenant");
  }
  const operatorPkh = pkhForAccount(organization.ownerAccount);
  if (!operatorPkh) throw new Error("Organization owner account is not a valid BCH P2PKH account");
  return { organization, operatorPkh };
}

export async function liveBoundedReleaseArtifact(network: Network): Promise<ReviewedArtifact> {
  if (publicConfig().mode === "demo") return reviewedBoundedRelease;
  const { organization, operatorPkh } = await liveOrganization(network);
  return buildBoundedReleaseArtifact(
    {
      operatorPkhHex: operatorPkh,
      recipientLockingBytecodeHex: lockingBytecodeHexFromAddress(organization.recipientAccount!),
      maxPaymentSatoshis: organization.covenantMaxPaymentSatoshis ?? PER_PAYMENT_SATS,
      maxFeeSatoshis: organization.covenantMaxFeeSatoshis ?? MAX_FEE_SATS,
    },
    network,
  );
}

export async function liveRecipient(network: Network) {
  if (publicConfig().mode === "demo") {
    return { address: IDENTITIES.vendor.account, lock: IDENTITIES.vendor.lockingBytecodeHex };
  }
  const { organization } = await liveOrganization(network);
  const address = organization.recipientAccount!;
  return { address, lock: lockingBytecodeHexFromAddress(address) };
}
