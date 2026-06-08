import {
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE, USDC_ISSUER } from './stellar';

/**
 * Perform a path payment to swap XLM for USDC.
 * This is essential for the "Full Rail" demo so users can get USDC to pay workers.
 */
export async function swapXlmToUsdc(publicKey: string, amountXlm: string): Promise<string> {
  const account = await horizon.loadAccount(publicKey);
  const usdc = new Asset('USDC', USDC_ISSUER);

  // We want to get at least some USDC for our XLM.
  // This uses a path payment to find the best price on the DEX.
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: amountXlm,
        destination: publicKey,
        destAsset: usdc,
        destMin: '1', // We expect at least 1 USDC for a test swap
        path: [],
      })
    )
    .setTimeout(60)
    .build();

  return tx.toXDR();
}
