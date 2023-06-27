'use client';

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
//import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolflareWalletAdapter, PhantomWalletAdapter, GlowWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

type Props = {
	 children?: React.ReactNode
}

const WalletMultiButtonDynamic = dynamic(
	async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
	{ ssr: false }
);

export const Wallet: FC<Props> = ({children}) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new GlowWalletAdapter(),
			new BackpackWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
   		<ConnectionProvider endpoint={endpoint}>
         	<WalletProvider wallets={wallets} autoConnect>
            	<WalletModalProvider>
						<div className="absolute right-4 top-4 z-20">
							<WalletMultiButtonDynamic className='bg-[#512da8] rounded-full' />
						</div>
               	{ children }
               </WalletModalProvider>
         	</WalletProvider>
        	</ConnectionProvider>
    );
};