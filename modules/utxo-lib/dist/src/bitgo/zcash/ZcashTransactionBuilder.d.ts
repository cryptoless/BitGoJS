/// <reference types="node" />
import { Transaction } from 'bitcoinjs-lib';
import { ZcashTransaction } from './ZcashTransaction';
import { Network, ZcashNetwork } from '../../networkTypes';
import { UtxoTransactionBuilder } from '../UtxoTransactionBuilder';
export declare class ZcashTransactionBuilder extends UtxoTransactionBuilder<ZcashTransaction> {
    constructor(network: ZcashNetwork);
    createInitialTransaction(network: Network, tx?: Transaction): ZcashTransaction;
    static fromTransaction(transaction: ZcashTransaction): ZcashTransactionBuilder;
    setVersion(version: number, overwinter?: boolean): void;
    setConsensusBranchId(consensusBranchId: number): void;
    setVersionGroupId(versionGroupId: number): void;
    setExpiryHeight(expiryHeight: number): void;
    build(): ZcashTransaction;
    buildIncomplete(): ZcashTransaction;
    addOutput(scriptPubKey: string | Buffer, value: number): number;
}
//# sourceMappingURL=ZcashTransactionBuilder.d.ts.map