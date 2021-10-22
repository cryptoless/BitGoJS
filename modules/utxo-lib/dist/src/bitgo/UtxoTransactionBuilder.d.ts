/// <reference types="node" />
import { Transaction, TransactionBuilder } from 'bitcoinjs-lib';
import * as bitcoinjs from 'bitcoinjs-lib';
import { Network } from '../networkTypes';
import { UtxoTransaction } from './UtxoTransaction';
interface TxbSignArg {
    prevOutScriptType: string;
    vin: number;
    keyPair: bitcoinjs.ECPair.Signer;
    redeemScript?: Buffer;
    hashType?: number;
    witnessValue?: number;
    witnessScript?: Buffer;
}
export declare class UtxoTransactionBuilder<T extends UtxoTransaction = UtxoTransaction> extends TransactionBuilder {
    constructor(network: Network, txb?: TransactionBuilder);
    createInitialTransaction(network: Network, tx?: Transaction): UtxoTransaction;
    static fromTransaction(tx: UtxoTransaction): UtxoTransactionBuilder;
    get tx(): T;
    build(): T;
    buildIncomplete(): T;
    sign(signParams: number | TxbSignArg, keyPair?: bitcoinjs.ECPair.Signer, redeemScript?: Buffer, hashType?: number, witnessValue?: number, witnessScript?: Buffer): void;
}
export {};
//# sourceMappingURL=UtxoTransactionBuilder.d.ts.map