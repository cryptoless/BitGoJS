"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtxoTransactionBuilder = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const UtxoTransaction_1 = require("./UtxoTransaction");
class UtxoTransactionBuilder extends bitcoinjs_lib_1.TransactionBuilder {
    constructor(network, txb) {
        var _a;
        super();
        this.network = network;
        this.__TX = this.createInitialTransaction(network, (_a = txb) === null || _a === void 0 ? void 0 : _a.__TX);
        if (txb) {
            this.__INPUTS = txb.__INPUTS;
        }
    }
    createInitialTransaction(network, tx) {
        return new UtxoTransaction_1.UtxoTransaction(network, tx);
    }
    static fromTransaction(tx) {
        return new UtxoTransactionBuilder(tx.network, bitcoinjs_lib_1.TransactionBuilder.fromTransaction(tx));
    }
    get tx() {
        return this.__TX;
    }
    build() {
        return super.build();
    }
    buildIncomplete() {
        return super.buildIncomplete();
    }
    sign(signParams, keyPair, redeemScript, hashType, witnessValue, witnessScript) {
        // Regular bitcoin p2sh-p2ms inputs do not include the input amount (value) in the signature and
        // thus do not require the parameter `value` to be set.
        // For bitcoincash and bitcoinsv p2sh-p2ms inputs, the value parameter *is* required however.
        // Since the `value` parameter is not passed to the legacy hashing method, we must store it
        // on the transaction input object.
        if (typeof signParams === 'number') {
            if (typeof witnessValue === 'number') {
                this.tx.ins[signParams].value = witnessValue;
            }
            return super.sign(signParams, keyPair, redeemScript, hashType, witnessValue, witnessScript);
        }
        if (signParams.witnessValue !== undefined) {
            this.tx.ins[signParams.vin].value = signParams.witnessValue;
        }
        // When calling the sign method via TxbSignArg, the `value` parameter is actually not permitted
        // to be set for p2sh-p2ms transactions.
        if (signParams.prevOutScriptType === 'p2sh-p2ms') {
            delete signParams.witnessValue;
        }
        return super.sign(signParams);
    }
}
exports.UtxoTransactionBuilder = UtxoTransactionBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXR4b1RyYW5zYWN0aW9uQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaXRnby9VdHhvVHJhbnNhY3Rpb25CdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUFnRTtBQUloRSx1REFBb0Q7QUFZcEQsTUFBYSxzQkFBb0UsU0FBUSxrQ0FBa0I7SUFDekcsWUFBWSxPQUFnQixFQUFFLEdBQXdCOztRQUNwRCxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBNEIsQ0FBQztRQUUzQyxJQUFZLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsTUFBQyxHQUFXLDBDQUFFLElBQUksQ0FBQyxDQUFDO1FBRWhGLElBQUksR0FBRyxFQUFFO1lBQ04sSUFBWSxDQUFDLFFBQVEsR0FBSSxHQUFXLENBQUMsUUFBUSxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUVELHdCQUF3QixDQUFDLE9BQWdCLEVBQUUsRUFBZ0I7UUFDekQsT0FBTyxJQUFJLGlDQUFlLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQW1CO1FBQ3hDLE9BQU8sSUFBSSxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGtDQUFrQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRCxJQUFJLEVBQUU7UUFDSixPQUFRLElBQVksQ0FBQyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQU8sQ0FBQztJQUM1QixDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sS0FBSyxDQUFDLGVBQWUsRUFBTyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxJQUFJLENBQ0YsVUFBK0IsRUFDL0IsT0FBaUMsRUFDakMsWUFBcUIsRUFDckIsUUFBaUIsRUFDakIsWUFBcUIsRUFDckIsYUFBc0I7UUFFdEIsZ0dBQWdHO1FBQ2hHLHVEQUF1RDtRQUN2RCw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLG1DQUFtQztRQUVuQyxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtZQUNsQyxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFTLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQzthQUN2RDtZQUVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsSUFBSSxVQUFVLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtZQUN4QyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDdEU7UUFDRCwrRkFBK0Y7UUFDL0Ysd0NBQXdDO1FBQ3hDLElBQUksVUFBVSxDQUFDLGlCQUFpQixLQUFLLFdBQVcsRUFBRTtZQUNoRCxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDaEM7UUFDRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBaEVELHdEQWdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyYW5zYWN0aW9uLCBUcmFuc2FjdGlvbkJ1aWxkZXIgfSBmcm9tICdiaXRjb2luanMtbGliJztcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuaW1wb3J0ICogYXMgYml0Y29pbmpzIGZyb20gJ2JpdGNvaW5qcy1saWInO1xuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gJy4uL25ldHdvcmtUeXBlcyc7XG5pbXBvcnQgeyBVdHhvVHJhbnNhY3Rpb24gfSBmcm9tICcuL1V0eG9UcmFuc2FjdGlvbic7XG5cbmludGVyZmFjZSBUeGJTaWduQXJnIHtcbiAgcHJldk91dFNjcmlwdFR5cGU6IHN0cmluZztcbiAgdmluOiBudW1iZXI7XG4gIGtleVBhaXI6IGJpdGNvaW5qcy5FQ1BhaXIuU2lnbmVyO1xuICByZWRlZW1TY3JpcHQ/OiBCdWZmZXI7XG4gIGhhc2hUeXBlPzogbnVtYmVyO1xuICB3aXRuZXNzVmFsdWU/OiBudW1iZXI7XG4gIHdpdG5lc3NTY3JpcHQ/OiBCdWZmZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBVdHhvVHJhbnNhY3Rpb25CdWlsZGVyPFQgZXh0ZW5kcyBVdHhvVHJhbnNhY3Rpb24gPSBVdHhvVHJhbnNhY3Rpb24+IGV4dGVuZHMgVHJhbnNhY3Rpb25CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IobmV0d29yazogTmV0d29yaywgdHhiPzogVHJhbnNhY3Rpb25CdWlsZGVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5ldHdvcmsgPSBuZXR3b3JrIGFzIGJpdGNvaW5qcy5OZXR3b3JrO1xuXG4gICAgKHRoaXMgYXMgYW55KS5fX1RYID0gdGhpcy5jcmVhdGVJbml0aWFsVHJhbnNhY3Rpb24obmV0d29yaywgKHR4YiBhcyBhbnkpPy5fX1RYKTtcblxuICAgIGlmICh0eGIpIHtcbiAgICAgICh0aGlzIGFzIGFueSkuX19JTlBVVFMgPSAodHhiIGFzIGFueSkuX19JTlBVVFM7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlSW5pdGlhbFRyYW5zYWN0aW9uKG5ldHdvcms6IE5ldHdvcmssIHR4PzogVHJhbnNhY3Rpb24pOiBVdHhvVHJhbnNhY3Rpb24ge1xuICAgIHJldHVybiBuZXcgVXR4b1RyYW5zYWN0aW9uKG5ldHdvcmssIHR4KTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tVHJhbnNhY3Rpb24odHg6IFV0eG9UcmFuc2FjdGlvbik6IFV0eG9UcmFuc2FjdGlvbkJ1aWxkZXIge1xuICAgIHJldHVybiBuZXcgVXR4b1RyYW5zYWN0aW9uQnVpbGRlcih0eC5uZXR3b3JrLCBUcmFuc2FjdGlvbkJ1aWxkZXIuZnJvbVRyYW5zYWN0aW9uKHR4KSk7XG4gIH1cblxuICBnZXQgdHgoKTogVCB7XG4gICAgcmV0dXJuICh0aGlzIGFzIGFueSkuX19UWDtcbiAgfVxuXG4gIGJ1aWxkKCk6IFQge1xuICAgIHJldHVybiBzdXBlci5idWlsZCgpIGFzIFQ7XG4gIH1cblxuICBidWlsZEluY29tcGxldGUoKTogVCB7XG4gICAgcmV0dXJuIHN1cGVyLmJ1aWxkSW5jb21wbGV0ZSgpIGFzIFQ7XG4gIH1cblxuICBzaWduKFxuICAgIHNpZ25QYXJhbXM6IG51bWJlciB8IFR4YlNpZ25BcmcsXG4gICAga2V5UGFpcj86IGJpdGNvaW5qcy5FQ1BhaXIuU2lnbmVyLFxuICAgIHJlZGVlbVNjcmlwdD86IEJ1ZmZlcixcbiAgICBoYXNoVHlwZT86IG51bWJlcixcbiAgICB3aXRuZXNzVmFsdWU/OiBudW1iZXIsXG4gICAgd2l0bmVzc1NjcmlwdD86IEJ1ZmZlclxuICApOiB2b2lkIHtcbiAgICAvLyBSZWd1bGFyIGJpdGNvaW4gcDJzaC1wMm1zIGlucHV0cyBkbyBub3QgaW5jbHVkZSB0aGUgaW5wdXQgYW1vdW50ICh2YWx1ZSkgaW4gdGhlIHNpZ25hdHVyZSBhbmRcbiAgICAvLyB0aHVzIGRvIG5vdCByZXF1aXJlIHRoZSBwYXJhbWV0ZXIgYHZhbHVlYCB0byBiZSBzZXQuXG4gICAgLy8gRm9yIGJpdGNvaW5jYXNoIGFuZCBiaXRjb2luc3YgcDJzaC1wMm1zIGlucHV0cywgdGhlIHZhbHVlIHBhcmFtZXRlciAqaXMqIHJlcXVpcmVkIGhvd2V2ZXIuXG4gICAgLy8gU2luY2UgdGhlIGB2YWx1ZWAgcGFyYW1ldGVyIGlzIG5vdCBwYXNzZWQgdG8gdGhlIGxlZ2FjeSBoYXNoaW5nIG1ldGhvZCwgd2UgbXVzdCBzdG9yZSBpdFxuICAgIC8vIG9uIHRoZSB0cmFuc2FjdGlvbiBpbnB1dCBvYmplY3QuXG5cbiAgICBpZiAodHlwZW9mIHNpZ25QYXJhbXMgPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAodHlwZW9mIHdpdG5lc3NWYWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgKHRoaXMudHguaW5zW3NpZ25QYXJhbXNdIGFzIGFueSkudmFsdWUgPSB3aXRuZXNzVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdXBlci5zaWduKHNpZ25QYXJhbXMsIGtleVBhaXIsIHJlZGVlbVNjcmlwdCwgaGFzaFR5cGUsIHdpdG5lc3NWYWx1ZSwgd2l0bmVzc1NjcmlwdCk7XG4gICAgfVxuXG4gICAgaWYgKHNpZ25QYXJhbXMud2l0bmVzc1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICh0aGlzLnR4Lmluc1tzaWduUGFyYW1zLnZpbl0gYXMgYW55KS52YWx1ZSA9IHNpZ25QYXJhbXMud2l0bmVzc1ZhbHVlO1xuICAgIH1cbiAgICAvLyBXaGVuIGNhbGxpbmcgdGhlIHNpZ24gbWV0aG9kIHZpYSBUeGJTaWduQXJnLCB0aGUgYHZhbHVlYCBwYXJhbWV0ZXIgaXMgYWN0dWFsbHkgbm90IHBlcm1pdHRlZFxuICAgIC8vIHRvIGJlIHNldCBmb3IgcDJzaC1wMm1zIHRyYW5zYWN0aW9ucy5cbiAgICBpZiAoc2lnblBhcmFtcy5wcmV2T3V0U2NyaXB0VHlwZSA9PT0gJ3Ayc2gtcDJtcycpIHtcbiAgICAgIGRlbGV0ZSBzaWduUGFyYW1zLndpdG5lc3NWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnNpZ24oc2lnblBhcmFtcyk7XG4gIH1cbn1cbiJdfQ==