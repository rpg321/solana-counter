import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import * as assert from "assert";

describe("solana-counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

  	it("Can store a count!", async () => {
		const count = anchor.web3.Keypair.generate();

	 	// Add your test here.
	 	await program.rpc.storeCount(30, {
			accounts: {
				count: count.publicKey,
				user: program.provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			},
			signers: [count],
		});

		// Fetch the account details of the created count.
		const countAccount = await program.account.count.fetch(count.publicKey);
		
		//console.log(countAccount);

		// Ensure it has the right data.
		assert.equal(countAccount.user.toBase58(), program.provider.wallet.publicKey.toBase58());
		assert.equal(countAccount.theCount, 30);
		assert.ok(countAccount.timestamp);

  	});

	  it("Can store a count for someone else!", async () => {
		// Generate another user and airdrop them some SOL.
		const otherUser = anchor.web3.Keypair.generate();
		const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
    	await program.provider.connection.confirmTransaction(signature);

		const count = anchor.web3.Keypair.generate();

	 	// Add your test here.
	 	await program.rpc.storeCount(69, {
			accounts: {
				count: count.publicKey,
				user: otherUser.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			},
			signers: [otherUser, count],
		});

		// Fetch the account details of the created count.
		const countAccount = await program.account.count.fetch(count.publicKey);
		
		// Ensure it has the right data.
		assert.equal(countAccount.user.toBase58(), otherUser.publicKey.toBase58());
		assert.equal(countAccount.theCount, 69);
  	});

	  it('can get the count for a user', async () => {
		const userPublicKey = program.provider.wallet.publicKey
		const countAccounts = await program.account.count.all([
			 {
				  memcmp: {
						offset: 8, // Discriminator.
						bytes: userPublicKey.toBase58(),
				  }
			 }
		]);
  
		assert.ok(countAccounts.every(countAccount => {
			return countAccount.account.user.toBase58() === userPublicKey.toBase58()
	  	}))
  });
});
