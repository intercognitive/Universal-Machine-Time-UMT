import { Sdk } from "@peaq-network/sdk";

const MASTER_URL = "https://ptp.peaq.network";

// Subscribe to PTP updates
const unsubscribe = Sdk.subscribeToPtp(
  { masterUrl: MASTER_URL },
  ({ offset, synchronizedTime }) => {
    console.log(`Clock Offset: ${offset} nanoseconds`);
    console.log(`Synchronized Time: ${synchronizedTime} nanoseconds`);
  }
);

// Unsubscribe when needed
unsubscribe();
