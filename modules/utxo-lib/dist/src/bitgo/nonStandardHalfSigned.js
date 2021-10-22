"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padInputScript = void 0;
const assert = require("assert");
const opcodes = require("bitcoin-ops");
const __1 = require("../");
/**
 * @param input - Input of non-standard half-signed transaction created with `tx.build()` instead of `tx.buildIncomplete()`.
 * @param signatureIndex - Position to map the existing signatures to. Other signatures will be padded with OP_0.
 */
function padInputScript(input, signatureIndex) {
    if (![0, 1, 2].includes(signatureIndex)) {
        throw new Error(`invalid signature index: must be one of [0, 1, 2]`);
    }
    let decompiledSigScript;
    if (input.witness && input.witness.length > 0) {
        decompiledSigScript = input.witness;
    }
    else {
        decompiledSigScript = __1.script.decompile(input.script);
    }
    // The shape of a non-standard half-signed input is
    //   OP_0 <signature> <p2ms>
    if (!decompiledSigScript || decompiledSigScript.length !== 3) {
        return;
    }
    const [op0, signatureBuffer, sigScript] = decompiledSigScript;
    if (op0 !== opcodes.OP_0 && !(Buffer.isBuffer(op0) && op0.length === 0)) {
        return;
    }
    if (!Buffer.isBuffer(sigScript)) {
        return;
    }
    if (__1.classify.output(sigScript) !== __1.classify.types.P2MS) {
        return;
    }
    const paddedSigScript = [
        op0,
        ...[0, 1, 2].map((i) => (i === signatureIndex ? signatureBuffer : Buffer.from([]))),
        sigScript,
    ];
    if (input.witness.length) {
        paddedSigScript.forEach((b) => assert(Buffer.isBuffer(b)));
        input.witness = paddedSigScript;
    }
    else {
        input.script = __1.script.compile(paddedSigScript);
    }
}
exports.padInputScript = padInputScript;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9uU3RhbmRhcmRIYWxmU2lnbmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JpdGdvL25vblN0YW5kYXJkSGFsZlNpZ25lZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBaUM7QUFDakMsdUNBQXVDO0FBQ3ZDLDJCQUEyRDtBQUUzRDs7O0dBR0c7QUFDSCxTQUFnQixjQUFjLENBQUMsS0FBYyxFQUFFLGNBQXNCO0lBQ25FLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztLQUN0RTtJQUVELElBQUksbUJBQW1CLENBQUM7SUFDeEIsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM3QyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0tBQ3JDO1NBQU07UUFDTCxtQkFBbUIsR0FBRyxVQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2RDtJQUVELG1EQUFtRDtJQUNuRCw0QkFBNEI7SUFDNUIsSUFBSSxDQUFDLG1CQUFtQixJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDNUQsT0FBTztLQUNSO0lBRUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsU0FBUyxDQUFDLEdBQUcsbUJBQW1CLENBQUM7SUFDOUQsSUFBSSxHQUFHLEtBQUssT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3ZFLE9BQU87S0FDUjtJQUVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQy9CLE9BQU87S0FDUjtJQUVELElBQUksWUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxZQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUN0RCxPQUFPO0tBQ1I7SUFFRCxNQUFNLGVBQWUsR0FBRztRQUN0QixHQUFHO1FBQ0gsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25GLFNBQVM7S0FDVixDQUFDO0lBRUYsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUN4QixlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsS0FBSyxDQUFDLE9BQU8sR0FBRyxlQUEyQixDQUFDO0tBQzdDO1NBQU07UUFDTCxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDakQ7QUFDSCxDQUFDO0FBM0NELHdDQTJDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgb3Bjb2RlcyBmcm9tICdiaXRjb2luLW9wcyc7XG5pbXBvcnQgeyBjbGFzc2lmeSwgc2NyaXB0IGFzIGJzY3JpcHQsIFR4SW5wdXQgfSBmcm9tICcuLi8nO1xuXG4vKipcbiAqIEBwYXJhbSBpbnB1dCAtIElucHV0IG9mIG5vbi1zdGFuZGFyZCBoYWxmLXNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIHdpdGggYHR4LmJ1aWxkKClgIGluc3RlYWQgb2YgYHR4LmJ1aWxkSW5jb21wbGV0ZSgpYC5cbiAqIEBwYXJhbSBzaWduYXR1cmVJbmRleCAtIFBvc2l0aW9uIHRvIG1hcCB0aGUgZXhpc3Rpbmcgc2lnbmF0dXJlcyB0by4gT3RoZXIgc2lnbmF0dXJlcyB3aWxsIGJlIHBhZGRlZCB3aXRoIE9QXzAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRJbnB1dFNjcmlwdChpbnB1dDogVHhJbnB1dCwgc2lnbmF0dXJlSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBpZiAoIVswLCAxLCAyXS5pbmNsdWRlcyhzaWduYXR1cmVJbmRleCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgc2lnbmF0dXJlIGluZGV4OiBtdXN0IGJlIG9uZSBvZiBbMCwgMSwgMl1gKTtcbiAgfVxuXG4gIGxldCBkZWNvbXBpbGVkU2lnU2NyaXB0O1xuICBpZiAoaW5wdXQud2l0bmVzcyAmJiBpbnB1dC53aXRuZXNzLmxlbmd0aCA+IDApIHtcbiAgICBkZWNvbXBpbGVkU2lnU2NyaXB0ID0gaW5wdXQud2l0bmVzcztcbiAgfSBlbHNlIHtcbiAgICBkZWNvbXBpbGVkU2lnU2NyaXB0ID0gYnNjcmlwdC5kZWNvbXBpbGUoaW5wdXQuc2NyaXB0KTtcbiAgfVxuXG4gIC8vIFRoZSBzaGFwZSBvZiBhIG5vbi1zdGFuZGFyZCBoYWxmLXNpZ25lZCBpbnB1dCBpc1xuICAvLyAgIE9QXzAgPHNpZ25hdHVyZT4gPHAybXM+XG4gIGlmICghZGVjb21waWxlZFNpZ1NjcmlwdCB8fCBkZWNvbXBpbGVkU2lnU2NyaXB0Lmxlbmd0aCAhPT0gMykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IFtvcDAsIHNpZ25hdHVyZUJ1ZmZlciwgc2lnU2NyaXB0XSA9IGRlY29tcGlsZWRTaWdTY3JpcHQ7XG4gIGlmIChvcDAgIT09IG9wY29kZXMuT1BfMCAmJiAhKEJ1ZmZlci5pc0J1ZmZlcihvcDApICYmIG9wMC5sZW5ndGggPT09IDApKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoc2lnU2NyaXB0KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChjbGFzc2lmeS5vdXRwdXQoc2lnU2NyaXB0KSAhPT0gY2xhc3NpZnkudHlwZXMuUDJNUykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhZGRlZFNpZ1NjcmlwdCA9IFtcbiAgICBvcDAsXG4gICAgLi4uWzAsIDEsIDJdLm1hcCgoaSkgPT4gKGkgPT09IHNpZ25hdHVyZUluZGV4ID8gc2lnbmF0dXJlQnVmZmVyIDogQnVmZmVyLmZyb20oW10pKSksXG4gICAgc2lnU2NyaXB0LFxuICBdO1xuXG4gIGlmIChpbnB1dC53aXRuZXNzLmxlbmd0aCkge1xuICAgIHBhZGRlZFNpZ1NjcmlwdC5mb3JFYWNoKChiKSA9PiBhc3NlcnQoQnVmZmVyLmlzQnVmZmVyKGIpKSk7XG4gICAgaW5wdXQud2l0bmVzcyA9IHBhZGRlZFNpZ1NjcmlwdCBhcyBCdWZmZXJbXTtcbiAgfSBlbHNlIHtcbiAgICBpbnB1dC5zY3JpcHQgPSBic2NyaXB0LmNvbXBpbGUocGFkZGVkU2lnU2NyaXB0KTtcbiAgfVxufVxuIl19