/// <reference types="node" />
import { UtxoTransactionBuilder } from '../UtxoTransactionBuilder';
import { Network } from '../../networkTypes';
import { DashTransaction } from './DashTransaction';
import { Transaction } from 'bitcoinjs-lib';
export declare class DashTransactionBuilder extends UtxoTransactionBuilder<DashTransaction> {
    constructor(network: Network, txb?: UtxoTransactionBuilder);
    createInitialTransaction(network: Network, tx?: Transaction): DashTransaction;
    setType(type: number): void;
    setExtraPayload(extraPayload?: Buffer): void;
    static fromTransaction(tx: DashTransaction): DashTransactionBuilder;
}
//# sourceMappingURL=DashTransactionBuilder.d.ts.map