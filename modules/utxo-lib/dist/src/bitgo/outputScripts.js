"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOutputScript2of3 = exports.createOutputScriptP2shP2pk = exports.scriptType2Of3AsPrevOutType = exports.isScriptType2Of3 = exports.scriptTypes2Of3 = void 0;
const assert = require("assert");
const bitcoinjs = require("bitcoinjs-lib");
const bitcoin_ops_1 = require("bitcoin-ops");
const types_1 = require("./types");
exports.scriptTypes2Of3 = ['p2sh', 'p2shP2wsh', 'p2wsh', 'p2tr'];
function isScriptType2Of3(t) {
    return exports.scriptTypes2Of3.includes(t);
}
exports.isScriptType2Of3 = isScriptType2Of3;
/**
 * @param t
 * @return string prevOut as defined in PREVOUT_TYPES (bitcoinjs-lib/.../transaction_builder.js)
 */
function scriptType2Of3AsPrevOutType(t) {
    switch (t) {
        case 'p2sh':
            return 'p2sh-p2ms';
        case 'p2shP2wsh':
            return 'p2sh-p2wsh-p2ms';
        case 'p2wsh':
            return 'p2wsh-p2ms';
        default:
            throw new Error(`unsupported script type ${t}`);
    }
}
exports.scriptType2Of3AsPrevOutType = scriptType2Of3AsPrevOutType;
/**
 * Return scripts for p2sh-p2pk (used for BCH/BSV replay protection)
 * @param pubkey
 */
function createOutputScriptP2shP2pk(pubkey) {
    const p2pk = bitcoinjs.payments.p2pk({ pubkey });
    const p2sh = bitcoinjs.payments.p2sh({ redeem: p2pk });
    if (!p2sh.output || !p2pk.output) {
        throw new Error(`invalid state`);
    }
    return {
        scriptPubKey: p2sh.output,
        redeemScript: p2pk.output,
    };
}
exports.createOutputScriptP2shP2pk = createOutputScriptP2shP2pk;
/**
 * Return scripts for 2-of-3 multisig output
 * @param pubkeys - the key triple for multisig
 * @param scriptType
 * @returns {{redeemScript, witnessScript, scriptPubKey}}
 */
function createOutputScript2of3(pubkeys, scriptType) {
    if (!types_1.isTriple(pubkeys)) {
        throw new Error(`must provide pubkey triple`);
    }
    pubkeys.forEach((key) => {
        if (key.length !== 33) {
            throw new Error(`Unexpected key length ${key.length}. Must use compressed keys.`);
        }
    });
    if (scriptType === 'p2tr') {
        // p2tr addresses use a combination of 2 of 2 multisig scripts distinct from
        // the 2 of 3 multisig used for other script types
        return createTaprootScript2of3(pubkeys);
    }
    const script2of3 = bitcoinjs.payments.p2ms({ m: 2, pubkeys });
    assert(script2of3.output);
    let scriptPubKey;
    let redeemScript;
    let witnessScript;
    switch (scriptType) {
        case 'p2sh':
            redeemScript = script2of3;
            scriptPubKey = bitcoinjs.payments.p2sh({ redeem: script2of3 });
            break;
        case 'p2shP2wsh':
            witnessScript = script2of3;
            redeemScript = bitcoinjs.payments.p2wsh({ redeem: script2of3 });
            scriptPubKey = bitcoinjs.payments.p2sh({ redeem: redeemScript });
            break;
        case 'p2wsh':
            witnessScript = script2of3;
            scriptPubKey = bitcoinjs.payments.p2wsh({ redeem: witnessScript });
            break;
        default:
            throw new Error(`unknown multisig script type ${scriptType}`);
    }
    assert(scriptPubKey);
    assert(scriptPubKey.output);
    return {
        scriptPubKey: scriptPubKey.output,
        redeemScript: redeemScript === null || redeemScript === void 0 ? void 0 : redeemScript.output,
        witnessScript: witnessScript === null || witnessScript === void 0 ? void 0 : witnessScript.output,
    };
}
exports.createOutputScript2of3 = createOutputScript2of3;
/**
 * Creates and returns a taproot output script using the user and bitgo keys for the aggregate
 * public key and a taptree containing a user+bitgo 2-of-2 script at the first depth level of the
 * tree and user+backup and bitgo+backup 2-of-2 scripts one level deeper.
 * @param pubkeys - a pubkey array containing the user key, backup key, and bitgo key in that order
 * @returns {{scriptPubKey}}
 */
