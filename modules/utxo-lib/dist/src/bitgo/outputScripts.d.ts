/// <reference types="node" />
export declare const scriptTypes2Of3: readonly ["p2sh", "p2shP2wsh", "p2wsh", "p2tr"];
export declare type ScriptType2Of3 = typeof scriptTypes2Of3[number];
export declare function isScriptType2Of3(t: string): t is ScriptType2Of3;
/**
 * @param t
 * @return string prevOut as defined in PREVOUT_TYPES (bitcoinjs-lib/.../transaction_builder.js)
 */
export declare function scriptType2Of3AsPrevOutType(t: ScriptType2Of3): string;
export declare type SpendableScript = {
    scriptPubKey: Buffer;
    redeemScript?: Buffer;
    witnessScript?: Buffer;
    /** A triple of control blocks for the user+bitgo, user+backup, and backup+bitgo scripts in that order. */
    controlBlocks?: [userBitGoScript: Buffer, userBackupScript: Buffer, backupBitGoScript: Buffer];
};
/**
 * Return scripts for p2sh-p2pk (used for BCH/BSV replay protection)
 * @param pubkey
 */
export declare function createOutputScriptP2shP2pk(pubkey: Buffer): SpendableScript;
/**
 * Return scripts for 2-of-3 multisig output
 * @param pubkeys - the key triple for multisig
 * @param scriptType
 * @returns {{redeemScript, witnessScript, scriptPubKey}}
 */
export declare function createOutputScript2of3(pubkeys: Buffer[], scriptType: ScriptType2Of3): SpendableScript;
//# sourceMappingURL=outputScripts.d.ts.map