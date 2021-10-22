"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashTransaction = void 0;
const bufferutils_1 = require("bitcoinjs-lib/src/bufferutils");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const UtxoTransaction_1 = require("../UtxoTransaction");
const coins_1 = require("../../coins");
class DashTransaction extends UtxoTransaction_1.UtxoTransaction {
    constructor(network, tx) {
        super(network, tx);
        this.type = 0;
        if (!coins_1.isDash(network)) {
            throw new Error(`invalid network`);
        }
        if (tx) {
            this.version = tx.version;
            if (tx instanceof DashTransaction) {
                this.type = tx.type;
                this.extraPayload = tx.extraPayload;
            }
        }
        // since `__toBuffer` is private we have to do a little hack here
        this.__toBuffer = this.toBufferWithExtraPayload;
    }
    static fromTransaction(tx) {
        return new DashTransaction(tx.network, tx);
    }
    static fromBuffer(buffer, noStrict, network) {
        const baseTx = UtxoTransaction_1.UtxoTransaction.fromBuffer(buffer, true, network);
        const tx = new DashTransaction(network, baseTx);
        tx.version = baseTx.version & 0xffff;
        tx.type = baseTx.version >> 16;
        if (baseTx.byteLength() !== buffer.length) {
            const bufferReader = new bufferutils_1.BufferReader(buffer, baseTx.byteLength());
            tx.extraPayload = bufferReader.readVarSlice();
        }
        return tx;
    }
    clone() {
        return new DashTransaction(this.network, this);
    }
    byteLength(_ALLOW_WITNESS) {
        return super.byteLength(_ALLOW_WITNESS) + (this.extraPayload ? UtxoTransaction_1.varSliceSize(this.extraPayload) : 0);
    }
    /**
     * Helper to override `__toBuffer()` of bitcoinjs.Transaction.
     * Since the method is private, we use a hack in the constructor to make it work.
     *
     * TODO: remove `private` modifier in bitcoinjs `__toBuffer()` or find some other solution
     *
     * @param buffer - optional target buffer
     * @param initialOffset - can only be undefined or 0. Other values are only used for serialization in blocks.
     * @param _ALLOW_WITNESS - ignored
     */
    toBufferWithExtraPayload(buffer, initialOffset, _ALLOW_WITNESS = false) {
        // We can ignore the `_ALLOW_WITNESS` parameter here since it has no effect.
        if (!buffer) {
            buffer = Buffer.allocUnsafe(this.byteLength(false));
        }
        if (initialOffset !== undefined && initialOffset !== 0) {
            throw new Error(`not supported`);
        }
        // Start out with regular bitcoin byte sequence.
        // This buffer will have excess size because it uses `byteLength()` to allocate.
        const baseBuffer = bitcoinjs_lib_1.Transaction.prototype.__toBuffer.call(this);
        baseBuffer.copy(buffer);
        // overwrite leading version bytes (uint16 version, uint16 type)
        const bufferWriter = new bufferutils_1.BufferWriter(buffer, 0);
        bufferWriter.writeUInt32((this.version & 0xffff) | (this.type << 16));
        // Seek to end of original byte sequence and add extraPayload.
        // We must use the byteLength as calculated by the bitcoinjs implementation since
        // `baseBuffer` has an excess size.
        if (this.extraPayload) {
            bufferWriter.offset = bitcoinjs_lib_1.Transaction.prototype.byteLength.call(this);
            bufferWriter.writeVarSlice(this.extraPayload);
        }
        return buffer;
    }
    getHash(forWitness) {
        if (forWitness) {
            throw new Error(`invalid argument`);
        }
        return bitcoinjs_lib_1.crypto.hash256(this.toBuffer());
    }
    /**
     * Build a hash for all or none of the transaction inputs depending on the hashtype
     * @param hashType
     * @returns Buffer
     */
    getPrevoutHash(hashType) {
        if (!(hashType & UtxoTransaction_1.UtxoTransaction.SIGHASH_ANYONECANPAY)) {
            const bufferWriter = new bufferutils_1.BufferWriter(Buffer.allocUnsafe(36 * this.ins.length));
            this.ins.forEach(function (txIn) {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            return bitcoinjs_lib_1.crypto.hash256(bufferWriter.buffer);
        }
        return Buffer.alloc(32, 0);
    }
}
exports.DashTransaction = DashTransaction;
DashTransaction.DASH_NORMAL = 0;
DashTransaction.DASH_PROVIDER_REGISTER = 1;
DashTransaction.DASH_PROVIDER_UPDATE_SERVICE = 2;
DashTransaction.DASH_PROVIDER_UPDATE_REGISTRAR = 3;
DashTransaction.DASH_PROVIDER_UPDATE_REVOKE = 4;
DashTransaction.DASH_COINBASE = 5;
DashTransaction.DASH_QUORUM_COMMITMENT = 6;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGFzaFRyYW5zYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2JpdGdvL2Rhc2gvRGFzaFRyYW5zYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUEyRTtBQUMzRSxpREFBK0Q7QUFFL0Qsd0RBQW1FO0FBRW5FLHVDQUFxQztBQUVyQyxNQUFhLGVBQWdCLFNBQVEsaUNBQWU7SUFZbEQsWUFBWSxPQUFnQixFQUFFLEVBQXNDO1FBQ2xFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFKZCxTQUFJLEdBQUcsQ0FBQyxDQUFDO1FBTWQsSUFBSSxDQUFDLGNBQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDcEM7UUFFRCxJQUFJLEVBQUUsRUFBRTtZQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUUxQixJQUFJLEVBQUUsWUFBWSxlQUFlLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQ3JDO1NBQ0Y7UUFFRCxpRUFBaUU7UUFDaEUsSUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUM7SUFDM0QsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBbUI7UUFDeEMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxRQUFpQixFQUFFLE9BQWdCO1FBQ25FLE1BQU0sTUFBTSxHQUFHLGlDQUFlLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxD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WSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUVoRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBQzdCLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sc0JBQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzdDO1FBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDOztBQXpISCwwQ0EwSEM7QUF6SFEsMkJBQVcsR0FBRyxDQUFDLENBQUM7QUFDaEIsc0NBQXNCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLDRDQUE0QixHQUFHLENBQUMsQ0FBQztBQUNqQyw4Q0FBOEIsR0FBRyxDQUFDLENBQUM7QUFDbkMsMkNBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLDZCQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLHNDQUFzQixHQUFHLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1ZmZlclJlYWRlciwgQnVmZmVyV3JpdGVyIH0gZnJvbSAnYml0Y29pbmpzLWxpYi9zcmMvYnVmZmVydXRpbHMnO1xuaW1wb3J0IHsgY3J5cHRvIGFzIGJjcnlwdG8sIFRyYW5zYWN0aW9uIH0gZnJvbSAnYml0Y29pbmpzLWxpYic7XG5cbmltcG9ydCB7IFV0eG9UcmFuc2FjdGlvbiwgdmFyU2xpY2VTaXplIH0gZnJvbSAnLi4vVXR4b1RyYW5zYWN0aW9uJztcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuLi8uLi9uZXR3b3JrVHlwZXMnO1xuaW1wb3J0IHsgaXNEYXNoIH0gZnJvbSAnLi4vLi4vY29pbnMnO1xuXG5leHBvcnQgY2xhc3MgRGFzaFRyYW5zYWN0aW9uIGV4dGVuZHMgVXR4b1RyYW5zYWN0aW9uIHtcbiAgc3RhdGljIERBU0hfTk9STUFMID0gMDtcbiAgc3RhdGljIERBU0hfUFJPVklERVJfUkVHSVNURVIgPSAxO1xuICBzdGF0aWMgREFTSF9QUk9WSURFUl9VUERBVEVfU0VSVklDRSA9IDI7XG4gIHN0YXRpYyBEQVNIX1BST1ZJREVSX1VQREFURV9SRUdJU1RSQVIgPSAzO1xuICBzdGF0aWMgREFTSF9QUk9WSURFUl9VUERBVEVfUkVWT0tFID0gNDtcbiAgc3RhdGljIERBU0hfQ09JTkJBU0UgPSA1O1xuICBzdGF0aWMgREFTSF9RVU9SVU1fQ09NTUlUTUVOVCA9IDY7XG5cbiAgcHVibGljIHR5cGUgPSAwO1xuICBwdWJsaWMgZXh0cmFQYXlsb2FkPzogQnVmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5ldHdvcms6IE5ldHdvcmssIHR4PzogVXR4b1RyYW5zYWN0aW9uIHwgRGFzaFRyYW5zYWN0aW9uKSB7XG4gICAgc3VwZXIobmV0d29yaywgdHgpO1xuXG4gICAgaWYgKCFpc0Rhc2gobmV0d29yaykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBuZXR3b3JrYCk7XG4gICAgfVxuXG4gICAgaWYgKHR4KSB7XG4gICAgICB0aGlzLnZlcnNpb24gPSB0eC52ZXJzaW9uO1xuXG4gICAgICBpZiAodHggaW5zdGFuY2VvZiBEYXNoVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgdGhpcy50eXBlID0gdHgudHlwZTtcbiAgICAgICAgdGhpcy5leHRyYVBheWxvYWQgPSB0eC5leHRyYVBheWxvYWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2luY2UgYF9fdG9CdWZmZXJgIGlzIHByaXZhdGUgd2UgaGF2ZSB0byBkbyBhIGxpdHRsZSBoYWNrIGhlcmVcbiAgICAodGhpcyBhcyBhbnkpLl9fdG9CdWZmZXIgPSB0aGlzLnRvQnVmZmVyV2l0aEV4dHJhUGF5bG9hZDtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tVHJhbnNhY3Rpb24odHg6IERhc2hUcmFuc2FjdGlvbik6IERhc2hUcmFuc2FjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBEYXNoVHJhbnNhY3Rpb24odHgubmV0d29yaywgdHgpO1xuICB9XG5cbiAgc3RhdGljIGZyb21CdWZmZXIoYnVmZmVyOiBCdWZmZXIsIG5vU3RyaWN0OiBib29sZWFuLCBuZXR3b3JrOiBOZXR3b3JrKTogRGFzaFRyYW5zYWN0aW9uIHtcbiAgICBjb25zdCBiYXNlVHggPSBVdHhvVHJhbnNhY3Rpb24uZnJvbUJ1ZmZlcihidWZmZXIsIHRydWUsIG5ldHdvcmspO1xuICAgIGNvbnN0IHR4ID0gbmV3IERhc2hUcmFuc2FjdGlvbihuZXR3b3JrLCBiYXNlVHgpO1xuICAgIHR4LnZlcnNpb24gPSBiYXNlVHgudmVyc2lvbiAmIDB4ZmZmZjtcbiAgICB0eC50eXBlID0gYmFzZVR4LnZlcnNpb24gPj4gMTY7XG4gICAgaWYgKGJhc2VUeC5ieXRlTGVuZ3RoKCkgIT09IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlclJlYWRlciA9IG5ldyBCdWZmZXJSZWFkZXIoYnVmZmVyLCBiYXNlVHguYnl0ZUxlbmd0aCgpKTtcbiAgICAgIHR4LmV4dHJhUGF5bG9hZCA9IGJ1ZmZlclJlYWRlci5yZWFkVmFyU2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHR4O1xuICB9XG5cbiAgY2xvbmUoKTogRGFzaFRyYW5zYWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IERhc2hUcmFuc2FjdGlvbih0aGlzLm5ldHdvcmssIHRoaXMpO1xuICB9XG5cbiAgYnl0ZUxlbmd0aChfQUxMT1dfV0lUTkVTUz86IGJvb2xlYW4pOiBudW1iZXIge1xuICAgIHJldHVybiBzdXBlci5ieXRlTGVuZ3RoKF9BTExPV19XSVRORVNTKSArICh0aGlzLmV4dHJhUGF5bG9hZCA/IHZhclNsaWNlU2l6ZSh0aGlzLmV4dHJhUGF5bG9hZCkgOiAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gb3ZlcnJpZGUgYF9fdG9CdWZmZXIoKWAgb2YgYml0Y29pbmpzLlRyYW5zYWN0aW9uLlxuICAgKiBTaW5jZSB0aGUgbWV0aG9kIGlzIHByaXZhdGUsIHdlIHVzZSBhIGhhY2sgaW4gdGhlIGNvbnN0cnVjdG9yIHRvIG1ha2UgaXQgd29yay5cbiAgICpcbiAgICogVE9ETzogcmVtb3ZlIGBwcml2YXRlYCBtb2RpZmllciBpbiBiaXRjb2luanMgYF9fdG9CdWZmZXIoKWAgb3IgZmluZCBzb21lIG90aGVyIHNvbHV0aW9uXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBvcHRpb25hbCB0YXJnZXQgYnVmZmVyXG4gICAqIEBwYXJhbSBpbml0aWFsT2Zmc2V0IC0gY2FuIG9ubHkgYmUgdW5kZWZpbmVkIG9yIDAuIE90aGVyIHZhbHVlcyBhcmUgb25seSB1c2VkIGZvciBzZXJpYWxpemF0aW9uIGluIGJsb2Nrcy5cbiAgICogQHBhcmFtIF9BTExPV19XSVRORVNTIC0gaWdub3JlZFxuICAgKi9cbiAgcHJpdmF0ZSB0b0J1ZmZlcldpdGhFeHRyYVBheWxvYWQoYnVmZmVyPzogQnVmZmVyLCBpbml0aWFsT2Zmc2V0PzogbnVtYmVyLCBfQUxMT1dfV0lUTkVTUyA9IGZhbHNlKTogQnVmZmVyIHtcbiAgICAvLyBXZSBjYW4gaWdub3JlIHRoZSBgX0FMTE9XX1dJVE5FU1NgIHBhcmFtZXRlciBoZXJlIHNpbmNlIGl0IGhhcyBubyBlZmZlY3QuXG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSh0aGlzLmJ5dGVMZW5ndGgoZmFsc2UpKTtcbiAgICB9XG5cbiAgICBpZiAoaW5pdGlhbE9mZnNldCAhPT0gdW5kZWZpbmVkICYmIGluaXRpYWxPZmZzZXQgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZGApO1xuICAgIH1cblxuICAgIC8vIFN0YXJ0IG91dCB3aXRoIHJlZ3VsYXIgYml0Y29pbiBieXRlIHNlcXVlbmNlLlxuICAgIC8vIFRoaXMgYnVmZmVyIHdpbGwgaGF2ZSBleGNlc3Mgc2l6ZSBiZWNhdXNlIGl0IHVzZXMgYGJ5dGVMZW5ndGgoKWAgdG8gYWxsb2NhdGUuXG4gICAgY29uc3QgYmFzZUJ1ZmZlciA9IChUcmFuc2FjdGlvbi5wcm90b3R5cGUgYXMgYW55KS5fX3RvQnVmZmVyLmNhbGwodGhpcyk7XG4gICAgYmFzZUJ1ZmZlci5jb3B5KGJ1ZmZlcik7XG5cbiAgICAvLyBvdmVyd3JpdGUgbGVhZGluZyB2ZXJzaW9uIGJ5dGVzICh1aW50MTYgdmVyc2lvbiwgdWludDE2IHR5cGUpXG4gICAgY29uc3QgYnVmZmVyV3JpdGVyID0gbmV3IEJ1ZmZlcldyaXRlcihidWZmZXIsIDApO1xuICAgIGJ1ZmZlcldyaXRlci53cml0ZVVJbnQzMigodGhpcy52ZXJzaW9uICYgMHhmZmZmKSB8ICh0aGlzLnR5cGUgPDwgMTYpKTtcblxuICAgIC8vIFNlZWsgdG8gZW5kIG9mIG9yaWdpbmFsIGJ5dGUgc2VxdWVuY2UgYW5kIGFkZCBleHRyYVBheWxvYWQuXG4gICAgLy8gV2UgbXVzdCB1c2UgdGhlIGJ5dGVMZW5ndGggYXMgY2FsY3VsYXRlZCBieSB0aGUgYml0Y29pbmpzIGltcGxlbWVudGF0aW9uIHNpbmNlXG4gICAgLy8gYGJhc2VCdWZmZXJgIGhhcyBhbiBleGNlc3Mgc2l6ZS5cbiAgICBpZiAodGhpcy5leHRyYVBheWxvYWQpIHtcbiAgICAgIGJ1ZmZlcldyaXRlci5vZmZzZXQgPSBUcmFuc2FjdGlvbi5wcm90b3R5cGUuYnl0ZUxlbmd0aC5jYWxsKHRoaXMpO1xuICAgICAgYnVmZmVyV3JpdGVyLndyaXRlVmFyU2xpY2UodGhpcy5leHRyYVBheWxvYWQpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cblxuICBnZXRIYXNoKGZvcldpdG5lc3M/OiBib29sZWFuKTogQnVmZmVyIHtcbiAgICBpZiAoZm9yV2l0bmVzcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGFyZ3VtZW50YCk7XG4gICAgfVxuICAgIHJldHVybiBiY3J5cHRvLmhhc2gyNTYodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCBhIGhhc2ggZm9yIGFsbCBvciBub25lIG9mIHRoZSB0cmFuc2FjdGlvbiBpbnB1dHMgZGVwZW5kaW5nIG9uIHRoZSBoYXNodHlwZVxuICAgKiBAcGFyYW0gaGFzaFR5cGVcbiAgICogQHJldHVybnMgQnVmZmVyXG4gICAqL1xuICBnZXRQcmV2b3V0SGFzaChoYXNoVHlwZTogbnVtYmVyKTogQnVmZmVyIHtcbiAgICBpZiAoIShoYXNoVHlwZSAmIFV0eG9UcmFuc2FjdGlvbi5TSUdIQVNIX0FOWU9ORUNBTlBBWSkpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcldyaXRlciA9IG5ldyBCdWZmZXJXcml0ZXIoQnVmZmVyLmFsbG9jVW5zYWZlKDM2ICogdGhpcy5pbnMubGVuZ3RoKSk7XG5cbiAgICAgIHRoaXMuaW5zLmZvckVhY2goZnVuY3Rpb24gKHR4SW4pIHtcbiAgICAgICAgYnVmZmVyV3JpdGVyLndyaXRlU2xpY2UodHhJbi5oYXNoKTtcbiAgICAgICAgYnVmZmVyV3JpdGVyLndyaXRlVUludDMyKHR4SW4uaW5kZXgpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBiY3J5cHRvLmhhc2gyNTYoYnVmZmVyV3JpdGVyLmJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygzMiwgMCk7XG4gIH1cbn1cbiJdfQ==