function createTaprootScript2of3([userKey, backupKey, bitGoKey]) {
    const userBitGoScript = bitcoinjs.script.compile([userKey, bitcoin_ops_1.OP_CHECKSIGVERIFY, bitGoKey, bitcoin_ops_1.OP_CHECKSIG]);
    const userBackupScript = bitcoinjs.script.compile([userKey, bitcoin_ops_1.OP_CHECKSIGVERIFY, backupKey, bitcoin_ops_1.OP_CHECKSIG]);
    const backupBitGoScript = bitcoinjs.script.compile([backupKey, bitcoin_ops_1.OP_CHECKSIGVERIFY, bitGoKey, bitcoin_ops_1.OP_CHECKSIG]);
    assert(userBitGoScript);
    assert(userBackupScript);
    assert(backupBitGoScript);
    const { output } = bitcoinjs.payments.p2tr({
        pubkeys: [userKey, bitGoKey],
        scripts: [userBitGoScript, userBackupScript, backupBitGoScript],
        weights: [2, 1, 1],
    });
    assert(output);
    // TODO: return control blocks once they are returned from payments.p2tr()
    return {
        scriptPubKey: output,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0U2NyaXB0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaXRnby9vdXRwdXRTY3JpcHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQywyQ0FBMkM7QUFDM0MsNkNBQTZEO0FBQzdELG1DQUEyQztBQUU5QixRQUFBLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBVSxDQUFDO0FBRy9FLFNBQWdCLGdCQUFnQixDQUFDLENBQVM7SUFDeEMsT0FBTyx1QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFtQixDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELDRDQUVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsMkJBQTJCLENBQUMsQ0FBaUI7SUFDM0QsUUFBUSxDQUFDLEVBQUU7UUFDVCxLQUFLLE1BQU07WUFDVCxPQUFPLFdBQVcsQ0FBQztRQUNyQixLQUFLLFdBQVc7WUFDZCxPQUFPLGlCQUFpQixDQUFDO1FBQzNCLEtBQUssT0FBTztZQUNWLE9BQU8sWUFBWSxDQUFDO1FBQ3RCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNuRDtBQUNILENBQUM7QUFYRCxrRUFXQztBQVVEOzs7R0FHRztBQUNILFNBQWdCLDBCQUEwQixDQUFDLE1BQWM7SUFDdkQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFB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TyxFQUFFLCtCQUFpQixFQUFFLFNBQVMsRUFBRSx5QkFBVyxDQUFDLENBQUMsQ0FBQztJQUN4RyxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLCtCQUFpQixFQUFFLFFBQVEsRUFBRSx5QkFBVyxDQUFDLENBQUMsQ0FBQztJQUUxRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDekIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFMUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7UUFDNUIsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDO1FBQy9ELE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ25CLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVmLDBFQUEwRTtJQUMxRSxPQUFPO1FBQ0wsWUFBWSxFQUFFLE1BQU07S0FDckIsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIGJpdGNvaW5qcyBmcm9tICdiaXRjb2luanMtbGliJztcbmltcG9ydCB7IE9QX0NIRUNLU0lHLCBPUF9DSEVDS1NJR1ZFUklGWSB9IGZyb20gJ2JpdGNvaW4tb3BzJztcbmltcG9ydCB7IGlzVHJpcGxlLCBUcmlwbGUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IHNjcmlwdFR5cGVzMk9mMyA9IFsncDJzaCcsICdwMnNoUDJ3c2gnLCAncDJ3c2gnLCAncDJ0ciddIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgU2NyaXB0VHlwZTJPZjMgPSB0eXBlb2Ygc2NyaXB0VHlwZXMyT2YzW251bWJlcl07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NjcmlwdFR5cGUyT2YzKHQ6IHN0cmluZyk6IHQgaXMgU2NyaXB0VHlwZTJPZjMge1xuICByZXR1cm4gc2NyaXB0VHlwZXMyT2YzLmluY2x1ZGVzKHQgYXMgU2NyaXB0VHlwZTJPZjMpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB0XG4gKiBAcmV0dXJuIHN0cmluZyBwcmV2T3V0IGFzIGRlZmluZWQgaW4gUFJFVk9VVF9UWVBFUyAoYml0Y29pbmpzLWxpYi8uLi4vdHJhbnNhY3Rpb25fYnVpbGRlci5qcylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjcmlwdFR5cGUyT2YzQXNQcmV2T3V0VHlwZSh0OiBTY3JpcHRUeXBlMk9mMyk6IHN0cmluZyB7XG4gIHN3aXRjaCAodCkge1xuICAgIGNhc2UgJ3Ayc2gnOlxuICAgICAgcmV0dXJuICdwMnNoLXAybXMnO1xuICAgIGNhc2UgJ3Ayc2hQMndzaCc6XG4gICAgICByZXR1cm4gJ3Ayc2gtcDJ3c2gtcDJtcyc7XG4gICAgY2FzZSAncDJ3c2gnOlxuICAgICAgcmV0dXJuICdwMndzaC1wMm1zJztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBzY3JpcHQgdHlwZSAke3R9YCk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgU3BlbmRhYmxlU2NyaXB0ID0ge1xuICBzY3JpcHRQdWJLZXk6IEJ1ZmZlcjtcbiAgcmVkZWVtU2NyaXB0PzogQnVmZmVyO1xuICB3aXRuZXNzU2NyaXB0PzogQnVmZmVyO1xuICAvKiogQSB0cmlwbGUgb2YgY29udHJvbCBibG9ja3MgZm9yIHRoZSB1c2VyK2JpdGdvLCB1c2VyK2JhY2t1cCwgYW5kIGJhY2t1cCtiaXRnbyBzY3JpcHRzIGluIHRoYXQgb3JkZXIuICovXG4gIGNvbnRyb2xCbG9ja3M/OiBbdXNlckJpdEdvU2NyaXB0OiBCdWZmZXIsIHVzZXJCYWNrdXBTY3JpcHQ6IEJ1ZmZlciwgYmFja3VwQml0R29TY3JpcHQ6IEJ1ZmZlcl07XG59O1xuXG4vKipcbiAqIFJldHVybiBzY3JpcHRzIGZvciBwMnNoLXAycGsgKHVzZWQgZm9yIEJDSC9CU1YgcmVwbGF5IHByb3RlY3Rpb24pXG4gKiBAcGFyYW0gcHVia2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPdXRwdXRTY3JpcHRQMnNoUDJwayhwdWJrZXk6IEJ1ZmZlcik6IFNwZW5kYWJsZVNjcmlwdCB7XG4gIGNvbnN0IHAycGsgPSBiaXRjb2luanMucGF5bWVudHMucDJwayh7IHB1YmtleSB9KTtcbiAgY29uc3QgcDJzaCA9IGJpdGNvaW5qcy5wYXltZW50cy5wMnNoKHsgcmVkZWVtOiBwMnBrIH0pO1xuICBpZiAoIXAyc2gub3V0cHV0IHx8ICFwMnBrLm91dHB1dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBzdGF0ZWApO1xuICB9XG4gIHJldHVybiB7XG4gICAgc2NyaXB0UHViS2V5OiBwMnNoLm91dHB1dCxcbiAgICByZWRlZW1TY3JpcHQ6IHAycGsub3V0cHV0LFxuICB9O1xufVxuXG4vKipcbiAqIFJldHVybiBzY3JpcHRzIGZvciAyLW9mLTMgbXVsdGlzaWcgb3V0cHV0XG4gKiBAcGFyYW0gcHVia2V5cyAtIHRoZSBrZXkgdHJpcGxlIGZvciBtdWx0aXNpZ1xuICogQHBhcmFtIHNjcmlwdFR5cGVcbiAqIEByZXR1cm5zIHt7cmVkZWVtU2NyaXB0LCB3aXRuZXNzU2NyaXB0LCBzY3JpcHRQdWJLZXl9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3V0cHV0U2NyaXB0Mm9mMyhwdWJrZXlzOiBCdWZmZXJbXSwgc2NyaXB0VHlwZTogU2NyaXB0VHlwZTJPZjMpOiBTcGVuZGFibGVTY3JpcHQge1xuICBpZiAoIWlzVHJpcGxlKHB1YmtleXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBtdXN0IHByb3ZpZGUgcHVia2V5IHRyaXBsZWApO1xuICB9XG5cbiAgcHVia2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoa2V5Lmxlbmd0aCAhPT0gMzMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBrZXkgbGVuZ3RoICR7a2V5Lmxlbmd0aH0uIE11c3QgdXNlIGNvbXByZXNzZWQga2V5cy5gKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChzY3JpcHRUeXBlID09PSAncDJ0cicpIHtcbiAgICAvLyBwMnRyIGFkZHJlc3NlcyB1c2UgYSBjb21iaW5hdGlvbiBvZiAyIG9mIDIgbXVsdGlzaWcgc2NyaXB0cyBkaXN0aW5jdCBmcm9tXG4gICAgLy8gdGhlIDIgb2YgMyBtdWx0aXNpZyB1c2VkIGZvciBvdGhlciBzY3JpcHQgdHlwZXNcbiAgICByZXR1cm4gY3JlYXRlVGFwcm9vdFNjcmlwdDJvZjMocHVia2V5cyk7XG4gIH1cblxuICBjb25zdCBzY3JpcHQyb2YzID0gYml0Y29pbmpzLnBheW1lbnRzLnAybXMoeyBtOiAyLCBwdWJrZXlzIH0pO1xuICBhc3NlcnQoc2NyaXB0Mm9mMy5vdXRwdXQpO1xuXG4gIGxldCBzY3JpcHRQdWJLZXk6IGJpdGNvaW5qcy5QYXltZW50O1xuICBsZXQgcmVkZWVtU2NyaXB0OiBiaXRjb2luanMuUGF5bWVudCB8IHVuZGVmaW5lZDtcbiAgbGV0IHdpdG5lc3NTY3JpcHQ6IGJpdGNvaW5qcy5QYXltZW50IHwgdW5kZWZpbmVkO1xuICBzd2l0Y2ggKHNjcmlwdFR5cGUpIHtcbiAgICBjYXNlICdwMnNoJzpcbiAgICAgIHJlZGVlbVNjcmlwdCA9IHNjcmlwdDJvZjM7XG4gICAgICBzY3JpcHRQdWJLZXkgPSBiaXRjb2luanMucGF5bWVudHMucDJzaCh7IHJlZGVlbTogc2NyaXB0Mm9mMyB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Ayc2hQMndzaCc6XG4gICAgICB3aXRuZXNzU2NyaXB0ID0gc2NyaXB0Mm9mMztcbiAgICAgIHJlZGVlbVNjcmlwdCA9IGJpdGNvaW5qcy5wYXltZW50cy5wMndzaCh7IHJlZGVlbTogc2NyaXB0Mm9mMyB9KTtcbiAgICAgIHNjcmlwdFB1YktleSA9IGJpdGNvaW5qcy5wYXltZW50cy5wMnNoKHsgcmVkZWVtOiByZWRlZW1TY3JpcHQgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwMndzaCc6XG4gICAgICB3aXRuZXNzU2NyaXB0ID0gc2NyaXB0Mm9mMztcbiAgICAgIHNjcmlwdFB1YktleSA9IGJpdGNvaW5qcy5wYXltZW50cy5wMndzaCh7IHJlZGVlbTogd2l0bmVzc1NjcmlwdCB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gbXVsdGlzaWcgc2NyaXB0IHR5cGUgJHtzY3JpcHRUeXBlfWApO1xuICB9XG5cbiAgYXNzZXJ0KHNjcmlwdFB1YktleSk7XG4gIGFzc2VydChzY3JpcHRQdWJLZXkub3V0cHV0KTtcblxuICByZXR1cm4ge1xuICAgIHNjcmlwdFB1YktleTogc2NyaXB0UHViS2V5Lm91dHB1dCxcbiAgICByZWRlZW1TY3JpcHQ6IHJlZGVlbVNjcmlwdD8ub3V0cHV0LFxuICAgIHdpdG5lc3NTY3JpcHQ6IHdpdG5lc3NTY3JpcHQ/Lm91dHB1dCxcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgdGFwcm9vdCBvdXRwdXQgc2NyaXB0IHVzaW5nIHRoZSB1c2VyIGFuZCBiaXRnbyBrZXlzIGZvciB0aGUgYWdncmVnYXRlXG4gKiBwdWJsaWMga2V5IGFuZCBhIHRhcHRyZWUgY29udGFpbmluZyBhIHVzZXIrYml0Z28gMi1vZi0yIHNjcmlwdCBhdCB0aGUgZmlyc3QgZGVwdGggbGV2ZWwgb2YgdGhlXG4gKiB0cmVlIGFuZCB1c2VyK2JhY2t1cCBhbmQgYml0Z28rYmFja3VwIDItb2YtMiBzY3JpcHRzIG9uZSBsZXZlbCBkZWVwZXIuXG4gKiBAcGFyYW0gcHVia2V5cyAtIGEgcHVia2V5IGFycmF5IGNvbnRhaW5pbmcgdGhlIHVzZXIga2V5LCBiYWNrdXAga2V5LCBhbmQgYml0Z28ga2V5IGluIHRoYXQgb3JkZXJcbiAqIEByZXR1cm5zIHt7c2NyaXB0UHViS2V5fX1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGFwcm9vdFNjcmlwdDJvZjMoW3VzZXJLZXksIGJhY2t1cEtleSwgYml0R29LZXldOiBUcmlwbGU8QnVmZmVyPik6IFNwZW5kYWJsZVNjcmlwdCB7XG4gIGNvbnN0IHVzZXJCaXRHb1NjcmlwdCA9IGJpdGNvaW5qcy5zY3JpcHQuY29tcGlsZShbdXNlcktleSwgT1BfQ0hFQ0tTSUdWRVJJRlksIGJpdEdvS2V5LCBPUF9DSEVDS1NJR10pO1xuICBjb25zdCB1c2VyQmFja3VwU2NyaXB0ID0gYml0Y29pbmpzLnNjcmlwdC5jb21waWxlKFt1c2VyS2V5LCBPUF9DSEVDS1NJR1ZFUklGWSwgYmFja3VwS2V5LCBPUF9DSEVDS1NJR10pO1xuICBjb25zdCBiYWNrdXBCaXRHb1NjcmlwdCA9IGJpdGNvaW5qcy5zY3JpcHQuY29tcGlsZShbYmFja3VwS2V5LCBPUF9DSEVDS1NJR1ZFUklGWSwgYml0R29LZXksIE9QX0NIRUNLU0lHXSk7XG5cbiAgYXNzZXJ0KHVzZXJCaXRHb1NjcmlwdCk7XG4gIGFzc2VydCh1c2VyQmFja3VwU2NyaXB0KTtcbiAgYXNzZXJ0KGJhY2t1cEJpdEdvU2NyaXB0KTtcblxuICBjb25zdCB7IG91dHB1dCB9ID0gYml0Y29pbmpzLnBheW1lbnRzLnAydHIoe1xuICAgIHB1YmtleXM6IFt1c2VyS2V5LCBiaXRHb0tleV0sXG4gICAgc2NyaXB0czogW3VzZXJCaXRHb1NjcmlwdCwgdXNlckJhY2t1cFNjcmlwdCwgYmFja3VwQml0R29TY3JpcHRdLFxuICAgIHdlaWdodHM6IFsyLCAxLCAxXSxcbiAgfSk7XG5cbiAgYXNzZXJ0KG91dHB1dCk7XG5cbiAgLy8gVE9ETzogcmV0dXJuIGNvbnRyb2wgYmxvY2tzIG9uY2UgdGhleSBhcmUgcmV0dXJuZWQgZnJvbSBwYXltZW50cy5wMnRyKClcbiAgcmV0dXJuIHtcbiAgICBzY3JpcHRQdWJLZXk6IG91dHB1dCxcbiAgfTtcbn1cbiJdfQ==