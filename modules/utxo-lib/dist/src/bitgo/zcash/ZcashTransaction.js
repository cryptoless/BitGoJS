"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZcashTransaction = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const types = require("bitcoinjs-lib/src/types");
const bufferutils_1 = require("bitcoinjs-lib/src/bufferutils");
const blake2b = require('@bitgo/blake2b');
const varuint = require('varuint-bitcoin');
const typeforce = require('typeforce');
const networks = require("../../networks");
const UtxoTransaction_1 = require("../UtxoTransaction");
const ZERO = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
const VALUE_INT64_ZERO = Buffer.from('0000000000000000', 'hex');
/**
 * Blake2b hashing algorithm for Zcash
 * @param buffer
 * @param personalization
 * @returns 256-bit BLAKE2b hash
 */
function getBlake2bHash(buffer, personalization) {
    const out = Buffer.allocUnsafe(32);
    return blake2b(out.length, null, null, Buffer.from(personalization)).update(buffer).digest(out);
}
class ZcashTransaction extends UtxoTransaction_1.UtxoTransaction {
    constructor(network, tx) {
        super(network, tx);
        this.network = network;
        // 1 if the transaction is post overwinter upgrade, 0 otherwise
        this.overwintered = 0;
        // 0x03C48270 (63210096) for overwinter and 0x892F2085 (2301567109) for sapling
        this.versionGroupId = 0;
        // Block height after which this transactions will expire, or 0 to disable expiry
        this.expiryHeight = 0;
        if (tx) {
            this.overwintered = tx.overwintered;
            this.versionGroupId = tx.versionGroupId;
            this.expiryHeight = tx.expiryHeight;
        }
        // Must be updated along with version
        this.consensusBranchId = networks.zcash.consensusBranchId[this.version];
    }
    static fromBuffer(buffer, __noStrict, network) {
        /* istanbul ignore next */
        if (!network) {
            throw new Error(`must provide network`);
        }
        const bufferReader = new bufferutils_1.BufferReader(buffer);
        const tx = new ZcashTransaction(network);
        tx.version = bufferReader.readInt32();
        // Split the header into fOverwintered and nVersion
        tx.overwintered = tx.version >>> 31; // Must be 1 for version 3 and up
        tx.version = tx.version & 0x07fffffff; // 3 for overwinter
        if (tx.overwintered && !networks.zcash.consensusBranchId.hasOwnProperty(tx.version)) {
            throw new Error('Unsupported Zcash transaction');
        }
        tx.consensusBranchId = networks.zcash.consensusBranchId[tx.version];
        if (tx.isOverwinterCompatible()) {
            tx.versionGroupId = bufferReader.readUInt32();
        }
        const vinLen = bufferReader.readVarInt();
        for (let i = 0; i < vinLen; ++i) {
            tx.ins.push({
                hash: bufferReader.readSlice(32),
                index: bufferReader.readUInt32(),
                script: bufferReader.readVarSlice(),
                sequence: bufferReader.readUInt32(),
                witness: [],
            });
        }
        const voutLen = bufferReader.readVarInt();
        for (let i = 0; i < voutLen; ++i) {
            tx.outs.push({
                value: bufferReader.readUInt64(),
                script: bufferReader.readVarSlice(),
            });
        }
        tx.locktime = bufferReader.readUInt32();
        if (tx.isOverwinterCompatible()) {
            tx.expiryHeight = bufferReader.readUInt32();
        }
        if (tx.isSaplingCompatible()) {
            const valueBalance = bufferReader.readSlice(8);
            if (!valueBalance.equals(VALUE_INT64_ZERO)) {
                /* istanbul ignore next */
                throw new Error(`unsupported valueBalance`);
            }
            const nShieldedSpend = bufferReader.readVarInt();
            if (nShieldedSpend !== 0) {
                /* istanbul ignore next */
                throw new Error(`shielded spend not supported`);
            }
            const nShieldedOutput = bufferReader.readVarInt();
            if (nShieldedOutput !== 0) {
                /* istanbul ignore next */
                throw new Error(`shielded output not supported`);
            }
        }
        if (tx.supportsJoinSplits()) {
            const joinSplitsLen = bufferReader.readVarInt();
            if (joinSplitsLen !== 0) {
                /* istanbul ignore next */
                throw new Error(`joinSplits not supported`);
            }
        }
        if (__noStrict)
            return tx;
        if (bufferReader.offset !== buffer.length)
            throw new Error('Transaction has unexpected data');
        return tx;
    }
    byteLength() {
        let byteLength = super.byteLength();
        if (this.isOverwinterCompatible()) {
            byteLength += 4; // nVersionGroupId
        }
        if (this.isOverwinterCompatible()) {
            byteLength += 4; // nExpiryHeight
        }
        if (this.isSaplingCompatible()) {
            byteLength += 8; // valueBalance
            byteLength += varuint.encodingLength(0); // inputs
            byteLength += varuint.encodingLength(0); // outputs
        }
        if (this.supportsJoinSplits()) {
            byteLength += varuint.encodingLength(0); // joinsplits
        }
        return byteLength;
    }
    isSaplingCompatible() {
        return !!this.overwintered && this.version >= ZcashTransaction.VERSION_SAPLING;
    }
    isOverwinterCompatible() {
        return !!this.overwintered && this.version >= ZcashTransaction.VERSION_OVERWINTER;
    }
    supportsJoinSplits() {
        return !!this.overwintered && this.version >= ZcashTransaction.VERSION_JOINSPLITS_SUPPORT;
    }
    /**
     * Build a hash for all or none of the transaction inputs depending on the hashtype
     * @param hashType
     * @returns Buffer - BLAKE2b hash or 256-bit zero if doesn't apply
     */
    getPrevoutHash(hashType) {
        if (!(hashType & bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY)) {
            const bufferWriter = new bufferutils_1.BufferWriter(Buffer.allocUnsafe(36 * this.ins.length));
            this.ins.forEach(function (txIn) {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            return getBlake2bHash(bufferWriter.buffer, 'ZcashPrevoutHash');
        }
        return ZERO;
    }
    /**
     * Build a hash for all or none of the transactions inputs sequence numbers depending on the hashtype
     * @param hashType
     * @returns Buffer BLAKE2b hash or 256-bit zero if doesn't apply
     */
    getSequenceHash(hashType) {
        if (!(hashType & bitcoinjs_lib_1.Transaction.SIGHASH_ANYONECANPAY) &&
            (hashType & 0x1f) !== bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== bitcoinjs_lib_1.Transaction.SIGHASH_NONE) {
            const bufferWriter = new bufferutils_1.BufferWriter(Buffer.allocUnsafe(4 * this.ins.length));
            this.ins.forEach(function (txIn) {
                bufferWriter.writeUInt32(txIn.sequence);
            });
            return getBlake2bHash(bufferWriter.buffer, 'ZcashSequencHash');
        }
        return ZERO;
    }
    /**
     * Build a hash for one, all or none of the transaction outputs depending on the hashtype
     * @param hashType
     * @param inIndex
     * @returns Buffer BLAKE2b hash or 256-bit zero if doesn't apply
     */
    getOutputsHash(hashType, inIndex) {
        if ((hashType & 0x1f) !== bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE && (hashType & 0x1f) !== bitcoinjs_lib_1.Transaction.SIGHASH_NONE) {
            // Find out the size of the outputs and write them
            const txOutsSize = this.outs.reduce(function (sum, output) {
                return sum + 8 + UtxoTransaction_1.varSliceSize(output.script);
            }, 0);
            const bufferWriter = new bufferutils_1.BufferWriter(Buffer.allocUnsafe(txOutsSize));
            this.outs.forEach(function (out) {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            return getBlake2bHash(bufferWriter.buffer, 'ZcashOutputsHash');
        }
        else if ((hashType & 0x1f) === bitcoinjs_lib_1.Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
            // Write only the output specified in inIndex
            const output = this.outs[inIndex];
            const bufferWriter = new bufferutils_1.BufferWriter(Buffer.allocUnsafe(8 + UtxoTransaction_1.varSliceSize(output.script)));
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            return getBlake2bHash(bufferWriter.buffer, 'ZcashOutputsHash');
        }
        return ZERO;
    }
    /**
     * Hash transaction for signing a transparent transaction in Zcash. Protected transactions are not supported.
     * @param inIndex
     * @param prevOutScript
     * @param value
     * @param hashType
     * @returns Buffer BLAKE2b hash
     */
    hashForSignatureByNetwork(inIndex, prevOutScript, value, hashType) {
        typeforce(types.tuple(types.UInt32, types.Buffer, types.Number), arguments);
        /* istanbul ignore next */
        if (inIndex >= this.ins.length) {
            throw new Error('Input index is out of range');
        }
        /* istanbul ignore next */
        if (!this.isOverwinterCompatible()) {
            throw new Error(`unsupported version ${this.version}`);
        }
        const hashPrevouts = this.getPrevoutHash(hashType);
        const hashSequence = this.getSequenceHash(hashType);
        const hashOutputs = this.getOutputsHash(hashType, inIndex);
        const hashJoinSplits = ZERO;
        const hashShieldedSpends = ZERO;
        const hashShieldedOutputs = ZERO;
        let baseBufferSize = 0;
        baseBufferSize += 4 * 5; // header, nVersionGroupId, lock_time, nExpiryHeight, hashType
        baseBufferSize += 32 * 4; // 256 hashes: hashPrevouts, hashSequence, hashOutputs, hashJoinSplits
        baseBufferSize += 4 * 2; // input.index, input.sequence
        baseBufferSize += 8; // value
        baseBufferSize += 32; // input.hash
        baseBufferSize += UtxoTransaction_1.varSliceSize(prevOutScript); // prevOutScript
        if (this.isSaplingCompatible()) {
            baseBufferSize += 32 * 2; // hashShieldedSpends and hashShieldedOutputs
            baseBufferSize += 8; // valueBalance
        }
        const mask = this.overwintered ? 1 : 0;
        const header = this.version | (mask << 31);
        const bufferWriter = new bufferutils_1.BufferWriter(Buffer.alloc(baseBufferSize));
        bufferWriter.writeInt32(header);
        bufferWriter.writeUInt32(this.versionGroupId);
        bufferWriter.writeSlice(hashPrevouts);
        bufferWriter.writeSlice(hashSequence);
        bufferWriter.writeSlice(hashOutputs);
        bufferWriter.writeSlice(hashJoinSplits);
        if (this.isSaplingCompatible()) {
            bufferWriter.writeSlice(hashShieldedSpends);
            bufferWriter.writeSlice(hashShieldedOutputs);
        }
        bufferWriter.writeUInt32(this.locktime);
        bufferWriter.writeUInt32(this.expiryHeight);
        if (this.isSaplingCompatible()) {
            bufferWriter.writeSlice(VALUE_INT64_ZERO);
        }
        bufferWriter.writeInt32(hashType);
        // The input being signed (replacing the scriptSig with scriptCode + amount)
        // The prevout may already be contained in hashPrevout, and the nSequence
        // may already be contained in hashSequence.
        const input = this.ins[inIndex];
        bufferWriter.writeSlice(input.hash);
        bufferWriter.writeUInt32(input.index);
        bufferWriter.writeVarSlice(prevOutScript);
        bufferWriter.writeUInt64(value);
        bufferWriter.writeUInt32(input.sequence);
        const personalization = Buffer.alloc(16);
        const prefix = 'ZcashSigHash';
        personalization.write(prefix);
        personalization.writeUInt32LE(this.consensusBranchId, prefix.length);
        return getBlake2bHash(bufferWriter.buffer, personalization);
    }
    toBuffer(buffer, initialOffset = 0) {
        if (!buffer)
            buffer = Buffer.allocUnsafe(this.byteLength());
        const bufferWriter = new bufferutils_1.BufferWriter(buffer, initialOffset);
        if (this.isOverwinterCompatible()) {
            const mask = this.overwintered ? 1 : 0;
            bufferWriter.writeInt32(this.version | (mask << 31)); // Set overwinter bit
            bufferWriter.writeUInt32(this.versionGroupId);
        }
        else {
            bufferWriter.writeInt32(this.version);
        }
        bufferWriter.writeVarInt(this.ins.length);
        this.ins.forEach(function (txIn) {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
            bufferWriter.writeVarSlice(txIn.script);
            bufferWriter.writeUInt32(txIn.sequence);
        });
        bufferWriter.writeVarInt(this.outs.length);
        this.outs.forEach(function (txOut) {
            if (txOut.valueBuffer) {
                bufferWriter.writeSlice(txOut.valueBuffer);
            }
            else {
                bufferWriter.writeUInt64(txOut.value);
            }
            bufferWriter.writeVarSlice(txOut.script);
        });
        bufferWriter.writeUInt32(this.locktime);
        if (this.isOverwinterCompatible()) {
            bufferWriter.writeUInt32(this.expiryHeight);
        }
        if (this.isSaplingCompatible()) {
            bufferWriter.writeSlice(VALUE_INT64_ZERO);
            bufferWriter.writeVarInt(0); // vShieldedSpendLength
            bufferWriter.writeVarInt(0); // vShieldedOutputLength
        }
        if (this.supportsJoinSplits()) {
            bufferWriter.writeVarInt(0); // joinsSplits length
        }
        if (initialOffset !== undefined) {
            return buffer.slice(initialOffset, bufferWriter.offset);
        }
        return buffer;
    }
    getHash(forWitness) {
        if (forWitness) {
            throw new Error(`invalid argument`);
        }
        return bitcoinjs_lib_1.crypto.hash256(this.toBuffer());
    }
    clone() {
        return new ZcashTransaction(this.network, this);
    }
}
exports.ZcashTransaction = ZcashTransaction;
ZcashTransaction.VERSION_JOINSPLITS_SUPPORT = 2;
ZcashTransaction.VERSION_OVERWINTER = 3;
ZcashTransaction.VERSION_SAPLING = 4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmNhc2hUcmFuc2FjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iaXRnby96Y2FzaC9aY2FzaFRyYW5zYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUFvRDtBQUNwRCxpREFBaUQ7QUFDakQsK0RBQTJFO0FBRTNFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUV2QywyQ0FBMkM7QUFDM0Msd0RBQW1FO0FBR25FLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFcEcsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRWhFOzs7OztHQUtHO0FBQ0gsU0FBUyxjQUFjLENBQUMsTUFBYyxFQUFFLGVBQWdDO0lBQ3RFLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xHLENBQUM7QUFFRCxNQUFhLGdCQUFpQixTQUFRLGlDQUFlO0lBYW5ELFlBQW1CLE9BQXFCLEVBQUUsRUFBcUI7UUFDN0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQURGLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFSeEMsK0RBQStEO1FBQy9ELGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLCtFQUErRTtRQUMvRSxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUNuQixpRkFBaUY7UUFDakYsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFNZixJQUFJLEVBQUUsRUFBRTtZQUNOLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3JDO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFjLEVBQUUsVUFBbUIsRUFBRSxPQUFzQjtRQUMzRSwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksMEJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxNQUFNLEVBQUUsR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRXRDLG1EQUFtRDtRQUNuRCxFQUFFLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUMsaUNBQWlDO1FBQ3RFLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxtQkFBbUI7UUFDMUQsSUFBSSxFQUFFLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25GLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUNsRDtRQUNELEVBQUUsQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwRSxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQy9DO1FBRUQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDL0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRTtnQkFDaEMsTUFBTSxFQUFFLFlBQVksQ0FBQyxZQUFZLEVBQUU7Z0JBQ25DLFFBQVEsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFO2dCQUNuQyxPQUFPLEVBQUUsRUFBRTthQUNaLENBQUMsQ0FBQztTQUNKO1FBRUQsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDaEMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxZQUFZLENBQUMsWUFBWSxFQUFFO2FBQ3BDLENBQUMsQ0FBQztTQUNKO1FBRUQsRUFBRSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEMsSUFBSSxFQUFFLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtZQUMvQixFQUFFLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUM3QztRQUVELElBQUksRUFBRSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7WUFDNUIsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMxQywwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQzthQUM3QztZQUVELE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqRCxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xELElBQUksZUFBZSxLQUFLLENBQUMsRUFBRTtnQkFDekIsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7YUFDbEQ7U0FDRjtRQUVELElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDM0IsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2hELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtnQkFDdkIsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7YUFDN0M7U0FDRjtRQUVELElBQUksVUFBVTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBQzFCLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUU5RixPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFRCxVQUFVO1FBQ1IsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BDLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUU7WUFDakMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtTQUNwQztRQUNELElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUU7WUFDakMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtTQUNsQztRQUNELElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7WUFDOUIsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWU7WUFDaEMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ2xELFVBQVUsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtTQUNwRDtRQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDN0IsVUFBVSxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhO1NBQ3ZEO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsZUFBZSxDQUFDO0lBQ2pGLENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDO0lBQ3BGLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDO0lBQzVGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLFFBQWdCO1FBQzdCLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRywyQkFBVyxDQUFDLG9CQUFvQixDQUFDLEVBQUU7WUFDbEQsTUFBTSxZQUFZLEdBQUcsSUFBSSwwQkFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUVoRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBQzdCLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUNoRTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsUUFBZ0I7UUFDOUIsSUFDRSxDQUFDLENBQUMsUUFBUSxHQUFHLDJCQUFXLENBQUMsb0JBQW9CLENBQUM7WUFDOUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssMkJBQVcsQ0FBQyxjQUFjO1lBQ2hELENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLDJCQUFXLENBQUMsWUFBWSxFQUM5QztZQUNBLE1BQU0sWUFBWSxHQUFHLElBQUksMEJBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFL0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJO2dCQUM3QixZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUNoRTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsY0FBYyxDQUFDLFFBQWdCLEVBQUUsT0FBZTtRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLDJCQUFXLENBQUMsY0FBYyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLDJCQUFXLENBQUMsWUFBWSxFQUFFO1lBQ3RHLGtEQUFrRDtZQUNsRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxNQUFNO2dCQUN2RCxPQUFPLEdBQUcsR0FBRyxDQUFDLEdBQUcsOEJBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRU4sTUFBTSxZQUFZLEdBQUcsSUFBSSwwQkFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7Z0JBQzdCLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztTQUNoRTthQUFNLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssMkJBQVcsQ0FBQyxjQUFjLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pGLDZDQUE2QztZQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLE1BQU0sWUFBWSxHQUFHLElBQUksMEJBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyw4QkFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUMsT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILHlCQUF5QixDQUFDLE9BQWUsRUFBRSxhQUFxQixFQUFFLEtBQWEsRUFBRSxRQUFnQjtRQUMvRixTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTVFLDBCQUEwQjtRQUMxQixJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDaEQ7UUFFRCwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3hEO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUNoQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUVqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDdkIsY0FBYyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyw4REFBOEQ7UUFDdkYsY0FBYyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxzRUFBc0U7UUFDaEcsY0FBYyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyw4QkFBOEI7UUFDdkQsY0FBYyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVE7UUFDN0IsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFDbkMsY0FBYyxJQUFJLDhCQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7UUFDL0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtZQUM5QixjQUFjLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLDZDQUE2QztZQUN2RSxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZTtTQUNyQztRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFFM0MsTUFBTSxZQUFZLEdBQUcsSUFBSSwwQkFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNwRSxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlDLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxZQUFZLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDeEMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtZQUM5QixZQUFZLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDNUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtZQUM5QixZQUFZLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDM0M7UUFDRCxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWxDLDRFQUE0RTtRQUM1RSx5RUFBeUU7UUFDekUsNENBQTRDO1FBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQyxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDO1FBQzlCLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXJFLE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELFFBQVEsQ0FBQyxNQUFlLEVBQUUsYUFBYSxHQUFHLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU07WUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUU1RCxNQUFNLFlBQVksR0FBRyxJQUFJLDBCQUFZLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRTdELElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUU7WUFDakMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUI7WUFDM0UsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDL0M7YUFBTTtZQUNMLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSTtZQUM3QixZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUs7WUFDL0IsSUFBSyxLQUFhLENBQUMsV0FBVyxFQUFFO2dCQUM5QixZQUFZLENBQUMsVUFBVSxDQUFFLEtBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNyRDtpQkFBTTtnQkFDTCxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2QztZQUVELFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFeEMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtZQUNqQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM3QztRQUVELElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7WUFDOUIsWUFBWSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUI7WUFDcEQsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtTQUN0RDtRQUVELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDN0IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtTQUNuRDtRQUVELElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtZQUMvQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6RDtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsVUFBb0I7UUFDMUIsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPLHNCQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQzs7QUFwV0gsNENBcVdDO0FBcFdRLDJDQUEwQixHQUFHLENBQUMsQ0FBQztBQUMvQixtQ0FBa0IsR0FBRyxDQUFDLENBQUM7QUFDdkIsZ0NBQWUsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUcmFuc2FjdGlvbiwgY3J5cHRvIH0gZnJvbSAnYml0Y29pbmpzLWxpYic7XG5pbXBvcnQgKiBhcyB0eXBlcyBmcm9tICdiaXRjb2luanMtbGliL3NyYy90eXBlcyc7XG5pbXBvcnQgeyBCdWZmZXJSZWFkZXIsIEJ1ZmZlcldyaXRlciB9IGZyb20gJ2JpdGNvaW5qcy1saWIvc3JjL2J1ZmZlcnV0aWxzJztcblxuY29uc3QgYmxha2UyYiA9IHJlcXVpcmUoJ0BiaXRnby9ibGFrZTJiJyk7XG5jb25zdCB2YXJ1aW50ID0gcmVxdWlyZSgndmFydWludC1iaXRjb2luJyk7XG5jb25zdCB0eXBlZm9yY2UgPSByZXF1aXJlKCd0eXBlZm9yY2UnKTtcblxuaW1wb3J0ICogYXMgbmV0d29ya3MgZnJvbSAnLi4vLi4vbmV0d29ya3MnO1xuaW1wb3J0IHsgVXR4b1RyYW5zYWN0aW9uLCB2YXJTbGljZVNpemUgfSBmcm9tICcuLi9VdHhvVHJhbnNhY3Rpb24nO1xuaW1wb3J0IHsgWmNhc2hOZXR3b3JrIH0gZnJvbSAnLi4vLi4vbmV0d29ya1R5cGVzJztcblxuY29uc3QgWkVSTyA9IEJ1ZmZlci5mcm9tKCcwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJywgJ2hleCcpO1xuXG5jb25zdCBWQUxVRV9JTlQ2NF9aRVJPID0gQnVmZmVyLmZyb20oJzAwMDAwMDAwMDAwMDAwMDAnLCAnaGV4Jyk7XG5cbi8qKlxuICogQmxha2UyYiBoYXNoaW5nIGFsZ29yaXRobSBmb3IgWmNhc2hcbiAqIEBwYXJhbSBidWZmZXJcbiAqIEBwYXJhbSBwZXJzb25hbGl6YXRpb25cbiAqIEByZXR1cm5zIDI1Ni1iaXQgQkxBS0UyYiBoYXNoXG4gKi9cbmZ1bmN0aW9uIGdldEJsYWtlMmJIYXNoKGJ1ZmZlcjogQnVmZmVyLCBwZXJzb25hbGl6YXRpb246IHN0cmluZyB8IEJ1ZmZlcikge1xuICBjb25zdCBvdXQgPSBCdWZmZXIuYWxsb2NVbnNhZmUoMzIpO1xuICByZXR1cm4gYmxha2UyYihvdXQubGVuZ3RoLCBudWxsLCBudWxsLCBCdWZmZXIuZnJvbShwZXJzb25hbGl6YXRpb24pKS51cGRhdGUoYnVmZmVyKS5kaWdlc3Qob3V0KTtcbn1cblxuZXhwb3J0IGNsYXNzIFpjYXNoVHJhbnNhY3Rpb24gZXh0ZW5kcyBVdHhvVHJhbnNhY3Rpb24ge1xuICBzdGF0aWMgVkVSU0lPTl9KT0lOU1BMSVRTX1NVUFBPUlQgPSAyO1xuICBzdGF0aWMgVkVSU0lPTl9PVkVSV0lOVEVSID0gMztcbiAgc3RhdGljIFZFUlNJT05fU0FQTElORyA9IDQ7XG5cbiAgLy8gMSBpZiB0aGUgdHJhbnNhY3Rpb24gaXMgcG9zdCBvdmVyd2ludGVyIHVwZ3JhZGUsIDAgb3RoZXJ3aXNlXG4gIG92ZXJ3aW50ZXJlZCA9IDA7XG4gIC8vIDB4MDNDNDgyNzAgKDYzMjEwMDk2KSBmb3Igb3ZlcndpbnRlciBhbmQgMHg4OTJGMjA4NSAoMjMwMTU2NzEwOSkgZm9yIHNhcGxpbmdcbiAgdmVyc2lvbkdyb3VwSWQgPSAwO1xuICAvLyBCbG9jayBoZWlnaHQgYWZ0ZXIgd2hpY2ggdGhpcyB0cmFuc2FjdGlvbnMgd2lsbCBleHBpcmUsIG9yIDAgdG8gZGlzYWJsZSBleHBpcnlcbiAgZXhwaXJ5SGVpZ2h0ID0gMDtcbiAgY29uc2Vuc3VzQnJhbmNoSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmV0d29yazogWmNhc2hOZXR3b3JrLCB0eD86IFpjYXNoVHJhbnNhY3Rpb24pIHtcbiAgICBzdXBlcihuZXR3b3JrLCB0eCk7XG5cbiAgICBpZiAodHgpIHtcbiAgICAgIHRoaXMub3ZlcndpbnRlcmVkID0gdHgub3ZlcndpbnRlcmVkO1xuICAgICAgdGhpcy52ZXJzaW9uR3JvdXBJZCA9IHR4LnZlcnNpb25Hcm91cElkO1xuICAgICAgdGhpcy5leHBpcnlIZWlnaHQgPSB0eC5leHBpcnlIZWlnaHQ7XG4gICAgfVxuXG4gICAgLy8gTXVzdCBiZSB1cGRhdGVkIGFsb25nIHdpdGggdmVyc2lvblxuICAgIHRoaXMuY29uc2Vuc3VzQnJhbmNoSWQgPSBuZXR3b3Jrcy56Y2FzaC5jb25zZW5zdXNCcmFuY2hJZFt0aGlzLnZlcnNpb25dO1xuICB9XG5cbiAgc3RhdGljIGZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIF9fbm9TdHJpY3Q6IGJvb2xlYW4sIG5ldHdvcms/OiBaY2FzaE5ldHdvcmspOiBaY2FzaFRyYW5zYWN0aW9uIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICghbmV0d29yaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtdXN0IHByb3ZpZGUgbmV0d29ya2ApO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlclJlYWRlciA9IG5ldyBCdWZmZXJSZWFkZXIoYnVmZmVyKTtcbiAgICBjb25zdCB0eCA9IG5ldyBaY2FzaFRyYW5zYWN0aW9uKG5ldHdvcmspO1xuICAgIHR4LnZlcnNpb24gPSBidWZmZXJSZWFkZXIucmVhZEludDMyKCk7XG5cbiAgICAvLyBTcGxpdCB0aGUgaGVhZGVyIGludG8gZk92ZXJ3aW50ZXJlZCBhbmQgblZlcnNpb25cbiAgICB0eC5vdmVyd2ludGVyZWQgPSB0eC52ZXJzaW9uID4+PiAzMTsgLy8gTXVzdCBiZSAxIGZvciB2ZXJzaW9uIDMgYW5kIHVwXG4gICAgdHgudmVyc2lvbiA9IHR4LnZlcnNpb24gJiAweDA3ZmZmZmZmZjsgLy8gMyBmb3Igb3ZlcndpbnRlclxuICAgIGlmICh0eC5vdmVyd2ludGVyZWQgJiYgIW5ldHdvcmtzLnpjYXNoLmNvbnNlbnN1c0JyYW5jaElkLmhhc093blByb3BlcnR5KHR4LnZlcnNpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIFpjYXNoIHRyYW5zYWN0aW9uJyk7XG4gICAgfVxuICAgIHR4LmNvbnNlbnN1c0JyYW5jaElkID0gbmV0d29ya3MuemNhc2guY29uc2Vuc3VzQnJhbmNoSWRbdHgudmVyc2lvbl07XG5cbiAgICBpZiAodHguaXNPdmVyd2ludGVyQ29tcGF0aWJsZSgpKSB7XG4gICAgICB0eC52ZXJzaW9uR3JvdXBJZCA9IGJ1ZmZlclJlYWRlci5yZWFkVUludDMyKCk7XG4gICAgfVxuXG4gICAgY29uc3QgdmluTGVuID0gYnVmZmVyUmVhZGVyLnJlYWRWYXJJbnQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpbkxlbjsgKytpKSB7XG4gICAgICB0eC5pbnMucHVzaCh7XG4gICAgICAgIGhhc2g6IGJ1ZmZlclJlYWRlci5yZWFkU2xpY2UoMzIpLFxuICAgICAgICBpbmRleDogYnVmZmVyUmVhZGVyLnJlYWRVSW50MzIoKSxcbiAgICAgICAgc2NyaXB0OiBidWZmZXJSZWFkZXIucmVhZFZhclNsaWNlKCksXG4gICAgICAgIHNlcXVlbmNlOiBidWZmZXJSZWFkZXIucmVhZFVJbnQzMigpLFxuICAgICAgICB3aXRuZXNzOiBbXSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHZvdXRMZW4gPSBidWZmZXJSZWFkZXIucmVhZFZhckludCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdm91dExlbjsgKytpKSB7XG4gICAgICB0eC5vdXRzLnB1c2goe1xuICAgICAgICB2YWx1ZTogYnVmZmVyUmVhZGVyLnJlYWRVSW50NjQoKSxcbiAgICAgICAgc2NyaXB0OiBidWZmZXJSZWFkZXIucmVhZFZhclNsaWNlKCksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0eC5sb2NrdGltZSA9IGJ1ZmZlclJlYWRlci5yZWFkVUludDMyKCk7XG5cbiAgICBpZiAodHguaXNPdmVyd2ludGVyQ29tcGF0aWJsZSgpKSB7XG4gICAgICB0eC5leHBpcnlIZWlnaHQgPSBidWZmZXJSZWFkZXIucmVhZFVJbnQzMigpO1xuICAgIH1cblxuICAgIGlmICh0eC5pc1NhcGxpbmdDb21wYXRpYmxlKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlQmFsYW5jZSA9IGJ1ZmZlclJlYWRlci5yZWFkU2xpY2UoOCk7XG4gICAgICBpZiAoIXZhbHVlQmFsYW5jZS5lcXVhbHMoVkFMVUVfSU5UNjRfWkVSTykpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCB2YWx1ZUJhbGFuY2VgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgblNoaWVsZGVkU3BlbmQgPSBidWZmZXJSZWFkZXIucmVhZFZhckludCgpO1xuICAgICAgaWYgKG5TaGllbGRlZFNwZW5kICE9PSAwKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgc2hpZWxkZWQgc3BlbmQgbm90IHN1cHBvcnRlZGApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuU2hpZWxkZWRPdXRwdXQgPSBidWZmZXJSZWFkZXIucmVhZFZhckludCgpO1xuICAgICAgaWYgKG5TaGllbGRlZE91dHB1dCAhPT0gMCkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHNoaWVsZGVkIG91dHB1dCBub3Qgc3VwcG9ydGVkYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR4LnN1cHBvcnRzSm9pblNwbGl0cygpKSB7XG4gICAgICBjb25zdCBqb2luU3BsaXRzTGVuID0gYnVmZmVyUmVhZGVyLnJlYWRWYXJJbnQoKTtcbiAgICAgIGlmIChqb2luU3BsaXRzTGVuICE9PSAwKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgam9pblNwbGl0cyBub3Qgc3VwcG9ydGVkYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9fbm9TdHJpY3QpIHJldHVybiB0eDtcbiAgICBpZiAoYnVmZmVyUmVhZGVyLm9mZnNldCAhPT0gYnVmZmVyLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdUcmFuc2FjdGlvbiBoYXMgdW5leHBlY3RlZCBkYXRhJyk7XG5cbiAgICByZXR1cm4gdHg7XG4gIH1cblxuICBieXRlTGVuZ3RoKCk6IG51bWJlciB7XG4gICAgbGV0IGJ5dGVMZW5ndGggPSBzdXBlci5ieXRlTGVuZ3RoKCk7XG4gICAgaWYgKHRoaXMuaXNPdmVyd2ludGVyQ29tcGF0aWJsZSgpKSB7XG4gICAgICBieXRlTGVuZ3RoICs9IDQ7IC8vIG5WZXJzaW9uR3JvdXBJZFxuICAgIH1cbiAgICBpZiAodGhpcy5pc092ZXJ3aW50ZXJDb21wYXRpYmxlKCkpIHtcbiAgICAgIGJ5dGVMZW5ndGggKz0gNDsgLy8gbkV4cGlyeUhlaWdodFxuICAgIH1cbiAgICBpZiAodGhpcy5pc1NhcGxpbmdDb21wYXRpYmxlKCkpIHtcbiAgICAgIGJ5dGVMZW5ndGggKz0gODsgLy8gdmFsdWVCYWxhbmNlXG4gICAgICBieXRlTGVuZ3RoICs9IHZhcnVpbnQuZW5jb2RpbmdMZW5ndGgoMCk7IC8vIGlucHV0c1xuICAgICAgYnl0ZUxlbmd0aCArPSB2YXJ1aW50LmVuY29kaW5nTGVuZ3RoKDApOyAvLyBvdXRwdXRzXG4gICAgfVxuICAgIGlmICh0aGlzLnN1cHBvcnRzSm9pblNwbGl0cygpKSB7XG4gICAgICBieXRlTGVuZ3RoICs9IHZhcnVpbnQuZW5jb2RpbmdMZW5ndGgoMCk7IC8vIGpvaW5zcGxpdHNcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVMZW5ndGg7XG4gIH1cblxuICBpc1NhcGxpbmdDb21wYXRpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMub3ZlcndpbnRlcmVkICYmIHRoaXMudmVyc2lvbiA+PSBaY2FzaFRyYW5zYWN0aW9uLlZFUlNJT05fU0FQTElORztcbiAgfVxuXG4gIGlzT3ZlcndpbnRlckNvbXBhdGlibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5vdmVyd2ludGVyZWQgJiYgdGhpcy52ZXJzaW9uID49IFpjYXNoVHJhbnNhY3Rpb24uVkVSU0lPTl9PVkVSV0lOVEVSO1xuICB9XG5cbiAgc3VwcG9ydHNKb2luU3BsaXRzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMub3ZlcndpbnRlcmVkICYmIHRoaXMudmVyc2lvbiA+PSBaY2FzaFRyYW5zYWN0aW9uLlZFUlNJT05fSk9JTlNQTElUU19TVVBQT1JUO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGEgaGFzaCBmb3IgYWxsIG9yIG5vbmUgb2YgdGhlIHRyYW5zYWN0aW9uIGlucHV0cyBkZXBlbmRpbmcgb24gdGhlIGhhc2h0eXBlXG4gICAqIEBwYXJhbSBoYXNoVHlwZVxuICAgKiBAcmV0dXJucyBCdWZmZXIgLSBCTEFLRTJiIGhhc2ggb3IgMjU2LWJpdCB6ZXJvIGlmIGRvZXNuJ3QgYXBwbHlcbiAgICovXG4gIGdldFByZXZvdXRIYXNoKGhhc2hUeXBlOiBudW1iZXIpOiBCdWZmZXIge1xuICAgIGlmICghKGhhc2hUeXBlICYgVHJhbnNhY3Rpb24uU0lHSEFTSF9BTllPTkVDQU5QQVkpKSB7XG4gICAgICBjb25zdCBidWZmZXJXcml0ZXIgPSBuZXcgQnVmZmVyV3JpdGVyKEJ1ZmZlci5hbGxvY1Vuc2FmZSgzNiAqIHRoaXMuaW5zLmxlbmd0aCkpO1xuXG4gICAgICB0aGlzLmlucy5mb3JFYWNoKGZ1bmN0aW9uICh0eEluKSB7XG4gICAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVNsaWNlKHR4SW4uaGFzaCk7XG4gICAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVVJbnQzMih0eEluLmluZGV4KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZ2V0Qmxha2UyYkhhc2goYnVmZmVyV3JpdGVyLmJ1ZmZlciwgJ1pjYXNoUHJldm91dEhhc2gnKTtcbiAgICB9XG4gICAgcmV0dXJuIFpFUk87XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYSBoYXNoIGZvciBhbGwgb3Igbm9uZSBvZiB0aGUgdHJhbnNhY3Rpb25zIGlucHV0cyBzZXF1ZW5jZSBudW1iZXJzIGRlcGVuZGluZyBvbiB0aGUgaGFzaHR5cGVcbiAgICogQHBhcmFtIGhhc2hUeXBlXG4gICAqIEByZXR1cm5zIEJ1ZmZlciBCTEFLRTJiIGhhc2ggb3IgMjU2LWJpdCB6ZXJvIGlmIGRvZXNuJ3QgYXBwbHlcbiAgICovXG4gIGdldFNlcXVlbmNlSGFzaChoYXNoVHlwZTogbnVtYmVyKTogQnVmZmVyIHtcbiAgICBpZiAoXG4gICAgICAhKGhhc2hUeXBlICYgVHJhbnNhY3Rpb24uU0lHSEFTSF9BTllPTkVDQU5QQVkpICYmXG4gICAgICAoaGFzaFR5cGUgJiAweDFmKSAhPT0gVHJhbnNhY3Rpb24uU0lHSEFTSF9TSU5HTEUgJiZcbiAgICAgIChoYXNoVHlwZSAmIDB4MWYpICE9PSBUcmFuc2FjdGlvbi5TSUdIQVNIX05PTkVcbiAgICApIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcldyaXRlciA9IG5ldyBCdWZmZXJXcml0ZXIoQnVmZmVyLmFsbG9jVW5zYWZlKDQgKiB0aGlzLmlucy5sZW5ndGgpKTtcblxuICAgICAgdGhpcy5pbnMuZm9yRWFjaChmdW5jdGlvbiAodHhJbikge1xuICAgICAgICBidWZmZXJXcml0ZXIud3JpdGVVSW50MzIodHhJbi5zZXF1ZW5jZSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGdldEJsYWtlMmJIYXNoKGJ1ZmZlcldyaXRlci5idWZmZXIsICdaY2FzaFNlcXVlbmNIYXNoJyk7XG4gICAgfVxuICAgIHJldHVybiBaRVJPO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGEgaGFzaCBmb3Igb25lLCBhbGwgb3Igbm9uZSBvZiB0aGUgdHJhbnNhY3Rpb24gb3V0cHV0cyBkZXBlbmRpbmcgb24gdGhlIGhhc2h0eXBlXG4gICAqIEBwYXJhbSBoYXNoVHlwZVxuICAgKiBAcGFyYW0gaW5JbmRleFxuICAgKiBAcmV0dXJucyBCdWZmZXIgQkxBS0UyYiBoYXNoIG9yIDI1Ni1iaXQgemVybyBpZiBkb2Vzbid0IGFwcGx5XG4gICAqL1xuICBnZXRPdXRwdXRzSGFzaChoYXNoVHlwZTogbnVtYmVyLCBpbkluZGV4OiBudW1iZXIpOiBCdWZmZXIge1xuICAgIGlmICgoaGFzaFR5cGUgJiAweDFmKSAhPT0gVHJhbnNhY3Rpb24uU0lHSEFTSF9TSU5HTEUgJiYgKGhhc2hUeXBlICYgMHgxZikgIT09IFRyYW5zYWN0aW9uLlNJR0hBU0hfTk9ORSkge1xuICAgICAgLy8gRmluZCBvdXQgdGhlIHNpemUgb2YgdGhlIG91dHB1dHMgYW5kIHdyaXRlIHRoZW1cbiAgICAgIGNvbnN0IHR4T3V0c1NpemUgPSB0aGlzLm91dHMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIG91dHB1dCkge1xuICAgICAgICByZXR1cm4gc3VtICsgOCArIHZhclNsaWNlU2l6ZShvdXRwdXQuc2NyaXB0KTtcbiAgICAgIH0sIDApO1xuXG4gICAgICBjb25zdCBidWZmZXJXcml0ZXIgPSBuZXcgQnVmZmVyV3JpdGVyKEJ1ZmZlci5hbGxvY1Vuc2FmZSh0eE91dHNTaXplKSk7XG5cbiAgICAgIHRoaXMub3V0cy5mb3JFYWNoKGZ1bmN0aW9uIChvdXQpIHtcbiAgICAgICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDY0KG91dC52YWx1ZSk7XG4gICAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVZhclNsaWNlKG91dC5zY3JpcHQpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBnZXRCbGFrZTJiSGFzaChidWZmZXJXcml0ZXIuYnVmZmVyLCAnWmNhc2hPdXRwdXRzSGFzaCcpO1xuICAgIH0gZWxzZSBpZiAoKGhhc2hUeXBlICYgMHgxZikgPT09IFRyYW5zYWN0aW9uLlNJR0hBU0hfU0lOR0xFICYmIGluSW5kZXggPCB0aGlzLm91dHMubGVuZ3RoKSB7XG4gICAgICAvLyBXcml0ZSBvbmx5IHRoZSBvdXRwdXQgc3BlY2lmaWVkIGluIGluSW5kZXhcbiAgICAgIGNvbnN0IG91dHB1dCA9IHRoaXMub3V0c1tpbkluZGV4XTtcblxuICAgICAgY29uc3QgYnVmZmVyV3JpdGVyID0gbmV3IEJ1ZmZlcldyaXRlcihCdWZmZXIuYWxsb2NVbnNhZmUoOCArIHZhclNsaWNlU2l6ZShvdXRwdXQuc2NyaXB0KSkpO1xuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDY0KG91dHB1dC52YWx1ZSk7XG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVWYXJTbGljZShvdXRwdXQuc2NyaXB0KTtcblxuICAgICAgcmV0dXJuIGdldEJsYWtlMmJIYXNoKGJ1ZmZlcldyaXRlci5idWZmZXIsICdaY2FzaE91dHB1dHNIYXNoJyk7XG4gICAgfVxuICAgIHJldHVybiBaRVJPO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhc2ggdHJhbnNhY3Rpb24gZm9yIHNpZ25pbmcgYSB0cmFuc3BhcmVudCB0cmFuc2FjdGlvbiBpbiBaY2FzaC4gUHJvdGVjdGVkIHRyYW5zYWN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZC5cbiAgICogQHBhcmFtIGluSW5kZXhcbiAgICogQHBhcmFtIHByZXZPdXRTY3JpcHRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBoYXNoVHlwZVxuICAgKiBAcmV0dXJucyBCdWZmZXIgQkxBS0UyYiBoYXNoXG4gICAqL1xuICBoYXNoRm9yU2lnbmF0dXJlQnlOZXR3b3JrKGluSW5kZXg6IG51bWJlciwgcHJldk91dFNjcmlwdDogQnVmZmVyLCB2YWx1ZTogbnVtYmVyLCBoYXNoVHlwZTogbnVtYmVyKTogQnVmZmVyIHtcbiAgICB0eXBlZm9yY2UodHlwZXMudHVwbGUodHlwZXMuVUludDMyLCB0eXBlcy5CdWZmZXIsIHR5cGVzLk51bWJlciksIGFyZ3VtZW50cyk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmIChpbkluZGV4ID49IHRoaXMuaW5zLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBpbmRleCBpcyBvdXQgb2YgcmFuZ2UnKTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICghdGhpcy5pc092ZXJ3aW50ZXJDb21wYXRpYmxlKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdmVyc2lvbiAke3RoaXMudmVyc2lvbn1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoUHJldm91dHMgPSB0aGlzLmdldFByZXZvdXRIYXNoKGhhc2hUeXBlKTtcbiAgICBjb25zdCBoYXNoU2VxdWVuY2UgPSB0aGlzLmdldFNlcXVlbmNlSGFzaChoYXNoVHlwZSk7XG4gICAgY29uc3QgaGFzaE91dHB1dHMgPSB0aGlzLmdldE91dHB1dHNIYXNoKGhhc2hUeXBlLCBpbkluZGV4KTtcbiAgICBjb25zdCBoYXNoSm9pblNwbGl0cyA9IFpFUk87XG4gICAgY29uc3QgaGFzaFNoaWVsZGVkU3BlbmRzID0gWkVSTztcbiAgICBjb25zdCBoYXNoU2hpZWxkZWRPdXRwdXRzID0gWkVSTztcblxuICAgIGxldCBiYXNlQnVmZmVyU2l6ZSA9IDA7XG4gICAgYmFzZUJ1ZmZlclNpemUgKz0gNCAqIDU7IC8vIGhlYWRlciwgblZlcnNpb25Hcm91cElkLCBsb2NrX3RpbWUsIG5FeHBpcnlIZWlnaHQsIGhhc2hUeXBlXG4gICAgYmFzZUJ1ZmZlclNpemUgKz0gMzIgKiA0OyAvLyAyNTYgaGFzaGVzOiBoYXNoUHJldm91dHMsIGhhc2hTZXF1ZW5jZSwgaGFzaE91dHB1dHMsIGhhc2hKb2luU3BsaXRzXG4gICAgYmFzZUJ1ZmZlclNpemUgKz0gNCAqIDI7IC8vIGlucHV0LmluZGV4LCBpbnB1dC5zZXF1ZW5jZVxuICAgIGJhc2VCdWZmZXJTaXplICs9IDg7IC8vIHZhbHVlXG4gICAgYmFzZUJ1ZmZlclNpemUgKz0gMzI7IC8vIGlucHV0Lmhhc2hcbiAgICBiYXNlQnVmZmVyU2l6ZSArPSB2YXJTbGljZVNpemUocHJldk91dFNjcmlwdCk7IC8vIHByZXZPdXRTY3JpcHRcbiAgICBpZiAodGhpcy5pc1NhcGxpbmdDb21wYXRpYmxlKCkpIHtcbiAgICAgIGJhc2VCdWZmZXJTaXplICs9IDMyICogMjsgLy8gaGFzaFNoaWVsZGVkU3BlbmRzIGFuZCBoYXNoU2hpZWxkZWRPdXRwdXRzXG4gICAgICBiYXNlQnVmZmVyU2l6ZSArPSA4OyAvLyB2YWx1ZUJhbGFuY2VcbiAgICB9XG5cbiAgICBjb25zdCBtYXNrID0gdGhpcy5vdmVyd2ludGVyZWQgPyAxIDogMDtcbiAgICBjb25zdCBoZWFkZXIgPSB0aGlzLnZlcnNpb24gfCAobWFzayA8PCAzMSk7XG5cbiAgICBjb25zdCBidWZmZXJXcml0ZXIgPSBuZXcgQnVmZmVyV3JpdGVyKEJ1ZmZlci5hbGxvYyhiYXNlQnVmZmVyU2l6ZSkpO1xuICAgIGJ1ZmZlcldyaXRlci53cml0ZUludDMyKGhlYWRlcik7XG4gICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKHRoaXMudmVyc2lvbkdyb3VwSWQpO1xuICAgIGJ1ZmZlcldyaXRlci53cml0ZVNsaWNlKGhhc2hQcmV2b3V0cyk7XG4gICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UoaGFzaFNlcXVlbmNlKTtcbiAgICBidWZmZXJXcml0ZXIud3JpdGVTbGljZShoYXNoT3V0cHV0cyk7XG4gICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UoaGFzaEpvaW5TcGxpdHMpO1xuICAgIGlmICh0aGlzLmlzU2FwbGluZ0NvbXBhdGlibGUoKSkge1xuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UoaGFzaFNoaWVsZGVkU3BlbmRzKTtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVNsaWNlKGhhc2hTaGllbGRlZE91dHB1dHMpO1xuICAgIH1cbiAgICBidWZmZXJXcml0ZXIud3JpdGVVSW50MzIodGhpcy5sb2NrdGltZSk7XG4gICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKHRoaXMuZXhwaXJ5SGVpZ2h0KTtcbiAgICBpZiAodGhpcy5pc1NhcGxpbmdDb21wYXRpYmxlKCkpIHtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVNsaWNlKFZBTFVFX0lOVDY0X1pFUk8pO1xuICAgIH1cbiAgICBidWZmZXJXcml0ZXIud3JpdGVJbnQzMihoYXNoVHlwZSk7XG5cbiAgICAvLyBUaGUgaW5wdXQgYmVpbmcgc2lnbmVkIChyZXBsYWNpbmcgdGhlIHNjcmlwdFNpZyB3aXRoIHNjcmlwdENvZGUgKyBhbW91bnQpXG4gICAgLy8gVGhlIHByZXZvdXQgbWF5IGFscmVhZHkgYmUgY29udGFpbmVkIGluIGhhc2hQcmV2b3V0LCBhbmQgdGhlIG5TZXF1ZW5jZVxuICAgIC8vIG1heSBhbHJlYWR5IGJlIGNvbnRhaW5lZCBpbiBoYXNoU2VxdWVuY2UuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmluc1tpbkluZGV4XTtcbiAgICBidWZmZXJXcml0ZXIud3JpdGVTbGljZShpbnB1dC5oYXNoKTtcbiAgICBidWZmZXJXcml0ZXIud3JpdGVVSW50MzIoaW5wdXQuaW5kZXgpO1xuICAgIGJ1ZmZlcldyaXRlci53cml0ZVZhclNsaWNlKHByZXZPdXRTY3JpcHQpO1xuICAgIGJ1ZmZlcldyaXRlci53cml0ZVVJbnQ2NCh2YWx1ZSk7XG4gICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKGlucHV0LnNlcXVlbmNlKTtcblxuICAgIGNvbnN0IHBlcnNvbmFsaXphdGlvbiA9IEJ1ZmZlci5hbGxvYygxNik7XG4gICAgY29uc3QgcHJlZml4ID0gJ1pjYXNoU2lnSGFzaCc7XG4gICAgcGVyc29uYWxpemF0aW9uLndyaXRlKHByZWZpeCk7XG4gICAgcGVyc29uYWxpemF0aW9uLndyaXRlVUludDMyTEUodGhpcy5jb25zZW5zdXNCcmFuY2hJZCwgcHJlZml4Lmxlbmd0aCk7XG5cbiAgICByZXR1cm4gZ2V0Qmxha2UyYkhhc2goYnVmZmVyV3JpdGVyLmJ1ZmZlciwgcGVyc29uYWxpemF0aW9uKTtcbiAgfVxuXG4gIHRvQnVmZmVyKGJ1ZmZlcj86IEJ1ZmZlciwgaW5pdGlhbE9mZnNldCA9IDApOiBCdWZmZXIge1xuICAgIGlmICghYnVmZmVyKSBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUodGhpcy5ieXRlTGVuZ3RoKCkpO1xuXG4gICAgY29uc3QgYnVmZmVyV3JpdGVyID0gbmV3IEJ1ZmZlcldyaXRlcihidWZmZXIsIGluaXRpYWxPZmZzZXQpO1xuXG4gICAgaWYgKHRoaXMuaXNPdmVyd2ludGVyQ29tcGF0aWJsZSgpKSB7XG4gICAgICBjb25zdCBtYXNrID0gdGhpcy5vdmVyd2ludGVyZWQgPyAxIDogMDtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZUludDMyKHRoaXMudmVyc2lvbiB8IChtYXNrIDw8IDMxKSk7IC8vIFNldCBvdmVyd2ludGVyIGJpdFxuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKHRoaXMudmVyc2lvbkdyb3VwSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVJbnQzMih0aGlzLnZlcnNpb24pO1xuICAgIH1cblxuICAgIGJ1ZmZlcldyaXRlci53cml0ZVZhckludCh0aGlzLmlucy5sZW5ndGgpO1xuXG4gICAgdGhpcy5pbnMuZm9yRWFjaChmdW5jdGlvbiAodHhJbikge1xuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UodHhJbi5oYXNoKTtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVVJbnQzMih0eEluLmluZGV4KTtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVZhclNsaWNlKHR4SW4uc2NyaXB0KTtcbiAgICAgIGJ1ZmZlcldyaXRlci53cml0ZVVJbnQzMih0eEluLnNlcXVlbmNlKTtcbiAgICB9KTtcblxuICAgIGJ1ZmZlcldyaXRlci53cml0ZVZhckludCh0aGlzLm91dHMubGVuZ3RoKTtcbiAgICB0aGlzLm91dHMuZm9yRWFjaChmdW5jdGlvbiAodHhPdXQpIHtcbiAgICAgIGlmICgodHhPdXQgYXMgYW55KS52YWx1ZUJ1ZmZlcikge1xuICAgICAgICBidWZmZXJXcml0ZXIud3JpdGVTbGljZSgodHhPdXQgYXMgYW55KS52YWx1ZUJ1ZmZlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZmZXJXcml0ZXIud3JpdGVVSW50NjQodHhPdXQudmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVWYXJTbGljZSh0eE91dC5zY3JpcHQpO1xuICAgIH0pO1xuXG4gICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKHRoaXMubG9ja3RpbWUpO1xuXG4gICAgaWYgKHRoaXMuaXNPdmVyd2ludGVyQ29tcGF0aWJsZSgpKSB7XG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVVSW50MzIodGhpcy5leHBpcnlIZWlnaHQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzU2FwbGluZ0NvbXBhdGlibGUoKSkge1xuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UoVkFMVUVfSU5UNjRfWkVSTyk7XG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVWYXJJbnQoMCk7IC8vIHZTaGllbGRlZFNwZW5kTGVuZ3RoXG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVWYXJJbnQoMCk7IC8vIHZTaGllbGRlZE91dHB1dExlbmd0aFxuICAgIH1cblxuICAgIGlmICh0aGlzLnN1cHBvcnRzSm9pblNwbGl0cygpKSB7XG4gICAgICBidWZmZXJXcml0ZXIud3JpdGVWYXJJbnQoMCk7IC8vIGpvaW5zU3BsaXRzIGxlbmd0aFxuICAgIH1cblxuICAgIGlmIChpbml0aWFsT2Zmc2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBidWZmZXIuc2xpY2UoaW5pdGlhbE9mZnNldCwgYnVmZmVyV3JpdGVyLm9mZnNldCk7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBnZXRIYXNoKGZvcldpdG5lc3M/OiBib29sZWFuKTogQnVmZmVyIHtcbiAgICBpZiAoZm9yV2l0bmVzcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGFyZ3VtZW50YCk7XG4gICAgfVxuICAgIHJldHVybiBjcnlwdG8uaGFzaDI1Nih0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgY2xvbmUoKTogWmNhc2hUcmFuc2FjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBaY2FzaFRyYW5zYWN0aW9uKHRoaXMubmV0d29yaywgdGhpcyk7XG4gIH1cbn1cbiJdfQ==