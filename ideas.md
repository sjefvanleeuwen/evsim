# Future Mission Ideas & Roadmap

This document outlines potential new challenges, specifically focusing on "API First" design, advanced architectural scenarios, and the new functionality required to support them.

## 🔌 API First & Integration Challenges (GraphQL Edition)

### 1. The Graph Detective
*   **Scenario**: The frontend query is failing because the schema has evolved without notice.
*   **Mission**: Use the embedded GraphiQL Playground to inspect the schema. Identify why the `chargerStatus` query is returning errors. Find the new field name (e.g., `evseStatus`) using introspection and fix the query.
*   **Learning Outcome**: GraphQL introspection, schema exploration, query debugging.

### 2. Subscription Snag
*   **Scenario**: The "Live Dashboard" is not updating when a car plugs in.
*   **Mission**: Debug the GraphQL Subscription `onSessionStarted`. Identify that the WebSocket connection is dropping due to a missing authentication token in the connection payload.
*   **Learning Outcome**: GraphQL Subscriptions, WebSockets, real-time debugging.

### 3. Complexity Overload (DoS)
*   **Scenario**: A rogue partner application is sending deeply nested queries that are crashing the server.
*   **Mission**: Analyze a query with circular references (e.g., `User -> Sessions -> Charger -> User...`). Configure the GraphQL server to reject queries with depth > 5 or complexity score > 1000.
*   **Learning Outcome**: GraphQL security, query complexity analysis, denial of service protection.

### 4. The Deprecated Field
*   **Scenario**: A legacy mobile app crashed after a schema update.
*   **Mission**: The `connectorId` field was marked `@deprecated` and has now been removed. Write a resolver alias (or "shim") to map the new `evseId` back to `connectorId` to restore backward compatibility for the old client.
*   **Learning Outcome**: GraphQL evolution, deprecation strategies, resolvers.

---

## 🏗️ Advanced Architecture & Complex Missions

### 5. The Load Balancer Logic
*   **Scenario**: One region is overloaded while another is idle.
*   **Mission**: Adjust the load balancing algorithm (Round Robin vs. Least Connections vs. Geo-DNS) to distribute 10,000 active sessions evenly across 3 server clusters.
*   **Learning Outcome**: Distributed systems, load balancing algorithms.

### 6. SQL Injection Investigation
*   **Scenario**: The "Search User" function is behaving strangely.
*   **Mission**: Identify a security vulnerability where inputting `' OR '1'='1` reveals all user data. Patch the query by selecting the "Parameterized Query" option.
*   **Learning Outcome**: Application security, SQL injection, secure coding.

### 7. Microservice Trace
*   **Scenario**: A "Start Session" request failed, but the error is generic ("Unknown Error").
*   **Mission**: Use a Distributed Tracing view (like Jaeger/Zipkin) to follow the request ID through the Gateway -> Auth Service -> Session Service -> Hardware Proxy. Find the specific service that timed out.
*   **Learning Outcome**: Microservices, distributed tracing, debugging distributed systems.

### 8. Grid Balancing Act (Smart Charging)
*   **Scenario**: The local transformer is about to blow due to peak load.
*   **Mission**: Configure a Smart Charging Profile. Set limits for specific chargers based on priority (VIP vs. Guest) to keep total consumption under 500kW.
*   **Learning Outcome**: Smart charging (OCPP), energy management, priority logic.

---

## 💰 Financial & Billing Challenges

### 9. The Floating Point Phantom
*   **Scenario**: The monthly revenue report is off by €0.42 compared to the bank statement.
*   **Mission**: Investigate the billing calculation logic. Discover that prices are being stored as `floats` instead of `decimals`, causing rounding errors on micro-transactions. Refactor the calculation to use integer math (cents) or a Decimal type.
*   **Learning Outcome**: Financial data types, floating point precision errors, billing accuracy.

### 10. Tariff Time Travel
*   **Scenario**: A customer is complaining about being overcharged for a session that started during "Off-Peak" hours but ended during "Peak" hours.
*   **Mission**: The current billing engine applies the tariff at the *end* of the session. Rewrite the logic to split the session into time buckets and apply the correct rate for each segment (Time-of-Use billing).
*   **Learning Outcome**: Complex billing logic, time-series data manipulation, tariff structures.

### 11. VAT Validation Void
*   **Scenario**: Cross-border charging sessions are failing tax audits.
*   **Mission**: A German driver charged in France, but the invoice shows 21% Dutch VAT. Configure the tax rules engine to apply the "Place of Supply" VAT rule correctly based on the Charge Point Operator's location, not the MSP's location.
*   **Learning Outcome**: International tax rules (VAT), cross-border transactions, regulatory compliance.

### 12. The Double-Spend Detectives
*   **Scenario**: A user managed to start two simultaneous DC fast charging sessions on the same account balance, driving it negative.
*   **Mission**: Implement a "Reservation" or "Hold" mechanism on the user's wallet *before* authorizing the session. Ensure the transaction is atomic.
*   **Learning Outcome**: Concurrency control, database transactions, wallet management.

