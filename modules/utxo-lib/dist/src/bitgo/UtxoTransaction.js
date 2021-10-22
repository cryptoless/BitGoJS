"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtxoTransaction = exports.varSliceSize = void 0;
const bitcoinjs = require("bitcoinjs-lib");
const varuint = require("varuint-bitcoin");
const coins_1 = require("../coins");
const networks = require("../networks");
function varSliceSize(slice) {
    const length = slice.length;
    return varuint.encodingLength(length) + length;
}
exports.varSliceSize = varSliceSize;
class UtxoTransaction extends bitcoinjs.Transaction {
    constructor(network, transaction = new bitcoinjs.Transaction()) {
        super();
        this.network = network;
        this.version = transaction.version;
        this.locktime = transaction.locktime;
        this.ins = transaction.ins.map((v) => (Object.assign({}, v)));
        this.outs = transaction.outs.map((v) => (Object.assign({}, v)));
    }
    static fromBuffer(buf, noStrict, network) {
        if (!network) {
            throw new Error(`must provide network`);
        }
        return new UtxoTransaction(network, bitcoinjs.Transaction.fromBuffer(buf, noStrict));
    }
    addForkId(hashType) {
        if (hashType & UtxoTransaction.SIGHASH_FORKID) {
            const forkId = coins_1.isBitcoinGold(this.network) ? 79 : 0;
            return (hashType | (forkId << 8)) >>> 0;
        }
        return hashType;
    }
    hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
        return super.hashForWitnessV0(inIndex, prevOutScript, value, this.addForkId(hashType));
    }
    /**
     * Calculate the hash to verify the signature against
     */
    hashForSignatureByNetwork(inIndex, prevoutScript, value, hashType) {
        switch (coins_1.getMainnet(this.network)) {
            case networks.zcash:
                throw new Error(`illegal state`);
            case networks.bitcoincash:
            case networks.bitcoinsv:
            case networks.bitcoingold:
                /*
                  Bitcoin Cash supports a FORKID flag. When set, we hash using hashing algorithm
                   that is used for segregated witness transactions (defined in BIP143).
        
                  The flag is also used by BitcoinSV and BitcoinGold
        
                  https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md
                 */
                const addForkId = (hashType & UtxoTransaction.SIGHASH_FORKID) > 0;
                if (addForkId) {
                    /*
                      ``The sighash type is altered to include a 24-bit fork id in its most significant bits.''
                      We also use unsigned right shift operator `>>>` to cast to UInt32
                      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift
                     */
                    if (value === undefined) {
                        throw new Error(`must provide value`);
                    }
                    return super.hashForWitnessV0(inIndex, prevoutScript, value, this.addForkId(hashType));
                }
        }
        return super.hashForSignature(inIndex, prevoutScript, hashType);
    }
    hashForSignature(inIndex, prevOutScript, hashType) {
        return this.hashForSignatureByNetwork(inIndex, prevOutScript, this.ins[inIndex].value, hashType);
    }
    clone() {
        return new UtxoTransaction(this.network, super.clone());
    }
}
exports.UtxoTransaction = UtxoTransaction;
UtxoTransaction.SIGHASH_FORKID = 0x40;
/** @deprecated use SIGHASH_FORKID */
UtxoTransaction.SIGHASH_BITCOINCASHBIP143 = UtxoTransaction.SIGHASH_FORKID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXR4b1RyYW5zYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JpdGdvL1V0eG9UcmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBRzNDLG9DQUFxRDtBQUNyRCx3Q0FBd0M7QUFFeEMsU0FBZ0IsWUFBWSxDQUFDLEtBQWE7SUFDeEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM1QixPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ2pELENBQUM7QUFIRCxvQ0FHQztBQUVELE1BQWEsZUFBZ0IsU0FBUSxTQUFTLENBQUMsV0FBVztJQUt4RCxZQUFtQixPQUFnQixFQUFFLGNBQXFDLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRTtRQUNuRyxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFFakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxtQkFBTSxDQUFDLEVBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG1CQUFNLENBQUMsRUFBRyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVyxFQUFFLFFBQWlCLEVBQUUsT0FBaUI7UUFDakUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztRQUNELE9BQU8sSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBZ0I7UUFDeEIsSUFBSSxRQUFRLEdBQUcsZUFBZSxDQUFDLGNBQWMsRUFBRTtZQUM3QyxNQUFNLE1BQU0sR0FBRyxxQkFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFlLEVBQUUsYUFBcUIsRUFBRSxLQUFhLEVBQUUsUUFBZ0I7UUFDdEYsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRDs7T0FFRztJQUNILHlCQUF5QixDQUN2QixPQUFlLEVBQ2YsYUFBcUIsRUFDckIsS0FBeUIsRUFDekIsUUFBZ0I7UUFFaEIsUUFBUSxrQkFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNoQyxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ25DLEtBQUssUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUMxQixLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFDeEIsS0FBSyxRQUFRLENBQUMsV0FBVztnQkFDdkI7Ozs7Ozs7bUJBT0c7Z0JBQ0gsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFbEUsSUFBSSxTQUFTLEVBQUU7b0JBQ2I7Ozs7dUJBSUc7b0JBQ0gsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO3dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7cUJBQ3ZDO29CQUNELE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDeEY7U0FDSjtRQUVELE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELGdCQUFnQixDQUFDLE9BQWUsRUFBRSxhQUFxQixFQUFFLFFBQWdCO1FBQ3ZFLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUcsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQzs7QUFoRkgsMENBaUZDO0FBaEZRLDhCQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzdCLHFDQUFxQztBQUM5Qix5Q0FBeUIsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYml0Y29pbmpzIGZyb20gJ2JpdGNvaW5qcy1saWInO1xuaW1wb3J0ICogYXMgdmFydWludCBmcm9tICd2YXJ1aW50LWJpdGNvaW4nO1xuXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnLi4vbmV0d29ya1R5cGVzJztcbmltcG9ydCB7IGdldE1haW5uZXQsIGlzQml0Y29pbkdvbGQgfSBmcm9tICcuLi9jb2lucyc7XG5pbXBvcnQgKiBhcyBuZXR3b3JrcyBmcm9tICcuLi9uZXR3b3Jrcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2YXJTbGljZVNpemUoc2xpY2U6IEJ1ZmZlcik6IG51bWJlciB7XG4gIGNvbnN0IGxlbmd0aCA9IHNsaWNlLmxlbmd0aDtcbiAgcmV0dXJuIHZhcnVpbnQuZW5jb2RpbmdMZW5ndGgobGVuZ3RoKSArIGxlbmd0aDtcbn1cblxuZXhwb3J0IGNsYXNzIFV0eG9UcmFuc2FjdGlvbiBleHRlbmRzIGJpdGNvaW5qcy5UcmFuc2FjdGlvbiB7XG4gIHN0YXRpYyBTSUdIQVNIX0ZPUktJRCA9IDB4NDA7XG4gIC8qKiBAZGVwcmVjYXRlZCB1c2UgU0lHSEFTSF9GT1JLSUQgKi9cbiAgc3RhdGljIFNJR0hBU0hfQklUQ09JTkNBU0hCSVAxNDMgPSBVdHhvVHJhbnNhY3Rpb24uU0lHSEFTSF9GT1JLSUQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5ldHdvcms6IE5ldHdvcmssIHRyYW5zYWN0aW9uOiBiaXRjb2luanMuVHJhbnNhY3Rpb24gPSBuZXcgYml0Y29pbmpzLlRyYW5zYWN0aW9uKCkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmVyc2lvbiA9IHRyYW5zYWN0aW9uLnZlcnNpb247XG4gICAgdGhpcy5sb2NrdGltZSA9IHRyYW5zYWN0aW9uLmxvY2t0aW1lO1xuICAgIHRoaXMuaW5zID0gdHJhbnNhY3Rpb24uaW5zLm1hcCgodikgPT4gKHsgLi4udiB9KSk7XG4gICAgdGhpcy5vdXRzID0gdHJhbnNhY3Rpb24ub3V0cy5tYXAoKHYpID0+ICh7IC4uLnYgfSkpO1xuICB9XG5cbiAgc3RhdGljIGZyb21CdWZmZXIoYnVmOiBCdWZmZXIsIG5vU3RyaWN0OiBib29sZWFuLCBuZXR3b3JrPzogTmV0d29yayk6IFV0eG9UcmFuc2FjdGlvbiB7XG4gICAgaWYgKCFuZXR3b3JrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG11c3QgcHJvdmlkZSBuZXR3b3JrYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVXR4b1RyYW5zYWN0aW9uKG5ldHdvcmssIGJpdGNvaW5qcy5UcmFuc2FjdGlvbi5mcm9tQnVmZmVyKGJ1Ziwgbm9TdHJpY3QpKTtcbiAgfVxuXG4gIGFkZEZvcmtJZChoYXNoVHlwZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAoaGFzaFR5cGUgJiBVdHhvVHJhbnNhY3Rpb24uU0lHSEFTSF9GT1JLSUQpIHtcbiAgICAgIGNvbnN0IGZvcmtJZCA9IGlzQml0Y29pbkdvbGQodGhpcy5uZXR3b3JrKSA/IDc5IDogMDtcbiAgICAgIHJldHVybiAoaGFzaFR5cGUgfCAoZm9ya0lkIDw8IDgpKSA+Pj4gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaFR5cGU7XG4gIH1cblxuICBoYXNoRm9yV2l0bmVzc1YwKGluSW5kZXg6IG51bWJlciwgcHJldk91dFNjcmlwdDogQnVmZmVyLCB2YWx1ZTogbnVtYmVyLCBoYXNoVHlwZTogbnVtYmVyKTogQnVmZmVyIHtcbiAgICByZXR1cm4gc3VwZXIuaGFzaEZvcldpdG5lc3NWMChpbkluZGV4LCBwcmV2T3V0U2NyaXB0LCB2YWx1ZSwgdGhpcy5hZGRGb3JrSWQoaGFzaFR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIGhhc2ggdG8gdmVyaWZ5IHRoZSBzaWduYXR1cmUgYWdhaW5zdFxuICAgKi9cbiAgaGFzaEZvclNpZ25hdHVyZUJ5TmV0d29yayhcbiAgICBpbkluZGV4OiBudW1iZXIsXG4gICAgcHJldm91dFNjcmlwdDogQnVmZmVyLFxuICAgIHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgaGFzaFR5cGU6IG51bWJlclxuICApOiBCdWZmZXIge1xuICAgIHN3aXRjaCAoZ2V0TWFpbm5ldCh0aGlzLm5ldHdvcmspKSB7XG4gICAgICBjYXNlIG5ldHdvcmtzLnpjYXNoOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlsbGVnYWwgc3RhdGVgKTtcbiAgICAgIGNhc2UgbmV0d29ya3MuYml0Y29pbmNhc2g6XG4gICAgICBjYXNlIG5ldHdvcmtzLmJpdGNvaW5zdjpcbiAgICAgIGNhc2UgbmV0d29ya3MuYml0Y29pbmdvbGQ6XG4gICAgICAgIC8qXG4gICAgICAgICAgQml0Y29pbiBDYXNoIHN1cHBvcnRzIGEgRk9SS0lEIGZsYWcuIFdoZW4gc2V0LCB3ZSBoYXNoIHVzaW5nIGhhc2hpbmcgYWxnb3JpdGhtXG4gICAgICAgICAgIHRoYXQgaXMgdXNlZCBmb3Igc2VncmVnYXRlZCB3aXRuZXNzIHRyYW5zYWN0aW9ucyAoZGVmaW5lZCBpbiBCSVAxNDMpLlxuXG4gICAgICAgICAgVGhlIGZsYWcgaXMgYWxzbyB1c2VkIGJ5IEJpdGNvaW5TViBhbmQgQml0Y29pbkdvbGRcblxuICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luY2FzaG9yZy9iaXRjb2luY2FzaC5vcmcvYmxvYi9tYXN0ZXIvc3BlYy9yZXBsYXktcHJvdGVjdGVkLXNpZ2hhc2gubWRcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGFkZEZvcmtJZCA9IChoYXNoVHlwZSAmIFV0eG9UcmFuc2FjdGlvbi5TSUdIQVNIX0ZPUktJRCkgPiAwO1xuXG4gICAgICAgIGlmIChhZGRGb3JrSWQpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAgYGBUaGUgc2lnaGFzaCB0eXBlIGlzIGFsdGVyZWQgdG8gaW5jbHVkZSBhIDI0LWJpdCBmb3JrIGlkIGluIGl0cyBtb3N0IHNpZ25pZmljYW50IGJpdHMuJydcbiAgICAgICAgICAgIFdlIGFsc28gdXNlIHVuc2lnbmVkIHJpZ2h0IHNoaWZ0IG9wZXJhdG9yIGA+Pj5gIHRvIGNhc3QgdG8gVUludDMyXG4gICAgICAgICAgICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvVW5zaWduZWRfcmlnaHRfc2hpZnRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBtdXN0IHByb3ZpZGUgdmFsdWVgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN1cGVyLmhhc2hGb3JXaXRuZXNzVjAoaW5JbmRleCwgcHJldm91dFNjcmlwdCwgdmFsdWUsIHRoaXMuYWRkRm9ya0lkKGhhc2hUeXBlKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIuaGFzaEZvclNpZ25hdHVyZShpbkluZGV4LCBwcmV2b3V0U2NyaXB0LCBoYXNoVHlwZSk7XG4gIH1cblxuICBoYXNoRm9yU2lnbmF0dXJlKGluSW5kZXg6IG51bWJlciwgcHJldk91dFNjcmlwdDogQnVmZmVyLCBoYXNoVHlwZTogbnVtYmVyKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5oYXNoRm9yU2lnbmF0dXJlQnlOZXR3b3JrKGluSW5kZXgsIHByZXZPdXRTY3JpcHQsICh0aGlzLmluc1tpbkluZGV4XSBhcyBhbnkpLnZhbHVlLCBoYXNoVHlwZSk7XG4gIH1cblxuICBjbG9uZSgpOiBVdHhvVHJhbnNhY3Rpb24ge1xuICAgIHJldHVybiBuZXcgVXR4b1RyYW5zYWN0aW9uKHRoaXMubmV0d29yaywgc3VwZXIuY2xvbmUoKSk7XG4gIH1cbn1cbiJdfQ==