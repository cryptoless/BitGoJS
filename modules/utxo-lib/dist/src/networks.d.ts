import { BitcoinCashNetwork, Network, NetworkName, ZcashNetwork } from './networkTypes';
declare const networks: Record<NetworkName, Network> & Record<'zcash' | 'zcashTest', ZcashNetwork> & Record<'bitcoincash' | 'bitcoincashTestnet', BitcoinCashNetwork>;
export = networks;
//# sourceMappingURL=networks.d.ts.map