### 13. The Spot Price Surfer (Dynamic Pricing)
*   **Scenario**: The CPO is bleeding money. The fixed tariff is €0.30/kWh, but wholesale energy prices spiked to €0.50/kWh during the evening peak. Conversely, prices went negative (-€0.05) at noon due to excess solar, but the high fixed price scared away customers.
*   **Mission**:
    1.  Analyze the "Spot Price vs. Tariff" graph to identify loss periods.
    2.  Use the **Dynamic Tariff Editor** to create a formula: `Price_per_kWh = MAX(Spot_Price * 1.10, 0.15)`.
    3.  Run the "24h Profit Simulator" to verify that the margin stays positive without exceeding the competitive price cap.
*   **Learning Outcome**: Dynamic pricing models, spot markets (EPEX), margin management, smart billing.

---

## 🌿 Smart Energy & HEMS Challenges

### 14. The HEMS Handshake (Grid Protection)
*   **Scenario**: A homeowner has a limited grid connection (e.g., 3x25A). Every time the Heat Pump kicks in while the EV is charging, the main fuse trips, causing a blackout.
*   **Mission**: Integrate the EV Charger with the Home Energy Management System (HEMS) using the **EEBUS** protocol (or **Modbus TCP**). Configure a "Dynamic Load Balancing" profile that reads the smart meter data and throttles the EV charger in real-time to ensure the total house load never exceeds the physical limit.
*   **Learning Outcome**: HEMS integration, EEBUS/Modbus protocols, local load balancing, preventing grid overload.

### 15. Solar Surplus Surfer
*   **Scenario**: The user wants to charge their EV *only* using excess solar energy to minimize costs and reduce grid congestion during peak generation hours.
*   **Mission**: Configure the HEMS to monitor the Solar Inverter via **SunSpec** (Modbus). Set up a logic rule: `IF Solar_Export > 6A THEN Start_Charging`. Ensure the charging rate modulates up and down with the passing clouds.
*   **Learning Outcome**: Solar integration, self-consumption optimization, SunSpec protocol, renewable energy usage.

### 16. The Blackout Savior (V2H)
*   **Scenario**: A severe winter storm has knocked out the local power grid. The house is dark, but the EV has 60kWh of stored energy.
*   **Mission**: Activate "Island Mode" on the bi-directional charger via **EEBUS**. Configure the HEMS to prioritize critical loads (Fridge, Lights, WiFi) and discharge the EV battery to power the home (Vehicle-to-Home).
*   **Learning Outcome**: Bi-directional charging (ISO 15118-20), V2H/V2G, critical load management, islanding.

### 17. The Peak Shaver (Congestion Control)
*   **Scenario**: The neighborhood transformer is overloaded between 18:00 and 20:00. The DSO (Distribution System Operator) has issued a "Red Alert" asking for load reduction.
*   **Mission**: Instead of just stopping the charge, configure the HEMS to *discharge* the EV (V2G) to support the household load (cooking/TV) during this window, effectively reducing the house's grid draw to zero or even exporting power to help neighbors.
*   **Learning Outcome**: Grid congestion management, peak shaving, V2G, demand response.

---

## 🛠️ New Functionality Required

To support these advanced missions, the "EV Escape Room" platform needs the following enhancements:

### 1. Dynamic Pricing Engine & UI
*   **Description**: A system to simulate and visualize fluctuating energy costs.
*   **Features**:
    *   **Spot Price Simulator**: Generates 24h curves with peaks and negative pricing.
    *   **Tariff Formula Builder**: UI to construct pricing logic (e.g., variables like `SPOT`, `GRID_FEE`, `MARGIN`).
    *   **Profit/Loss Heatmap**: Visualizes where the user's tariff is losing money against the spot price.

### 2. GraphiQL / Apollo Sandbox
*   **Description**: An embedded GraphQL IDE.
*   **Features**:
    *   Schema Explorer (Docs sidebar).
    *   Query/Mutation/Subscription runner.
    *   Pre-loaded query collections for specific missions.

### 2. Terminal / CLI Emulator
*   **Description**: A simulated command-line interface for "server-side" tasks.
*   **Features**:
    *   Parse basic commands (e.g., `grep logs`, `curl`, `systemctl restart`).
    *   Display scrolling logs in real-time.

### 3. Code/Query Editor
*   **Description**: A lightweight code editor (Monaco Editor integration).
*   **Features**:
    *   Syntax highlighting for JSON, SQL, or JavaScript.
    *   Ability to "run" snippets to patch logic or query data.

### 4. Enhanced Analytics Dashboard
*   **Description**: A Grafana-style view for system metrics.
*   **Features**:
    *   Real-time graphs for CPU, Memory, and Network Latency.
    *   Interactive time-series data to spot anomalies.

### 6. HEMS Protocol Simulator & Traffic Analyzer
*   **Description**: A dedicated tab for simulating and inspecting local energy management protocols, similar to the OCPP inspector.
*   **Features**:
    *   **Protocol Support**: Simulation of **EEBUS** (SHIP/SPINE), **Modbus TCP**, and **SunSpec**.
    *   **Traffic Inspector**: A Wireshark-style view to see raw packets (e.g., Modbus registers, EEBUS datagrams).
    *   **Device Emulation**: Virtual "Smart Meter" and "Solar Inverter" that generate traffic based on the scenario (e.g., sun coming out, heat pump turning on).
    *   **Handshake Visualizer**: Graphical representation of the connection establishment (e.g., SHIP handshake).

### 7. Network Topology Visualizer
*   **Description**: A dynamic map of microservices.
*   **Features**:
    *   Visual nodes for each service (Auth, Billing, Asset).
    *   Animated lines showing traffic flow and error rates between nodes.
