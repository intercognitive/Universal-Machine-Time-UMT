# Universal-Machine-Time-UMT

Universal Machine Time (UMT) is the first-ever onchain implementation of the precision time protocol (PTP), which enables blockchain-verified timestamps at a nanosecond precision. This function enables machines on a DePIN to sync and coordinate the timing with the PTP server, which works as the high-percision onchain clock for the entire ecosystem.

UMT enables such use cases and functionalities as:
- Fast and secure user and machine authentication
- Decentralized time coordination
- Precise resource management
- High-frequency trading
- And more

With its onchain PTP implementation, peaq unlocks highest imaginable timing precision for the DePIN sector.

## About UMT

### Precision Time Protocol (PTP) Implementation

UMT implements a modified version of the IEEE 1588 Precision Time Protocol (PTP) to achieve nanosecond-level time synchronization across the network. This implementation uses a master clock server that derives its time from the blockchain, providing a trustless and decentralized time source.

#### PTP Algorithm Overview

Our implementation follows the core principles of PTP while adapting them for blockchain-based time synchronization:

1. **Master-Slave Architecture**: A designated master clock server maintains the reference time derived from blockchain timestamps.

2. **Two-Way Message Exchange**:
   - **Sync Message**: Client requests time from the master (T1)
   - **Delay_Req Message**: Client sends a timestamp request and the master responds with arrival time (T2')
   - Client calculates offset using its local timestamps and the master's responses

3. **Clock Drift Compensation**: The system continuously monitors and adjusts for drift between local time and blockchain time.

#### Implementation Details

1. **Blockchain Time Source**:
   - Timestamps from the blockchain are converted from milliseconds to nanoseconds
   - Block intervals are tracked using a moving average to smooth variations
   - The system detects and warns about significant time drift

2. **High-Precision Timekeeping**:
   - Uses `process.hrtime.bigint()` for nanosecond precision in local measurements
   - Calculates elapsed time between blockchain updates with nanosecond resolution
   - Implements drift detection with configurable thresholds (currently 1 second)

3. **Nanosecond Precision**:
   - Converting all time values to nanoseconds (1 second = 1,000,000,000 ns)
   - Using bigint values to prevent floating-point precision issues
   - Implementing adaptive block interval tracking

4. **Resilient Time Synchronization**:
   - Handles missed blocks gracefully with warning mechanisms
   - Uses REST API endpoints for time synchronization messages
   - Maintains continuous blockchain connection with proper cleanup handlers

#### Blockchain Network Connection and Real-Time Synchronization

The UMT server maintains a persistent connection to the blockchain network using the following mechanisms:

1. **Polkadot.js API Integration**:
   - The server connects to the peaq network using the `@polkadot/api` library
   - Establishes a WebSocket connection to the blockchain node
   - Manages connection lifecycle with proper error handling and reconnection logic

2. **Real-Time Block Subscription**:
   - Subscribes to new blocks using `api.query.system.number` to track block sequence
   - Subscribes to timestamp updates with `api.query.timestamp.now` to get authoritative blockchain time
   - Detects missed blocks to maintain synchronization accuracy

3. **Time Propagation Process**:
   - New block timestamps are immediately captured and converted to nanosecond precision
   - Local time is recorded simultaneously to establish the reference point
   - Elapsed time since last block is calculated using high-precision local clock
   - Time drift is continuously monitored and compensated

This architecture provides a reliable time synchronization mechanism with precision suitable for timestamps in distributed applications, IoT devices, and blockchain transactions where accurate time is critical.

## Using UMT with the peaq SDK

UMT is readily available through the peaq SDK, allowing any machine to easily integrate with this precise timekeeping mechanism.

### SDK Implementation

The peaq SDK implements a client-side PTP module that handles:

1. **Time Synchronization Protocol**: Implements the same PTP algorithm as the master clock server
2. **High-Precision Timestamps**: Uses platform-specific methods to achieve nanosecond precision
3. **Continuous Synchronization**: Maintains time accuracy through periodic adjustments
4. **Offset Calculation**: Computes the local clock offset from the master clock

### Integration Example

We've provided a simple example implementation in `index.js`. To run it:

1. Install dependencies:
   ```bash
   npm i
   ```

2. Run the example:
   ```bash
   npm start
   ```

The example will connect to the peaq network's PTP server, calculate the time offset, and display the synchronized time in your console.

### How It Works

The SDK's PTP implementation follows these steps:

1. **Sync Message Exchange**:
   - Client requests time from the master (T1)
   - Client records local receipt time (T1')
  
2. **Delay Request Exchange**:
   - Client sends timestamp request (T2)
   - Master timestamps arrival and responds (T2')
  
3. **Offset Calculation**:
   - Computes clock offset using the formula: `offset = (T1' - T1 - (T2 - T2')) / 2`
   - Calculates synchronized time as: `synchronizedTime = localTime + offset`

4. **Periodic Updates**:
   - Automatically maintains synchronization at configurable intervals
   - Default interval is 1000ms (1 second)
   - Calls the provided callback with updated offset and time values

## Proof of Mechanism: Demonstrating Multi-Server Synchronization

We've included a `clock-server.js` file that serves as a practical demonstration of the UMT system in action, showing how the PTP implementation synchronizes multiple machines across a network.

### How It Works

The `clock-server.js` simulates machine clocks with deliberately introduced drift and random initial offsets:

1. **Simulated Time Drift**: Each server instance introduces a small random drift factor to emulate real-world clock imperfections
2. **Random Initial Offset**: Servers start with a random time offset (10-15 seconds) to simulate unsynchronized machines
3. **Real-time Display**: The current time in nanoseconds is continuously displayed on the console
4. **On-Demand Synchronization**: An HTTP endpoint (/sync) triggers synchronization with the PTP master

### Running the Demonstration

To experience the power of UMT synchronization:

1. Start multiple clock servers on different ports:
   ```bash
   # Terminal 1
   node clock-server.js 3000
   
   # Terminal 2
   node clock-server.js 3001
   ```

2. Observe the different times displayed in each terminal - they will be significantly different due to the random offsets

3. Trigger synchronization for each server:
   ```bash
   # In a new terminal
   curl http://localhost:3000/sync
   
   # Wait a moment to observe the first server synchronizing, then
   curl http://localhost:3001/sync
   ```

4. Observe how both servers now display identical nanosecond-level timestamps, despite running on different processes/machines

The synchronization process connects each server to the peaq network's PTP master clock, which derives its time from the blockchain. This creates a trustless, decentralized time reference that all machines can agree upon with nanosecond precision, enabling critical time-dependent applications in the DePIN ecosystem.
