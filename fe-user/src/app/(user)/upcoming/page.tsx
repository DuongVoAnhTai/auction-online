import AuctionsPage from "../auctions/page";

export const metadata = { title: "Sắp diễn ra - Hệ thống đấu giá" };

export default function UpcomingPage(props: any) {
  return <AuctionsPage {...props} forcedStatus="PENDING" />;
}
