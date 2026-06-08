import {
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE, USDC_ISSUER } from './stellar';

export type AssetCode = 'XLM' | 'USDC';

/** Build an unsigned classic payment transaction and return its XDR. */
export async function buildPaymentXDR(
  sender: string,
  destination: string,
  amount: string,
  assetCode: AssetCode,
): Promise<string> {
  const asset =
    assetCode === 'XLM' ? Asset.native() : new Asset('USDC', USDC_ISSUER);

  // Use Horizon to load the account (standard for classic payments)
  const account = await horizon.loadAccount(sender);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.payment({ destination, asset, amount }))
    .setTimeout(60)
    .build();

  return tx.toXDR();
}

/** Submit a Freighter-signed XDR. Returns the transaction hash. */
export async function submitSignedXDR(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  
  try {
    const res = await horizon.submitTransaction(tx);
    return res.hash;
  } catch (e: any) {
    // Horizon errors are in e.response.data.extras.result_codes
    const resultCodes = e.response?.data?.extras?.result_codes;
    if (resultCodes) {
      const codes = [
        resultCodes.transaction,
        ...(resultCodes.operations || []),
      ];
      
      if (codes.includes('op_no_trust')) {
        throw new Error('Recipient has no USDC trustline. Ask them to click "Enable USDC".');
      }
      if (codes.includes('op_underfunded')) {
        throw new Error('Insufficient funds. Check your USDC or XLM balance.');
      }
      if (codes.includes('op_no_destination')) {
        throw new Error('Recipient account does not exist. Fund it with XLM first.');
      }
      throw new Error(`Stellar Error: ${codes.join(', ')}`);
    }
    throw e;
  }
}

/**
 * Poll until the transaction reaches finality.
 * For Horizon, submitTransaction already waits for ledger inclusion,
 * so polling is often just a secondary check or for multi-stage flows.
 */
export async function pollTransaction(hash: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await horizon.transactions().transaction(hash).call();
      if (res.successful) return;
      throw new Error('Transaction failed on-chain');
    } catch (e: any) {
      if (e.response?.status === 404) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw e;
    }
  }
  throw new Error('Transaction timeout');
}
