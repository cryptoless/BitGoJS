/// <reference types="node" />
import { TxInput } from 'bitcoinjs-lib';
import { Network } from '../networkTypes';
import { UtxoTransaction } from './UtxoTransaction';
declare const inputTypes: readonly ["multisig", "nonstandard", "nulldata", "pubkey", "pubkeyhash", "scripthash", "witnesspubkeyhash", "witnessscripthash", "witnesscommitment"];
declare type InputType = typeof inputTypes[number];
export interface ParsedSignatureScript {
    isSegwitInput: boolean;
    inputClassification: InputType;
    p2shOutputClassification?: string;
    publicKeys?: Buffer[];
}
export interface ParsedSignatureP2PKH extends ParsedSignatureScript {
    signatures: [Buffer];
    publicKeys: [Buffer];
    pubScript: Buffer;
}
export interface ParsedSignatureScript2Of3 extends ParsedSignatureScript {
    signatures: [Buffer, Buffer] | [Buffer | 0, Buffer | 0, Buffer | 0];
    publicKeys: [Buffer, Buffer, Buffer];
    pubScript: Buffer;
}
export declare function getDefaultSigHash(network: Network): number;
/**
 * Parse a transaction's signature script to obtain public keys, signatures, the sig script,
 * and other properties.
 *
 * Only supports script types used in BitGo transactions.
 *
 * @param input
 * @returns ParsedSignatureScript
 */
export declare function parseSignatureScript(input: TxInput): ParsedSignatureScript | ParsedSignatureP2PKH | ParsedSignatureScript2Of3;
export declare function parseSignatureScript2Of3(input: TxInput): ParsedSignatureScript2Of3;
/**
 * Constraints for signature verifications.
 * Parameters are conjunctive: if multiple parameters are set, a verification for an individual
 * signature must satisfy all of them.
 */
export declare type VerificationSettings = {
    /**
     * The index of the signature to verify. Only iterates over non-empty signatures.
     */
    signatureIndex?: number;
    /**
     * The hex of the public key to verify.
     */
    publicKey?: Buffer;
};
/**
 * Result for a individual signature verification
 */
export declare type SignatureVerification = {
    /** Set to the public key that signed for the signature */
    signedBy: Buffer | undefined;
};
/**
 * Get signature verifications for multsig transaction
 * @param transaction
 * @param inputIndex
 * @param amount - must be set for segwit transactions and BIP143 transactions
 * @param verificationSettings
 * @returns SignatureVerification[] - in order of parsed non-empty signatures
 */
export declare function getSignatureVerifications(transaction: UtxoTransaction, inputIndex: number, amount: number, verificationSettings?: VerificationSettings): SignatureVerification[];
/**
 * @param transaction
 * @param inputIndex
 * @param amount
 * @param verificationSettings - if publicKey is specified, returns true iff any signature is signed by publicKey.
 */
export declare function verifySignature(transaction: UtxoTransaction, inputIndex: number, amount: number, verificationSettings?: VerificationSettings): boolean;
export {};
//# sourceMappingURL=signature.d.ts.map