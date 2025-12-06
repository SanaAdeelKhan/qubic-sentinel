/**
 * Very small rule engine for MVP.
 * Input tx is the raw transaction object from RPC. We try to handle common fields.
 */

const WHALE_THRESHOLD = BigInt(process.env.WHALE_THRESHOLD_QU || '5000');

function asBigInt(value) {
  try {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.floor(value));
    if (typeof value === 'string') {
      // remove non-digit characters
      const cleaned = value.replace(/[^\d-]/g, '');
      if (cleaned === '') return BigInt(0);
      return BigInt(cleaned);
    }
    return BigInt(0);
  } catch {
    return BigInt(0);
  }
}

export function evaluateTx(tx) {
  // tx shape varies. Try to extract amount, from, to, id
  const txId = tx.id || tx.transactionId || tx.txid || tx.hash || null;
  let amount = null;

  // Common: tx.amount or tx.amounts
  if (tx.amount != null) amount = tx.amount;
  else if (tx.value != null) amount = tx.value;
  else if (tx.amounts && Array.isArray(tx.amounts) && tx.amounts[0]) amount = tx.amounts[0].amount || tx.amounts[0].value;

  const from = tx.from || tx.sender || tx.source || (tx.inputs && tx.inputs[0] && tx.inputs[0].address) || null;
  const to = tx.to || tx.receiver || tx.destination || (tx.outputs && tx.outputs[0] && tx.outputs[0].address) || null;

  const amountBig = asBigInt(amount ?? 0);

  if (amountBig >= WHALE_THRESHOLD) {
    return {
      alert: true,
      payload: {
        kind: 'whale_transfer',
        txId,
        from,
        to,
        amount: amountBig.toString(),
        raw: tx
      }
    };
  }

  // example more complex rule can be added here (multi-transfer, contract calls, etc.)

  return { alert: false };
}

