import './globals.css'
import { Roboto } from "next/font/google";
import {Wallet} from "./src/Wallet";

// Day.js
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

const roboto = Roboto({
	weight: ["400", "700"],
	style: ["normal"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata = {
	title: "Anchor Counter",
	description:
		"A basic counter built using Anchor and Next.js, storing data on the Solana blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className + " overflow-hidden"}>
			<Wallet>
				{children}
			</Wallet>
		</body>
    </html>
  )
}
