"use strict";
/*

The values for the various fork coins can be found in these files:

property       filename                  varname                           notes
------------------------------------------------------------------------------------------------------------------------
messagePrefix  src/validation.cpp        strMessageMagic                   Format `${CoinName} Signed Message`
bech32_hrp     src/chainparams.cpp       bech32_hrp                        Only for some networks
bip32.public   src/chainparams.cpp       base58Prefixes[EXT_PUBLIC_KEY]    Mainnets have same value, testnets have same value
bip32.private  src/chainparams.cpp       base58Prefixes[EXT_SECRET_KEY]    Mainnets have same value, testnets have same value
pubKeyHash     src/chainparams.cpp       base58Prefixes[PUBKEY_ADDRESS]
scriptHash     src/chainparams.cpp       base58Prefixes[SCRIPT_ADDRESS]
wif            src/chainparams.cpp       base58Prefixes[SECRET_KEY]        Testnets have same value
forkId         src/script/interpreter.h  FORKID_*

*/
const networkTypes_1 = require("./networkTypes");
function getDefaultBip32Mainnet() {
    return {
        // base58 'xpub'
        public: 0x0488b21e,
        // base58 'xprv'
        private: 0x0488ade4,
    };
}
function getDefaultBip32Testnet() {
    return {
        // base58 'tpub'
        public: 0x043587cf,
        // base58 'tprv'
        private: 0x04358394,
    };
}
const networks = {
    // https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp
    // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp
    bitcoin: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
        coin: networkTypes_1.coins.BTC,
    },
    testnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
        coin: networkTypes_1.coins.BTC,
    },
    // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/src/validation.cpp
    // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/src/chainparams.cpp
    // https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
    bitcoincash: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
        coin: networkTypes_1.coins.BCH,
        forkId: 0x00,
        cashAddr: {
            prefix: 'bitcoincash',
            pubKeyHash: 0x00,
            scriptHash: 0x08,
        },
    },
    bitcoincashTestnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
        coin: networkTypes_1.coins.BCH,
        cashAddr: {
            prefix: 'bchtest',
            pubKeyHash: 0x00,
            scriptHash: 0x08,
        },
    },
    // https://github.com/BTCGPU/BTCGPU/blob/master/src/validation.cpp
    // https://github.com/BTCGPU/BTCGPU/blob/master/src/chainparams.cpp
    // https://github.com/BTCGPU/BTCGPU/blob/master/src/script/interpreter.h
    bitcoingold: {
        messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
        bech32: 'btg',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x26,
        scriptHash: 0x17,
        wif: 0x80,
        forkId: 79,
        coin: networkTypes_1.coins.BTG,
    },
    bitcoingoldTestnet: {
        messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
        bech32: 'tbtg',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 111,
        scriptHash: 196,
        wif: 0xef,
        forkId: 79,
        coin: networkTypes_1.coins.BTG,
    },
    // https://github.com/bitcoin-sv/bitcoin-sv/blob/master/src/validation.cpp
    // https://github.com/bitcoin-sv/bitcoin-sv/blob/master/src/chainparams.cpp
    bitcoinsv: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
        coin: networkTypes_1.coins.BSV,
        forkId: 0x00,
    },
    bitcoinsvTestnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
        coin: networkTypes_1.coins.BSV,
        forkId: 0x00,
    },
    // https://github.com/dashpay/dash/blob/master/src/validation.cpp
    // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp
    dash: {
        messagePrefix: '\x19DarkCoin Signed Message:\n',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x4c,
        scriptHash: 0x10,
        wif: 0xcc,
        coin: networkTypes_1.coins.DASH,
    },
    dashTest: {
        messagePrefix: '\x19DarkCoin Signed Message:\n',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x8c,
        scriptHash: 0x13,
        wif: 0xef,
        coin: networkTypes_1.coins.DASH,
    },
    // https://github.com/litecoin-project/litecoin/blob/master/src/validation.cpp
    // https://github.com/litecoin-project/litecoin/blob/master/src/chainparams.cpp
    litecoin: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bech32: 'ltc',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0xb0,
        coin: networkTypes_1.coins.LTC,
    },
    litecoinTest: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bech32: 'tltc',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x6f,
        scriptHash: 0x3a,
        wif: 0xef,
        coin: networkTypes_1.coins.LTC,
    },
    // https://github.com/zcash/zcash/blob/master/src/validation.cpp
    // https://github.com/zcash/zcash/blob/master/src/chainparams.cpp
    zcash: {
        messagePrefix: '\x18ZCash Signed Message:\n',
        bip32: getDefaultBip32Mainnet(),
        pubKeyHash: 0x1cb8,
        scriptHash: 0x1cbd,
        wif: 0x80,
        // This parameter was introduced in version 3 to allow soft forks, for version 1 and 2 transactions we add a
        // dummy value.
        consensusBranchId: {
            1: 0x00,
            2: 0x00,
            3: 0x5ba81b19,
            // 4: 0x76b809bb (old Sapling branch id). Blossom branch id becomes effective after block 653600
            // 4: 0x2bb40e60
            // 4: 0xf5b9230b (Heartwood branch id, see https://zips.z.cash/zip-0250)
            4: 0xe9ff75a6, // (Canopy branch id, see https://zips.z.cash/zip-0251)
        },
        coin: networkTypes_1.coins.ZEC,
    },
    zcashTest: {
        messagePrefix: '\x18ZCash Signed Message:\n',
        bip32: getDefaultBip32Testnet(),
        pubKeyHash: 0x1d25,
        scriptHash: 0x1cba,
        wif: 0xef,
        consensusBranchId: {
            1: 0x00,
            2: 0x00,
            3: 0x5ba81b19,
            // 4: 0x76b809bb (old Sapling branch id)
            // 4: 0x2bb40e60
            // 4: 0xf5b9230b (Heartwood branch id, see https://zips.z.cash/zip-0250)
            4: 0xe9ff75a6, // (Canopy branch id, see https://zips.z.cash/zip-0251)
        },
        coin: networkTypes_1.coins.ZEC,
    },
};
module.exports = networks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmV0d29ya3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUFlRTtBQUVGLGlEQUErRjtBQUUvRixTQUFTLHNCQUFzQjtJQUM3QixPQUFPO1FBQ0wsZ0JBQWdCO1FBQ2hCLE1BQU0sRUFBRSxVQUFVO1FBQ2xCLGdCQUFnQjtRQUNoQixPQUFPLEVBQUUsVUFBVTtLQUNwQixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsc0JBQXNCO0lBQzdCLE9BQU87UUFDTCxnQkFBZ0I7UUFDaEIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsZ0JBQWdCO1FBQ2hCLE9BQU8sRUFBRSxVQUFVO0tBQ3BCLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxRQUFRLEdBRXVEO0lBQ25FLG9FQUFvRTtJQUNwRSxxRUFBcUU7SUFDckUsT0FBTyxFQUFFO1FBQ1AsYUFBYSxFQUFFLCtCQUErQjtRQUM5QyxNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxzQkFBc0IsRUFBRTtRQUMvQixVQUFVLEVBQUUsSUFBSTtRQUNoQixVQUFVLEVBQUUsSUFBSTtRQUNoQixHQUFHLEVBQUUsSUFBSTtRQUNULElBQUksRUFBRSxvQkFBSyxDQUFDLEdBQUc7S0FDaEI7SUFDRCxPQUFPLEVBQUU7UUFDUCxhQUFhLEVBQUUsK0JBQStCO1FBQzlDLE1BQU0sRUFBRSxJQUFJO1FBQ1osS0FBSyxFQUFFLHNCQUFzQixFQUFFO1FBQy9CLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLEdBQUcsRUFBRSxJQUFJO1FBQ1QsSUFBSSxFQUFFLG9CQUFLLENBQUMsR0FBRztLQUNoQjtJQUVELDRFQUE0RTtJQUM1RSw2RUFBNkU7SUFDN0UsaUZBQWlGO0lBQ2pGLFdBQVcsRUFBRTtRQUNYLGFBQWEsRUFBRSwrQkFBK0I7UUFDOUMsS0FBSyxFQUFFLHNCQUFzQixFQUFF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Q3ZFO1FBQ0QsSUFBSSxFQUFFLG9CQUFLLENBQUMsR0FBRztLQUNoQjtDQUNGLENBQUM7QUFFRixpQkFBUyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXG5UaGUgdmFsdWVzIGZvciB0aGUgdmFyaW91cyBmb3JrIGNvaW5zIGNhbiBiZSBmb3VuZCBpbiB0aGVzZSBmaWxlczpcblxucHJvcGVydHkgICAgICAgZmlsZW5hbWUgICAgICAgICAgICAgICAgICB2YXJuYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXNcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubWVzc2FnZVByZWZpeCAgc3JjL3ZhbGlkYXRpb24uY3BwICAgICAgICBzdHJNZXNzYWdlTWFnaWMgICAgICAgICAgICAgICAgICAgRm9ybWF0IGAke0NvaW5OYW1lfSBTaWduZWQgTWVzc2FnZWBcbmJlY2gzMl9ocnAgICAgIHNyYy9jaGFpbnBhcmFtcy5jcHAgICAgICAgYmVjaDMyX2hycCAgICAgICAgICAgICAgICAgICAgICAgIE9ubHkgZm9yIHNvbWUgbmV0d29ya3NcbmJpcDMyLnB1YmxpYyAgIHNyYy9jaGFpbnBhcmFtcy5jcHAgICAgICAgYmFzZTU4UHJlZml4ZXNbRVhUX1BVQkxJQ19LRVldICAgIE1haW5uZXRzIGhhdmUgc2FtZSB2YWx1ZSwgdGVzdG5ldHMgaGF2ZSBzYW1lIHZhbHVlXG5iaXAzMi5wcml2YXRlICBzcmMvY2hhaW5wYXJhbXMuY3BwICAgICAgIGJhc2U1OFByZWZpeGVzW0VYVF9TRUNSRVRfS0VZXSAgICBNYWlubmV0cyBoYXZlIHNhbWUgdmFsdWUsIHRlc3RuZXRzIGhhdmUgc2FtZSB2YWx1ZVxucHViS2V5SGFzaCAgICAgc3JjL2NoYWlucGFyYW1zLmNwcCAgICAgICBiYXNlNThQcmVmaXhlc1tQVUJLRVlfQUREUkVTU11cbnNjcmlwdEhhc2ggICAgIHNyYy9jaGFpbnBhcmFtcy5jcHAgICAgICAgYmFzZTU4UHJlZml4ZXNbU0NSSVBUX0FERFJFU1NdXG53aWYgICAgICAgICAgICBzcmMvY2hhaW5wYXJhbXMuY3BwICAgICAgIGJhc2U1OFByZWZpeGVzW1NFQ1JFVF9LRVldICAgICAgICBUZXN0bmV0cyBoYXZlIHNhbWUgdmFsdWVcbmZvcmtJZCAgICAgICAgIHNyYy9zY3JpcHQvaW50ZXJwcmV0ZXIuaCAgRk9SS0lEXypcblxuKi9cblxuaW1wb3J0IHsgY29pbnMsIEJpdGNvaW5DYXNoTmV0d29yaywgTmV0d29yaywgTmV0d29ya05hbWUsIFpjYXNoTmV0d29yayB9IGZyb20gJy4vbmV0d29ya1R5cGVzJztcblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEJpcDMyTWFpbm5ldCgpOiBOZXR3b3JrWydiaXAzMiddIHtcbiAgcmV0dXJuIHtcbiAgICAvLyBiYXNlNTggJ3hwdWInXG4gICAgcHVibGljOiAweDA0ODhiMjFlLFxuICAgIC8vIGJhc2U1OCAneHBydidcbiAgICBwcml2YXRlOiAweDA0ODhhZGU0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QmlwMzJUZXN0bmV0KCk6IE5ldHdvcmtbJ2JpcDMyJ10ge1xuICByZXR1cm4ge1xuICAgIC8vIGJhc2U1OCAndHB1YidcbiAgICBwdWJsaWM6IDB4MDQzNTg3Y2YsXG4gICAgLy8gYmFzZTU4ICd0cHJ2J1xuICAgIHByaXZhdGU6IDB4MDQzNTgzOTQsXG4gIH07XG59XG5cbmNvbnN0IG5ldHdvcmtzOiBSZWNvcmQ8TmV0d29ya05hbWUsIE5ldHdvcms+ICZcbiAgUmVjb3JkPCd6Y2FzaCcgfCAnemNhc2hUZXN0JywgWmNhc2hOZXR3b3JrPiAmXG4gIFJlY29yZDwnYml0Y29pbmNhc2gnIHwgJ2JpdGNvaW5jYXNoVGVzdG5ldCcsIEJpdGNvaW5DYXNoTmV0d29yaz4gPSB7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpdGNvaW4vYmxvYi9tYXN0ZXIvc3JjL3ZhbGlkYXRpb24uY3BwXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpdGNvaW4vYmxvYi9tYXN0ZXIvc3JjL2NoYWlucGFyYW1zLmNwcFxuICBiaXRjb2luOiB7XG4gICAgbWVzc2FnZVByZWZpeDogJ1xceDE4Qml0Y29pbiBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJlY2gzMjogJ2JjJyxcbiAgICBiaXAzMjogZ2V0RGVmYXVsdEJpcDMyTWFpbm5ldCgpLFxuICAgIHB1YktleUhhc2g6IDB4MDAsXG4gICAgc2NyaXB0SGFzaDogMHgwNSxcbiAgICB3aWY6IDB4ODAsXG4gICAgY29pbjogY29pbnMuQlRDLFxuICB9LFxuICB0ZXN0bmV0OiB7XG4gICAgbWVzc2FnZVByZWZpeDogJ1xceDE4Qml0Y29pbiBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJlY2gzMjogJ3RiJyxcbiAgICBiaXAzMjogZ2V0RGVmYXVsdEJpcDMyVGVzdG5ldCgpLFxuICAgIHB1YktleUhhc2g6IDB4NmYsXG4gICAgc2NyaXB0SGFzaDogMHhjNCxcbiAgICB3aWY6IDB4ZWYsXG4gICAgY29pbjogY29pbnMuQlRDLFxuICB9LFxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9CaXRjb2luLUFCQy9iaXRjb2luLWFiYy9ibG9iL21hc3Rlci9zcmMvdmFsaWRhdGlvbi5jcHBcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0JpdGNvaW4tQUJDL2JpdGNvaW4tYWJjL2Jsb2IvbWFzdGVyL3NyYy9jaGFpbnBhcmFtcy5jcHBcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2JpdGNvaW5jYXNob3JnL2JpdGNvaW5jYXNoLm9yZy9ibG9iL21hc3Rlci9zcGVjL2Nhc2hhZGRyLm1kXG4gIGJpdGNvaW5jYXNoOiB7XG4gICAgbWVzc2FnZVByZWZpeDogJ1xceDE4Qml0Y29pbiBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJpcDMyOiBnZXREZWZhdWx0QmlwMzJNYWlubmV0KCksXG4gICAgcHViS2V5SGFzaDogMHgwMCxcbiAgICBzY3JpcHRIYXNoOiAweDA1LFxuICAgIHdpZjogMHg4MCxcbiAgICBjb2luOiBjb2lucy5CQ0gsXG4gICAgZm9ya0lkOiAweDAwLFxuICAgIGNhc2hBZGRyOiB7XG4gICAgICBwcmVmaXg6ICdiaXRjb2luY2FzaCcsXG4gICAgICBwdWJLZXlIYXNoOiAweDAwLFxuICAgICAgc2NyaXB0SGFzaDogMHgwOCxcbiAgICB9LFxuICB9LFxuICBiaXRjb2luY2FzaFRlc3RuZXQ6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MThCaXRjb2luIFNpZ25lZCBNZXNzYWdlOlxcbicsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMlRlc3RuZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDZmLFxuICAgIHNjcmlwdEhhc2g6IDB4YzQsXG4gICAgd2lmOiAweGVmLFxuICAgIGNvaW46IGNvaW5zLkJDSCxcbiAgICBjYXNoQWRkcjoge1xuICAgICAgcHJlZml4OiAnYmNodGVzdCcsXG4gICAgICBwdWJLZXlIYXNoOiAweDAwLFxuICAgICAgc2NyaXB0SGFzaDogMHgwOCxcbiAgICB9LFxuICB9LFxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9CVENHUFUvQlRDR1BVL2Jsb2IvbWFzdGVyL3NyYy92YWxpZGF0aW9uLmNwcFxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vQlRDR1BVL0JUQ0dQVS9ibG9iL21hc3Rlci9zcmMvY2hhaW5wYXJhbXMuY3BwXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9CVENHUFUvQlRDR1BVL2Jsb2IvbWFzdGVyL3NyYy9zY3JpcHQvaW50ZXJwcmV0ZXIuaFxuICBiaXRjb2luZ29sZDoge1xuICAgIG1lc3NhZ2VQcmVmaXg6ICdcXHgxOEJpdGNvaW4gR29sZCBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJlY2gzMjogJ2J0ZycsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMk1haW5uZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDI2LFxuICAgIHNjcmlwdEhhc2g6IDB4MTcsXG4gICAgd2lmOiAweDgwLFxuICAgIGZvcmtJZDogNzksXG4gICAgY29pbjogY29pbnMuQlRHLFxuICB9LFxuICBiaXRjb2luZ29sZFRlc3RuZXQ6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MThCaXRjb2luIEdvbGQgU2lnbmVkIE1lc3NhZ2U6XFxuJyxcbiAgICBiZWNoMzI6ICd0YnRnJyxcbiAgICBiaXAzMjogZ2V0RGVmYXVsdEJpcDMyVGVzdG5ldCgpLFxuICAgIHB1YktleUhhc2g6IDExMSxcbiAgICBzY3JpcHRIYXNoOiAxOTYsXG4gICAgd2lmOiAweGVmLFxuICAgIGZvcmtJZDogNzksXG4gICAgY29pbjogY29pbnMuQlRHLFxuICB9LFxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luLXN2L2JpdGNvaW4tc3YvYmxvYi9tYXN0ZXIvc3JjL3ZhbGlkYXRpb24uY3BwXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luLXN2L2JpdGNvaW4tc3YvYmxvYi9tYXN0ZXIvc3JjL2NoYWlucGFyYW1zLmNwcFxuICBiaXRjb2luc3Y6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MThCaXRjb2luIFNpZ25lZCBNZXNzYWdlOlxcbicsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMk1haW5uZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDAwLFxuICAgIHNjcmlwdEhhc2g6IDB4MDUsXG4gICAgd2lmOiAweDgwLFxuICAgIGNvaW46IGNvaW5zLkJTVixcbiAgICBmb3JrSWQ6IDB4MDAsXG4gIH0sXG4gIGJpdGNvaW5zdlRlc3RuZXQ6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MThCaXRjb2luIFNpZ25lZCBNZXNzYWdlOlxcbicsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMlRlc3RuZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDZmLFxuICAgIHNjcmlwdEhhc2g6IDB4YzQsXG4gICAgd2lmOiAweGVmLFxuICAgIGNvaW46IGNvaW5zLkJTVixcbiAgICBmb3JrSWQ6IDB4MDAsXG4gIH0sXG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhc2hwYXkvZGFzaC9ibG9iL21hc3Rlci9zcmMvdmFsaWRhdGlvbi5jcHBcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhc2hwYXkvZGFzaC9ibG9iL21hc3Rlci9zcmMvY2hhaW5wYXJhbXMuY3BwXG4gIGRhc2g6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MTlEYXJrQ29pbiBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJpcDMyOiBnZXREZWZhdWx0QmlwMzJNYWlubmV0KCksXG4gICAgcHViS2V5SGFzaDogMHg0YyxcbiAgICBzY3JpcHRIYXNoOiAweDEwLFxuICAgIHdpZjogMHhjYyxcbiAgICBjb2luOiBjb2lucy5EQVNILFxuICB9LFxuICBkYXNoVGVzdDoge1xuICAgIG1lc3NhZ2VQcmVmaXg6ICdcXHgxOURhcmtDb2luIFNpZ25lZCBNZXNzYWdlOlxcbicsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMlRlc3RuZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDhjLFxuICAgIHNjcmlwdEhhc2g6IDB4MTMsXG4gICAgd2lmOiAweGVmLFxuICAgIGNvaW46IGNvaW5zLkRBU0gsXG4gIH0sXG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2xpdGVjb2luLXByb2plY3QvbGl0ZWNvaW4vYmxvYi9tYXN0ZXIvc3JjL3ZhbGlkYXRpb24uY3BwXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9saXRlY29pbi1wcm9qZWN0L2xpdGVjb2luL2Jsb2IvbWFzdGVyL3NyYy9jaGFpbnBhcmFtcy5jcHBcbiAgbGl0ZWNvaW46IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MTlMaXRlY29pbiBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJlY2gzMjogJ2x0YycsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMk1haW5uZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDMwLFxuICAgIHNjcmlwdEhhc2g6IDB4MzIsXG4gICAgd2lmOiAweGIwLFxuICAgIGNvaW46IGNvaW5zLkxUQyxcbiAgfSxcbiAgbGl0ZWNvaW5UZXN0OiB7XG4gICAgbWVzc2FnZVByZWZpeDogJ1xceDE5TGl0ZWNvaW4gU2lnbmVkIE1lc3NhZ2U6XFxuJyxcbiAgICBiZWNoMzI6ICd0bHRjJyxcbiAgICBiaXAzMjogZ2V0RGVmYXVsdEJpcDMyVGVzdG5ldCgpLFxuICAgIHB1YktleUhhc2g6IDB4NmYsXG4gICAgc2NyaXB0SGFzaDogMHgzYSxcbiAgICB3aWY6IDB4ZWYsXG4gICAgY29pbjogY29pbnMuTFRDLFxuICB9LFxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96Y2FzaC96Y2FzaC9ibG9iL21hc3Rlci9zcmMvdmFsaWRhdGlvbi5jcHBcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3pjYXNoL3pjYXNoL2Jsb2IvbWFzdGVyL3NyYy9jaGFpbnBhcmFtcy5jcHBcbiAgemNhc2g6IHtcbiAgICBtZXNzYWdlUHJlZml4OiAnXFx4MThaQ2FzaCBTaWduZWQgTWVzc2FnZTpcXG4nLFxuICAgIGJpcDMyOiBnZXREZWZhdWx0QmlwMzJNYWlubmV0KCksXG4gICAgcHViS2V5SGFzaDogMHgxY2I4LFxuICAgIHNjcmlwdEhhc2g6IDB4MWNiZCxcbiAgICB3aWY6IDB4ODAsXG4gICAgLy8gVGhpcyBwYXJhbWV0ZXIgd2FzIGludHJvZHVjZWQgaW4gdmVyc2lvbiAzIHRvIGFsbG93IHNvZnQgZm9ya3MsIGZvciB2ZXJzaW9uIDEgYW5kIDIgdHJhbnNhY3Rpb25zIHdlIGFkZCBhXG4gICAgLy8gZHVtbXkgdmFsdWUuXG4gICAgY29uc2Vuc3VzQnJhbmNoSWQ6IHtcbiAgICAgIDE6IDB4MDAsXG4gICAgICAyOiAweDAwLFxuICAgICAgMzogMHg1YmE4MWIxOSxcbiAgICAgIC8vIDQ6IDB4NzZiODA5YmIgKG9sZCBTYXBsaW5nIGJyYW5jaCBpZCkuIEJsb3Nzb20gYnJhbmNoIGlkIGJlY29tZXMgZWZmZWN0aXZlIGFmdGVyIGJsb2NrIDY1MzYwMFxuICAgICAgLy8gNDogMHgyYmI0MGU2MFxuICAgICAgLy8gNDogMHhmNWI5MjMwYiAoSGVhcnR3b29kIGJyYW5jaCBpZCwgc2VlIGh0dHBzOi8vemlwcy56LmNhc2gvemlwLTAyNTApXG4gICAgICA0OiAweGU5ZmY3NWE2LCAvLyAoQ2Fub3B5IGJyYW5jaCBpZCwgc2VlIGh0dHBzOi8vemlwcy56LmNhc2gvemlwLTAyNTEpXG4gICAgfSxcbiAgICBjb2luOiBjb2lucy5aRUMsXG4gIH0sXG4gIHpjYXNoVGVzdDoge1xuICAgIG1lc3NhZ2VQcmVmaXg6ICdcXHgxOFpDYXNoIFNpZ25lZCBNZXNzYWdlOlxcbicsXG4gICAgYmlwMzI6IGdldERlZmF1bHRCaXAzMlRlc3RuZXQoKSxcbiAgICBwdWJLZXlIYXNoOiAweDFkMjUsXG4gICAgc2NyaXB0SGFzaDogMHgxY2JhLFxuICAgIHdpZjogMHhlZixcbiAgICBjb25zZW5zdXNCcmFuY2hJZDoge1xuICAgICAgMTogMHgwMCxcbiAgICAgIDI6IDB4MDAsXG4gICAgICAzOiAweDViYTgxYjE5LFxuICAgICAgLy8gNDogMHg3NmI4MDliYiAob2xkIFNhcGxpbmcgYnJhbmNoIGlkKVxuICAgICAgLy8gNDogMHgyYmI0MGU2MFxuICAgICAgLy8gNDogMHhmNWI5MjMwYiAoSGVhcnR3b29kIGJyYW5jaCBpZCwgc2VlIGh0dHBzOi8vemlwcy56LmNhc2gvemlwLTAyNTApXG4gICAgICA0OiAweGU5ZmY3NWE2LCAvLyAoQ2Fub3B5IGJyYW5jaCBpZCwgc2VlIGh0dHBzOi8vemlwcy56LmNhc2gvemlwLTAyNTEpXG4gICAgfSxcbiAgICBjb2luOiBjb2lucy5aRUMsXG4gIH0sXG59O1xuXG5leHBvcnQgPSBuZXR3b3JrcztcbiJdfQ==