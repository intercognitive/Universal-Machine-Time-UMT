// clock-server.js
import express from "express";
import { Sdk } from "@peaq-network/sdk";

const app = express();
const PORT = process.argv[2] || 3000;

// Add drift factor to simulate clock imperfections
const driftFactor = (Math.random() - 0.5) * 0.0001;

// Add random offset of 10-15 seconds (in nanoseconds)
const initialOffset = BigInt(
  Math.floor(
    // Random number between 10 and 15 (seconds)
    (Math.random() * 5 + 10) *
      // Convert to nanoseconds
      1_000_000_000
  )
);

// Make it positive or negative randomly
const signedOffset = Math.random() > 0.5 ? initialOffset : -initialOffset;

// Convert current Unix timestamp to nanoseconds and add random offset
let baseTime = BigInt(Date.now()) * BigInt(1_000_000) + signedOffset;
let lastSyncTime = process.hrtime.bigint();
let isDisplaying = true;

function getNanoClock() {
  const elapsed = process.hrtime.bigint() - lastSyncTime;
  const drift = BigInt(Math.floor(Number(elapsed) * driftFactor));
  return baseTime + elapsed + drift;
}

function displayClock() {
  if (isDisplaying) {
    const time = getNanoClock();
    process.stdout.write(`\rServer ${PORT} Time: ${time} ns`);
  }
}

// PTP Sync endpoint
app.get("/sync", async (req, res) => {
  isDisplaying = false;
  console.log("\nSynchronizing...");

  try {
    await new Promise((resolve) => {
      const unsubscribe = Sdk.subscribeToPtp(
        { masterUrl: "https://ptp.peaq.network" },
        ({ synchronizedTime }) => {
          baseTime = synchronizedTime;
          lastSyncTime = process.hrtime.bigint();
          console.log(`\nSynchronized to: ${synchronizedTime} ns`);
          unsubscribe();
          resolve(true);
        }
      );
    });

    res.send("Synchronized");
  } catch (error) {
    console.error("Sync failed:", error);
    res.status(500).send("Sync failed");
  } finally {
    isDisplaying = true;
  }
});

const clockInterval = setInterval(displayClock, 1);

app.listen(PORT, () => {
  console.log(
    `Clock server running on port ${PORT} with initial time: ${baseTime} ns`
  );
});

// Cleanup on exit
process.on("SIGINT", () => {
  clearInterval(clockInterval);
  process.exit();
});
