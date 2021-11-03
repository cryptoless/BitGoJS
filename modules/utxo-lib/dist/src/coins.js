"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZEC = exports.LTC = exports.DASH = exports.BTG = exports.BTC = exports.BSV = exports.BCH = exports.isValidNetwork = exports.isZcash = exports.isLitecoin = exports.isDash = exports.isBitcoinSV = exports.isBitcoinGold = exports.isBitcoinCash = exports.isBitcoin = exports.getTestnet = exports.isSameCoin = exports.isTestnet = exports.isMainnet = exports.getMainnet = exports.getNetworkName = exports.getNetworkList = void 0;
const networks = require("./networks");
const networkTypes_1 = require("./networkTypes");
/**
 * @returns {Network[]} all known networks as array
 */
function getNetworkList() {
    return Object.values(networks);
}
exports.getNetworkList = getNetworkList;
/**
 * @param {Network} network
 * @returns {string} the name of the network. Returns undefined if network is not a value
 *                   of `networks`
 */
function getNetworkName(network) {
    return Object.keys(networks).find((n) => networks[n] === network);
}
exports.getNetworkName = getNetworkName;
/**
 * @param {Network} network
 * @returns {Object} the mainnet corresponding to a testnet
 */
function getMainnet(network, recurse = true) {
    switch (network) {
        case networks.bitcoin:
        case networks.testnet:
            return networks.bitcoin;
        case networks.bitcoincash:
        case networks.bitcoincashTestnet:
            return networks.bitcoincash;
        case networks.bitcoingold:
        case networks.bitcoingoldTestnet:
            return networks.bitcoingold;
        case networks.bitcoinsv:
        case networks.bitcoinsvTestnet:
            return networks.bitcoinsv;
        case networks.dash:
        case networks.dashTest:
            return networks.dash;
        case networks.litecoin:
        case networks.litecoinTest:
            return networks.litecoin;
        case networks.zcash:
        case networks.zcashTest:
            return networks.zcash;
    }
    if (recurse && network.forkChain)
        return getMainnet(network.forkChain, !recurse);
    throw new TypeError(`invalid network`);
}
exports.getMainnet = getMainnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is a mainnet
 */
function isMainnet(network) {
    return getMainnet(network) === network;
}
exports.isMainnet = isMainnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is a testnet
 */
function isTestnet(network) {
    return getMainnet(network) !== network;
}
exports.isTestnet = isTestnet;
/**
 *
 * @param {Network} network
 * @param {Network} otherNetwork
 * @returns {boolean} true iff both networks are for the same coin
 */
function isSameCoin(network, otherNetwork) {
    return getMainnet(network) === getMainnet(otherNetwork);
}
exports.isSameCoin = isSameCoin;
const mainnets = getNetworkList().filter(isMainnet);
const testnets = getNetworkList().filter(isTestnet);
/**
 * Map where keys are mainnet networks and values are testnet networks
 * @type {Map<Network, Network[]>}
 */
const mainnetTestnetPairs = new Map(mainnets.map((m) => [m, testnets.filter((t) => getMainnet(t) === m)]));
/**
 * @param {Network} network
 * @returns {Network|undefined} - The testnet corresponding to a mainnet.
 *                               Returns undefined if a network has no testnet.
 */
function getTestnet(network) {
    if (isTestnet(network)) {
        return network;
    }
    const testnets = mainnetTestnetPairs.get(network);
    if (testnets === undefined) {
        throw new Error(`invalid argument`);
    }
    if (testnets.length === 0) {
        return;
    }
    if (testnets.length === 1) {
        return testnets[0];
    }
    throw new Error(`more than one testnet for ${getNetworkName(network)}`);
}
exports.getTestnet = getTestnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network bitcoin or testnet
 */
function isBitcoin(network) {
    return getMainnet(network) === networks.bitcoin;
}
exports.isBitcoin = isBitcoin;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoincash or bitcoincashTestnet
 */
function isBitcoinCash(network) {
    return getMainnet(network) === networks.bitcoincash;
}
exports.isBitcoinCash = isBitcoinCash;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoingold
 */
function isBitcoinGold(network) {
    return getMainnet(network) === networks.bitcoingold;
}
exports.isBitcoinGold = isBitcoinGold;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoinsv or bitcoinsvTestnet
 */
function isBitcoinSV(network) {
    return getMainnet(network) === networks.bitcoinsv;
}
exports.isBitcoinSV = isBitcoinSV;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is dash or dashTest
 */
function isDash(network) {
    return getMainnet(network) === networks.dash;
}
exports.isDash = isDash;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is litecoin or litecoinTest
 */
function isLitecoin(network) {
    return getMainnet(network) === networks.litecoin;
}
exports.isLitecoin = isLitecoin;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is zcash or zcashTest
 */
