use anchor_lang::prelude::*;
//use anchor_lang::solana_program::system_program;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("2hiG8UasvmG2VFUxGWFDbVWwY6MjJ58vdEsVoPUS11pv");

#[program]
pub mod solana_counter {
    use super::*;

	 pub fn store_count(ctx: Context<StoreCount>, the_count: i32) -> ProgramResult {
		let count: &mut Account<Count> = &mut ctx.accounts.count;
		let user: &Signer = &ctx.accounts.user;
		let clock: Clock = Clock::get().unwrap();

		count.user = *user.key;
		count.the_count = the_count;
		count.timestamp = clock.unix_timestamp;
		
		Ok(())
  }
}

#[derive(Accounts)]
pub struct StoreCount<'info> {
	#[account(init, payer = user, space = Count::LEN)]
	pub count: Account<'info, Count>,
	#[account(mut)]
	pub user: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
pub struct Count {
	 pub user: Pubkey,
    pub the_count: i32,
    pub timestamp: i64,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const THE_COUNT_LENGTH: usize = 4;
const TIMESTAMP_LENGTH: usize = 8;

impl Count {
	const LEN: usize = DISCRIMINATOR_LENGTH
		+ PUBLIC_KEY_LENGTH // User
		+ TIMESTAMP_LENGTH // Timestamp
		+ THE_COUNT_LENGTH; // Counter
}
