"use client";

import { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import idl from "./src/idl/solana_counter.json";
import { useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";

export default function Home() {
	const [theCount, setTheCount] = useState(0);
	const [userHasCount, setUserHasCount] = useState(false);
	const [loading, setLoading] = useState(false);
	const [statusText, setStatusText] = useState('');

	const increment = () => {
		setTheCount(theCount + 1);
	};

	const decrement = () => {
		if (theCount > 0) {
			setTheCount(theCount - 1);
		}
	};

	const wallet = useWallet();
	const { publicKey } = useWallet();
	const programID = new web3.PublicKey("2hiG8UasvmG2VFUxGWFDbVWwY6MjJ58vdEsVoPUS11pv");

	const connection = new web3.Connection("https://api.devnet.solana.com");
	const options = anchor.AnchorProvider.defaultOptions();

	const provider = new anchor.AnchorProvider(connection, wallet, options);
	const countProgram = new anchor.Program(idl, programID, provider);
	
	useEffect(() => {
		getUserCount();
		//console.log('ran from use effect');
	}, [publicKey]);

	async function storeCount(){
		if(countProgram && publicKey){
			try{
				setLoading(true);
				const count = web3.Keypair.generate();
				
				await countProgram.methods.storeCount(new anchor.BN(theCount)).accounts({
						user: publicKey,
						count: count.publicKey,
						systemProgram: web3.SystemProgram.programId,
				}).signers([count]).rpc().then(async (res) => {
					//console.log(res);

					const getConfirmation = async () => {
						const status = await connection.getSignatureStatus(res, {
							searchTransactionHistory: true,
						});
						const confirmation = status.value?.confirmationStatus;
						setStatusText(confirmation);
						if(confirmation === 'finalized'){
							getUserCount();
						}else{
							//console.log(confirmation, "- retrying");
							setTimeout(() => {
								getConfirmation();
							}, 3000);
					 	};
					};
					getConfirmation();
				}).catch((err) => {
					console.log(err);
					setLoading(false);
					setUserHasCount(false);
				});

			}catch(error){
				console.log(error);
			}
		}
	}

	async function getUserCount(){
		if(countProgram && publicKey){
			try{
				const countAccounts = await countProgram.account.count.all([
					{
						memcmp: {
								offset: 8, // Discriminator.
								bytes: publicKey.toBase58(),
						}
					}
				]);

				//reorder array by timestamp just because when testing it got out of order, potentially no longer needed once in production
				countAccounts.sort(function (a, b) {
					return a.account.timestamp.toNumber() - b.account.timestamp.toNumber();
				});

				//console.log(countAccounts);

				//get last item in array
				const found = countAccounts.findLast((countAccount) => countAccount.account.user.toBase58() === publicKey.toBase58());
				//console.log(found?.account.theCount);

				if(found !== undefined && found.account.theCount !== undefined){
					setTheCount(found.account.theCount);
					setUserHasCount(true);
					setLoading(false);
					setStatusText('Saved!');
				}else{
					setUserHasCount(false);
				}

			}catch(error){
				console.log(error);
				setLoading(false);
				setTheCount(0);
			}
		}
	}

  return (
	<main className="flex min-h-screen flex-col items-center justify-between">
		<div className="flex items-center justify-center w-full h-screen relative z-10">
			<div className="wrapper text-center">
				<button
					onClick={increment}
					className="rounded-full h-16 w-16 inline-block bg-red-500 text-white text-lg mx-2 hover:bg-red-600 transition-colors duration-200"
				>
					+1
				</button>
				<button
					disabled={theCount === 0}
					onClick={decrement}
					className="rounded-full h-16 w-16 inline-block bg-blue-500 text-white text-lg mx-2 hover:bg-blue-600 transition-colors duration-200 disabled:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					-1
				</button>
				
				<button
					disabled={!publicKey}
					onClick={storeCount}
					className="rounded-full h-16 w-36 block mt-4 mx-auto bg-green-500 text-white text-lg hover:bg-green-600 transition-colors duration-200 disabled:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{!loading ? "Save Count" : "Saving..."}
				</button>

				<br />

				{statusText !== '' && publicKey && (
					<div className="text-center text-xs break-words text-white">
						<p>On chain status:</p>
						<p className="capitalize">{statusText}</p>
					</div>
				)}

				<br />

				{publicKey && (
					<div className="text-center text-xs break-words hidden">
						<p>Connected Wallet Address:</p>
						<p>{publicKey.toBase58()}</p>
					</div>
				)}
			</div>
		</div>
		<span className="text-white text-center opacity-10 absolute z-0 align-text-bottom block tracking-[-0.1em] leading-[0] top-[50vh] mr-[0.1em] text-[100vw] pointer-events-none">
			{theCount}
		</span>
	</main>
  );
}