/// <reference types="node" />
import { Network } from '../networkTypes';
import { UtxoTransaction } from './UtxoTransaction';
import { UtxoTransactionBuilder } from './UtxoTransactionBuilder';
export declare function createTransactionFromBuffer(buf: Buffer, network: Network): UtxoTransaction;
export declare function createTransactionFromHex(hex: string, network: Network): UtxoTransaction;
export declare function setTransactionBuilderDefaults(txb: UtxoTransactionBuilder, network: Network): void;
export declare function createTransactionBuilderForNetwork(network: Network): UtxoTransactionBuilder;
export declare function createTransactionBuilderFromTransaction(tx: UtxoTransaction): UtxoTransactionBuilder;
//# sourceMappingURL=transaction.d.ts.map