function isZcash(network) {
    return getMainnet(network) === networks.zcash;
}
exports.isZcash = isZcash;
/**
 * @param {unknown} network
 * @returns {boolean} returns true iff network is any of the network stated in the argument
 */
function isValidNetwork(network) {
    return getNetworkList().includes(network);
}
exports.isValidNetwork = isValidNetwork;
/** @deprecated */
exports.BCH = networkTypes_1.coins.BCH;
/** @deprecated */
exports.BSV = networkTypes_1.coins.BSV;
/** @deprecated */
exports.BTC = networkTypes_1.coins.BTC;
/** @deprecated */
exports.BTG = networkTypes_1.coins.BTG;
/** @deprecated */
exports.DASH = networkTypes_1.coins.DASH;
/** @deprecated */
exports.LTC = networkTypes_1.coins.LTC;
/** @deprecated */
exports.ZEC = networkTypes_1.coins.ZEC;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29pbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29pbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXVDO0FBQ3ZDLGlEQUE2RDtBQUU3RDs7R0FFRztBQUNILFNBQWdCLGNBQWM7SUFDNUIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFGRCx3Q0FFQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixjQUFjLENBQUMsT0FBZ0I7SUFDN0MsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQWdCLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQztBQUNuRixDQUFDO0FBRkQsd0NBRUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixVQUFVLENBQUMsT0FBMEMsRUFBRSxPQUFPLEdBQUcsSUFBSTtJQUNuRixRQUFRLE9BQU8sRUFBRTtRQUNmLEtBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUN0QixLQUFLLFFBQVEsQ0FBQyxPQUFPO1lBQ25CLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUUxQixLQUFLLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDMUIsS0FBSyxRQUFRLENBQUMsa0JBQWtCO1lBQzlCLE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUU5QixLQUFLLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDMUIsS0FBSyxRQUFRLENBQUMsa0JBQWtCO1lBQzlCLE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUU5QixLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDeEIsS0FBSyxRQUFRLENBQUMsZ0JBQWdCO1lBQzVCLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUU1QixLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDbkIsS0FBSyxRQUFRLENBQUMs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QUksR0FBRyxvQkFBSyxDQUFDLElBQUksQ0FBQztBQUMvQixrQkFBa0I7QUFDTCxRQUFBLEdBQUcsR0FBRyxvQkFBSyxDQUFDLEdBQUcsQ0FBQztBQUM3QixrQkFBa0I7QUFDTCxRQUFBLEdBQUcsR0FBRyxvQkFBSyxDQUFDLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG5ldHdvcmtzIGZyb20gJy4vbmV0d29ya3MnO1xuaW1wb3J0IHsgY29pbnMsIE5ldHdvcmssIE5ldHdvcmtOYW1lIH0gZnJvbSAnLi9uZXR3b3JrVHlwZXMnO1xuXG4vKipcbiAqIEByZXR1cm5zIHtOZXR3b3JrW119IGFsbCBrbm93biBuZXR3b3JrcyBhcyBhcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV0d29ya0xpc3QoKTogTmV0d29ya1tdIHtcbiAgcmV0dXJuIE9iamVjdC52YWx1ZXMobmV0d29ya3MpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHJldHVybnMge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIG5ldHdvcmsuIFJldHVybnMgdW5kZWZpbmVkIGlmIG5ldHdvcmsgaXMgbm90IGEgdmFsdWVcbiAqICAgICAgICAgICAgICAgICAgIG9mIGBuZXR3b3Jrc2BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ldHdvcmtOYW1lKG5ldHdvcms6IE5ldHdvcmspOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gT2JqZWN0LmtleXMobmV0d29ya3MpLmZpbmQoKG4pID0+IG5ldHdvcmtzW24gYXMgTmV0d29ya05hbWVdID09PSBuZXR3b3JrKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge05ldHdvcmt9IG5ldHdvcmtcbiAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBtYWlubmV0IGNvcnJlc3BvbmRpbmcgdG8gYSB0ZXN0bmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYWlubmV0KG5ldHdvcms6IE5ldHdvcmsgJiB7IGZvcmtDaGFpbj86IE5ldHdvcmsgfSwgcmVjdXJzZSA9IHRydWUpOiBOZXR3b3JrIHtcbiAgc3dpdGNoIChuZXR3b3JrKSB7XG4gICAgY2FzZSBuZXR3b3Jrcy5iaXRjb2luOlxuICAgIGNhc2UgbmV0d29ya3MudGVzdG5ldDpcbiAgICAgIHJldHVybiBuZXR3b3Jrcy5iaXRjb2luO1xuXG4gICAgY2FzZSBuZXR3b3Jrcy5iaXRjb2luY2FzaDpcbiAgICBjYXNlIG5ldHdvcmtzLmJpdGNvaW5jYXNoVGVzdG5ldDpcbiAgICAgIHJldHVybiBuZXR3b3Jrcy5iaXRjb2luY2FzaDtcblxuICAgIGNhc2UgbmV0d29ya3MuYml0Y29pbmdvbGQ6XG4gICAgY2FzZSBuZXR3b3Jrcy5iaXRjb2luZ29sZFRlc3RuZXQ6XG4gICAgICByZXR1cm4gbmV0d29ya3MuYml0Y29pbmdvbGQ7XG5cbiAgICBjYXNlIG5ldHdvcmtzLmJpdGNvaW5zdjpcbiAgICBjYXNlIG5ldHdvcmtzLmJpdGNvaW5zdlRlc3RuZXQ6XG4gICAgICByZXR1cm4gbmV0d29ya3MuYml0Y29pbnN2O1xuXG4gICAgY2FzZSBuZXR3b3Jrcy5kYXNoOlxuICAgIGNhc2UgbmV0d29ya3MuZGFzaFRlc3Q6XG4gICAgICByZXR1cm4gbmV0d29ya3MuZGFzaDtcblxuICAgIGNhc2UgbmV0d29ya3MubGl0ZWNvaW46XG4gICAgY2FzZSBuZXR3b3Jrcy5saXRlY29pblRlc3Q6XG4gICAgICByZXR1cm4gbmV0d29ya3MubGl0ZWNvaW47XG5cbiAgICBjYXNlIG5ldHdvcmtzLnpjYXNoOlxuICAgIGNhc2UgbmV0d29ya3MuemNhc2hUZXN0OlxuICAgICAgcmV0dXJuIG5ldHdvcmtzLnpjYXNoO1xuICB9XG4gIGlmIChyZWN1cnNlICYmIG5ldHdvcmsuZm9ya0NoYWluKSByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrLmZvcmtDaGFpbiwgIXJlY3Vyc2UpO1xuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgbmV0d29ya2ApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWZmIG5ldHdvcmsgaXMgYSBtYWlubmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01haW5uZXQobmV0d29yazogTmV0d29yayk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrKSA9PT0gbmV0d29yaztcbn1cblxuLyoqXG4gKiBAcGFyYW0ge05ldHdvcmt9IG5ldHdvcmtcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmZiBuZXR3b3JrIGlzIGEgdGVzdG5ldFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUZXN0bmV0KG5ldHdvcms6IE5ldHdvcmspOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldE1haW5uZXQobmV0d29yaykgIT09IG5ldHdvcms7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHBhcmFtIHtOZXR3b3JrfSBvdGhlck5ldHdvcmtcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmZiBib3RoIG5ldHdvcmtzIGFyZSBmb3IgdGhlIHNhbWUgY29pblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lQ29pbihuZXR3b3JrOiBOZXR3b3JrLCBvdGhlck5ldHdvcms6IE5ldHdvcmspOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldE1haW5uZXQobmV0d29yaykgPT09IGdldE1haW5uZXQob3RoZXJOZXR3b3JrKTtcbn1cblxuY29uc3QgbWFpbm5ldHMgPSBnZXROZXR3b3JrTGlzdCgpLmZpbHRlcihpc01haW5uZXQpO1xuY29uc3QgdGVzdG5ldHMgPSBnZXROZXR3b3JrTGlzdCgpLmZpbHRlcihpc1Rlc3RuZXQpO1xuXG4vKipcbiAqIE1hcCB3aGVyZSBrZXlzIGFyZSBtYWlubmV0IG5ldHdvcmtzIGFuZCB2YWx1ZXMgYXJlIHRlc3RuZXQgbmV0d29ya3NcbiAqIEB0eXBlIHtNYXA8TmV0d29yaywgTmV0d29ya1tdPn1cbiAqL1xuY29uc3QgbWFpbm5ldFRlc3RuZXRQYWlycyA9IG5ldyBNYXAobWFpbm5ldHMubWFwKChtKSA9PiBbbSwgdGVzdG5ldHMuZmlsdGVyKCh0KSA9PiBnZXRNYWlubmV0KHQpID09PSBtKV0pKTtcblxuLyoqXG4gKiBAcGFyYW0ge05ldHdvcmt9IG5ldHdvcmtcbiAqIEByZXR1cm5zIHtOZXR3b3JrfHVuZGVmaW5lZH0gLSBUaGUgdGVzdG5ldCBjb3JyZXNwb25kaW5nIHRvIGEgbWFpbm5ldC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldHVybnMgdW5kZWZpbmVkIGlmIGEgbmV0d29yayBoYXMgbm8gdGVzdG5ldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlc3RuZXQobmV0d29yazogTmV0d29yayk6IE5ldHdvcmsgfCB1bmRlZmluZWQge1xuICBpZiAoaXNUZXN0bmV0KG5ldHdvcmspKSB7XG4gICAgcmV0dXJuIG5ldHdvcms7XG4gIH1cbiAgY29uc3QgdGVzdG5ldHMgPSBtYWlubmV0VGVzdG5ldFBhaXJzLmdldChuZXR3b3JrKTtcbiAgaWYgKHRlc3RuZXRzID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgYXJndW1lbnRgKTtcbiAgfVxuICBpZiAodGVzdG5ldHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0ZXN0bmV0cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gdGVzdG5ldHNbMF07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBtb3JlIHRoYW4gb25lIHRlc3RuZXQgZm9yICR7Z2V0TmV0d29ya05hbWUobmV0d29yayl9YCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtOZXR3b3JrfSBuZXR3b3JrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZmYgbmV0d29yayBiaXRjb2luIG9yIHRlc3RuZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQml0Y29pbihuZXR3b3JrOiBOZXR3b3JrKTogYm9vbGVhbiB7XG4gIHJldHVybiBnZXRNYWlubmV0KG5ldHdvcmspID09PSBuZXR3b3Jrcy5iaXRjb2luO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWZmIG5ldHdvcmsgaXMgYml0Y29pbmNhc2ggb3IgYml0Y29pbmNhc2hUZXN0bmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0JpdGNvaW5DYXNoKG5ldHdvcms6IE5ldHdvcmspOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldE1haW5uZXQobmV0d29yaykgPT09IG5ldHdvcmtzLmJpdGNvaW5jYXNoO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWZmIG5ldHdvcmsgaXMgYml0Y29pbmdvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQml0Y29pbkdvbGQobmV0d29yazogTmV0d29yayk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrKSA9PT0gbmV0d29ya3MuYml0Y29pbmdvbGQ7XG59XG5cbi8qKlxuICogQHBhcmFtIHtOZXR3b3JrfSBuZXR3b3JrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZmYgbmV0d29yayBpcyBiaXRjb2luc3Ygb3IgYml0Y29pbnN2VGVzdG5ldFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaXRjb2luU1YobmV0d29yazogTmV0d29yayk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrKSA9PT0gbmV0d29ya3MuYml0Y29pbnN2O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWZmIG5ldHdvcmsgaXMgZGFzaCBvciBkYXNoVGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXNoKG5ldHdvcms6IE5ldHdvcmspOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldE1haW5uZXQobmV0d29yaykgPT09IG5ldHdvcmtzLmRhc2g7XG59XG5cbi8qKlxuICogQHBhcmFtIHtOZXR3b3JrfSBuZXR3b3JrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZmYgbmV0d29yayBpcyBsaXRlY29pbiBvciBsaXRlY29pblRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGl0ZWNvaW4obmV0d29yazogTmV0d29yayk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrKSA9PT0gbmV0d29ya3MubGl0ZWNvaW47XG59XG5cbi8qKlxuICogQHBhcmFtIHtOZXR3b3JrfSBuZXR3b3JrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZmYgbmV0d29yayBpcyB6Y2FzaCBvciB6Y2FzaFRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzWmNhc2gobmV0d29yazogTmV0d29yayk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0TWFpbm5ldChuZXR3b3JrKSA9PT0gbmV0d29ya3MuemNhc2g7XG59XG5cbi8qKlxuICogQHBhcmFtIHt1bmtub3dufSBuZXR3b3JrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmV0dXJucyB0cnVlIGlmZiBuZXR3b3JrIGlzIGFueSBvZiB0aGUgbmV0d29yayBzdGF0ZWQgaW4gdGhlIGFyZ3VtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkTmV0d29yayhuZXR3b3JrOiB1bmtub3duKTogbmV0d29yayBpcyBOZXR3b3JrIHtcbiAgcmV0dXJuIGdldE5ldHdvcmtMaXN0KCkuaW5jbHVkZXMobmV0d29yayBhcyBOZXR3b3JrKTtcbn1cblxuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgY29uc3QgQkNIID0gY29pbnMuQkNIO1xuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgY29uc3QgQlNWID0gY29pbnMuQlNWO1xuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgY29uc3QgQlRDID0gY29pbnMuQlRDO1xuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgY29uc3QgQlRHID0gY29pbnMuQlRHO1xuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgY29uc3QgREFTSCA9IGNvaW5zLkRBU0g7XG4vKiogQGRlcHJlY2F0ZWQgKi9cbmV4cG9ydCBjb25zdCBMVEMgPSBjb2lucy5MVEM7XG4vKiogQGRlcHJlY2F0ZWQgKi9cbmV4cG9ydCBjb25zdCBaRUMgPSBjb2lucy5aRUM7XG4iXX0=