import dayjs from "dayjs";

export class Count {
	constructor(publicKey, accountData) {
		this.publicKey = publicKey;
		this.user = accountData.user;
		this.timestamp = accountData.timestamp.toString();
		this.theCount = accountData.theCount;
	}

	get user() {
		return this.publicKey.toBase58();
	}

	get created_at() {
		return dayjs.unix(this.timestamp).format("lll");
	}
}
