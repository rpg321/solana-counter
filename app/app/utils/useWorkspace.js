import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
//import { Provider, Program } from "@coral-xyz/anchor";

import idl from "../../../target/idl/solana_counter.json";

const programID = new PublicKey(idl.metadata.address);
let workspace = null;

export const useWorkspace = () => workspace;

export const initWorkspace = () => {
	const wallet = useAnchorWallet();
	const connection = new Connection("http://127.0.0.1:8899");
	const provider = () => new AnchorProvider(connection, wallet.value);
	const program = () => new Program(idl, programID, provider.value);

	workspace = {
		wallet,
		connection,
		provider,
		program,
	};
};
