# 🌱 SeedLink — Emergency SOS Mesh Communication System

> **A decentralized ESP32-based emergency communication network designed to transmit SOS messages across a self-healing wireless mesh when conventional communication infrastructure is unavailable.**

---

## 📌 Overview

**SeedLink** is an ESP32-based emergency communication system designed for disaster and infrastructure-failure scenarios where conventional communication networks such as cellular networks or the Internet may not be available.

The system creates a **local wireless mesh network** using multiple ESP32 nodes. Survivors can connect to a nearby node using a smartphone, submit an SOS message, and have that message distributed across the mesh.

At the same time, rescue personnel can access a **live web-based dashboard** from any node in the network to monitor received SOS messages.

The architecture is designed around a **universal-node concept**:

* There is no permanently assigned base station.
* Every ESP32 node performs the same core functions.
* Any node can receive an SOS.
* Any node can forward SOS information through the mesh.
* Any node can provide access to the rescue dashboard.

This allows the network to remain useful even when individual nodes become unavailable.

---

# 🎯 Project Objectives

The main objectives of SeedLink are:

* Provide emergency communication without cellular infrastructure.
* Allow survivors to submit SOS messages using a smartphone.
* Transmit SOS messages between multiple ESP32 nodes.
* Provide a decentralized mesh communication architecture.
* Allow rescue teams to access the system from any node.
* Identify the physical node from which an SOS originated.
* Provide location information for nodes.
* Monitor Wi-Fi signal strength during field testing.
* Build a foundation for a larger disaster-response communication system.

---

# 🏗️ System Architecture

```text
                  ┌──────────────────────┐
                  │   Survivor Phone     │
                  └──────────┬───────────┘
                             │
                       Wi-Fi connection
                             │
                             ▼
                  ┌──────────────────────┐
                  │      ESP32 Node A    │
                  │                      │
                  │  Wi-Fi AP + STA      │
                  │  SOS Web Server      │
                  │  Captive Portal      │
                  └──────────┬───────────┘
                             │
                       painlessMesh
                         Wi-Fi Mesh
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │  ESP32     │ │  ESP32     │ │  ESP32     │
       │  Node B    │ │  Node C    │ │  Node D    │
       └────────────┘ └────────────┘ └────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Rescue Team Phone  │
                  │   / Laptop           │
                  │                      │
                  │   /dashboard         │
                  └──────────────────────┘
```

---

# 🔑 Key Concept — Universal Mesh Node

Every ESP32 runs the same firmware.

A node can simultaneously:

1. Create/join the SeedLink wireless mesh.
2. Provide Wi-Fi access to nearby users.
3. Host the survivor SOS portal.
4. Receive SOS messages.
5. Broadcast SOS messages into the mesh.
6. Maintain a local SOS message log.
7. Host the rescue-team dashboard.
8. Provide live dashboard updates through WebSockets.
9. Announce its node identity.
10. Provide node location information in V1.1.
11. Monitor connected-device RSSI during testing in V1.1.

Therefore, there is **no dedicated base-station ESP32**.

A rescue team can connect to any available node and open:

```text
http://<node-ip>/dashboard
```

---

# 📡 Communication Technology

The current implementation uses:

**painlessMesh**

for communication between ESP32 nodes.

The system uses:

```text
Wi-Fi AP + Station Mode
        +
painlessMesh
        +
Web Server
        +
WebSocket
        +
JSON
```

The mesh is initialized using `WIFI_AP_STA`, allowing the ESP32 to participate in the mesh while also providing Wi-Fi connectivity to nearby devices.

---

# 🧩 Hardware

## Required Hardware

* ESP32 development boards
* USB cables / suitable power source
* Smartphones for testing
* Optional GPS module for future real-world location integration

Multiple ESP32 boards can be deployed as individual SeedLink nodes.

---

# 💻 Software & Libraries

The firmware currently uses:

### Core

* Arduino IDE
* ESP32 Board Package
* C++

### Libraries

```cpp
#include "painlessMesh.h"
#include <WiFi.h>
#include <DNSServer.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncWebSocket.h>
#include <ArduinoJson.h>
```

### Additional V1.1 Library

```cpp
#include "esp_wifi.h"
```

This is used to obtain Wi-Fi client signal-strength information from the ESP32 access-point side.

---

# 🚀 Version History

## 🔹 Version 0.0 — Initial Universal Mesh Prototype

Version 0.0 established the fundamental SeedLink architecture.

The first implementation introduced the **universal ESP32 node** concept.

### Features

* ESP32-based mesh networking
* painlessMesh communication
* Survivor SOS web portal
* SOS message broadcasting
* SOS message reception
* Local SOS message history
* Node identification using custom labels
* Rescue-team web dashboard
* WebSocket-based live dashboard updates
* Captive portal DNS
* Automatic node-label announcements
* Automatic topology updates
* Any-node dashboard access

The firmware can be flashed onto multiple ESP32 boards, with each board assigned a different `NODE_LABEL`.

Example:

```cpp
#define NODE_LABEL "NODE_A"
```

Another node can use:

```cpp
#define NODE_LABEL "NODE_B"
```

The label is transmitted along with SOS information so the dashboard can identify the originating physical node.

### Version 0.0 Architecture

```text
Survivor
   │
   │ Wi-Fi
   ▼
ESP32 Node A
   │
   │ painlessMesh
   ├──────────────► ESP32 Node B
   │                    │
   │                    ▼
   └──────────────► ESP32 Node C
                        │
                        ▼
                  Rescue Dashboard
```

The V0.0 implementation stores up to **50 SOS messages** in a rolling local log and maintains information for up to **20 known nodes**.

---

# 🔹 Version 1.1 — Location & Field Testing Enhancement

Version 1.1 builds on the V0.0 architecture while adding information useful for deployment and field testing.

The fundamental communication architecture remains the same, but each node now carries additional location information.

---

## 🗺️ Node Location

Each node now contains latitude and longitude values:

```cpp
#define NODE_LAT 26.6131
#define NODE_LON 71.2040
```

These values are currently **dummy coordinates used for testing**.

Different coordinates can be assigned to different nodes so that the dashboard can distinguish their positions.

The code explicitly identifies these coordinates as placeholders for future GPS integration.

---

## 📍 Location in SOS Messages

SOS messages now carry:

```text
Node ID
Node Label
Message
Latitude
Longitude
```

This allows the rescue dashboard to display the coordinates associated with the originating node.

The location information is stored in the local message log as well.

---

# 📶 Connected Device RSSI Monitoring

Version 1.1 adds Wi-Fi signal-strength monitoring for devices connected directly to a node.

The system periodically checks connected clients and reports:

```text
MAC Address
RSSI
```

Example Serial Monitor output:

```text
📶 1 device(s) connected to this node:
   MAC: XX:XX:XX:XX:XX:XX | RSSI: -XX dBm
```

This feature is primarily intended for **field testing**.

It can help determine whether a smartphone or other device is connected to a nearby node and observe the strength of that connection.

RSSI monitoring runs periodically during operation.

---

# 🌐 Survivor SOS Portal

A survivor can connect to the SeedLink Wi-Fi network and access the SOS portal.

The portal provides a simple text field where the survivor can provide information such as:

```text
Name
Location
Condition
Requirements
```

The message is then submitted to the connected ESP32 node.

---

# 🆘 SOS Message Flow

```text
Survivor Smartphone
        │
        │ Wi-Fi
        ▼
   Nearby ESP32
        │
        │ Create JSON SOS
        ▼
   painlessMesh
        │
        ├──────────────► Node B
        │
        ├──────────────► Node C
        │
        └──────────────► Node D
                         │
                         ▼
                  Rescue Dashboard
```

The SOS payload contains structured information.

Conceptually:

```json
{
  "type": "sos",
  "label": "NODE_A",
  "id": 123456789,
  "msg": "Emergency message",
  "lat": 26.6131,
  "lon": 71.2040
}
```

---

# 📊 Rescue Dashboard

The rescue dashboard is available at:

```text
http://<node-ip>/dashboard
```

The dashboard provides a live view of SOS information received by that node.

It displays information such as:

* Time
* Origin node
* Node ID
* Coordinates
* SOS message

---

# ⚡ Real-Time Dashboard Updates

SeedLink uses **WebSockets** to provide real-time updates.

The communication path is:

```text
ESP32
  │
  │ WebSocket
  ▼
Browser Dashboard
```

When a new SOS message reaches the node, the dashboard can receive the message without requiring a manual page refresh.

If the WebSocket connection is lost, the browser attempts to reconnect automatically.

---

# 🧠 Node Identification System

painlessMesh provides nodes with numerical node IDs.

However, numerical IDs are not very convenient for deployment.

SeedLink therefore adds human-readable labels.

Example:

```text
NODE_A
NODE_B
GATE_3
SHELTER_NORTH
```

Each node periodically announces its identity.

The information maintained by the system includes:

```text
Node ID
Node Label
Latitude
Longitude
```

This makes it easier to associate an ESP32 node with its physical deployment location.

---

# 🔄 Node Announcement

Nodes periodically broadcast an announcement message.

The announcement contains:

```text
Message Type
Node Label
Node ID
Latitude
Longitude
```

The current announcement interval is approximately:

```text
8 seconds
```

A node also announces itself immediately after startup and when a new mesh connection is established.

This helps newly connected nodes learn the identity and location of other nodes.

---

# 💾 Local Message History

Every node maintains a rolling SOS message history.

The current implementation stores up to:

```text
50 messages
```

When the maximum number of messages is reached, the oldest entries are overwritten.

This allows a rescue dashboard to retrieve messages that were received before the dashboard was opened.

---

# 📡 Network Configuration

The current network configuration is:

```cpp
#define MESH_PREFIX     "EMERGENCY_SOS_WIFI"
#define MESH_PASSWORD   ""
#define MESH_PORT       5555
#define MESH_CHANNEL    1
```

The network is currently configured as an **open Wi-Fi network**.

### ⚠️ Security Note

Because the password is empty:

* Anyone within Wi-Fi range may be able to connect.
* Mesh traffic is not protected by a network password.
* This configuration is intended for prototyping and testing.

Security and authentication should be added before considering real-world deployment.

---

# ⚙️ Node Configuration

Before flashing the firmware onto different ESP32 boards, change:

```cpp
#define NODE_LABEL "NODE_A"
```

For example:

### Node A

```cpp
#define NODE_LABEL "NODE_A"
#define NODE_LAT 26.6131
#define NODE_LON 71.2040
```

### Node B

```cpp
#define NODE_LABEL "NODE_B"
#define NODE_LAT 26.6140
#define NODE_LON 71.2050
```

### Node C

```cpp
#define NODE_LABEL "NODE_C"
#define NODE_LAT 26.6150
#define NODE_LON 71.2060
```

During testing, the coordinates can be dummy values.

For future deployment, they can be replaced with readings from an actual GPS module.

---

# 🛠️ Installation

## 1. Install Arduino IDE

Install the Arduino IDE and configure the ESP32 board package.

## 2. Install Required Libraries

Install the following libraries through the Arduino Library Manager or their respective sources:

```text
painlessMesh
ESPAsyncWebServer
AsyncTCP
ArduinoJson
```

The ESP32 board package provides libraries such as:

```text
WiFi
DNSServer
esp_wifi
```

## 3. Connect ESP32

Connect the ESP32 to the computer using USB.

## 4. Select Board

Select the appropriate ESP32 board from:

```text
Tools → Board
```

## 5. Configure Node

Change:

```cpp
#define NODE_LABEL "NODE_A"
```

and, in V1.1, configure:

```cpp
#define NODE_LAT
#define NODE_LON
```

## 6. Upload

Upload the firmware to the ESP32.

Repeat the process for every node, giving each physical node a unique label.

---

# 🧪 Testing Procedure

## Test 1 — Single Node

1. Flash the firmware onto one ESP32.
2. Power the ESP32.
3. Connect a smartphone to:

```text
EMERGENCY_SOS_WIFI
```

4. Open the node IP address.
5. Submit an SOS message.
6. Verify that the message appears in the local dashboard.

---

## Test 2 — Multiple Nodes

Deploy multiple ESP32 nodes.

Example:

```text
NODE_A
NODE_B
NODE_C
```

Verify that:

* Nodes discover each other.
* Node labels are exchanged.
* SOS messages are transmitted.
* Receiving nodes display the SOS.
* Dashboards receive live updates.

---

## Test 3 — Dashboard Access

Connect a rescue-team device to any available node.

Open:

```text
http://<node-ip>/dashboard
```

Verify that the dashboard displays:

```text
Origin Node
Node ID
Message
Coordinates
```

---

## Test 4 — RSSI Testing

In V1.1, connect a smartphone to a node and monitor the Serial Monitor.

The node periodically reports:

```text
MAC Address
RSSI
Free Heap
Mesh Connections
```

This can be used to study connectivity and signal strength during field experiments.

---

# 📈 Version Comparison

| Feature                       |  V0.0 |     V1.1 |
| ----------------------------- | ----: | -------: |
| ESP32                         |     ✅ |        ✅ |
| painlessMesh                  |     ✅ |        ✅ |
| Universal Node                |     ✅ |        ✅ |
| Survivor SOS Portal           |     ✅ |        ✅ |
| SOS Broadcasting              |     ✅ |        ✅ |
| SOS Reception                 |     ✅ |        ✅ |
| Node Labels                   |     ✅ |        ✅ |
| Live Dashboard                |     ✅ |        ✅ |
| WebSocket Updates             |     ✅ |        ✅ |
| Local Message History         |     ✅ |        ✅ |
| Captive Portal DNS            |     ✅ |        ✅ |
| Node Coordinates              |     ❌ |        ✅ |
| Coordinates in SOS            |     ❌ |        ✅ |
| Coordinates in Dashboard      |     ❌ |        ✅ |
| GPS Hardware                  |     ❌ |        ❌ |
| Client RSSI Monitoring        |     ❌ |        ✅ |
| Field Connectivity Monitoring | Basic | Improved |

---

# 🧱 Current Limitations

SeedLink is currently a **prototype/research implementation**.

Important limitations include:

### 1. Open Network

The current network uses:

```cpp
#define MESH_PASSWORD ""
```

Therefore, authentication and encryption are not currently implemented at the application level.

---

### 2. Dummy GPS Coordinates

V1.1 uses predefined coordinates:

```cpp
#define NODE_LAT
#define NODE_LON
```

These are placeholders.

Actual GPS hardware integration is planned for a future version.

---

### 3. Message Storage

The local message history is stored in RAM.

The current implementation supports:

```text
50 messages
```

Messages will therefore be lost after a complete restart or power cycle.

---

### 4. No Dedicated Central Server

The system currently does not depend on a cloud server or permanent central server.

The dashboard operates directly from an ESP32 node.

This improves decentralization but also means that dashboard data is dependent on the information available to the node being accessed.

---

### 5. Prototype-Level Routing

The current implementation uses painlessMesh's mesh communication mechanism and broadcasts SOS messages.

More advanced routing, acknowledgement, duplicate suppression, message IDs, delivery confirmation, and priority handling can be introduced in future versions.

---

# 🔮 Future Development

The SeedLink architecture can be expanded significantly.

Potential future improvements include:

## 📍 Real GPS Integration

Replace dummy coordinates with an actual GPS module.

Possible implementation:

```text
GPS Module
     │
     ▼
ESP32
     │
     ▼
Node Coordinates
     │
     ▼
SOS Message
```

---

## 🗺️ Interactive Rescue Map

The dashboard can be expanded from a table into an interactive map showing:

```text
Node A 📍
Node B 📍
Node C 📍
SOS Origin 📍
```

This would provide rescue personnel with a visual representation of the deployment area.

---

## 🔐 Security

Future versions should introduce:

* Network authentication
* Encrypted communication
* Message authentication
* Access control
* Rescue-team authentication
* Secure SOS data handling

---

## 📩 Message Acknowledgement

Future versions could introduce delivery confirmation:

```text
Survivor
   │
   ▼
Node A
   │
   ▼
Mesh
   │
   ▼
Rescue Node
   │
   └──────► ACK
```

This would allow the system to indicate whether an SOS message has successfully reached a rescue node.

---

## 🆔 Unique Message IDs

Each SOS could receive a unique ID:

```text
SOS-000001
SOS-000002
SOS-000003
```

This would help prevent duplicate processing and make message tracking easier.

---

## 🚨 SOS Priority Levels

Messages could be classified as:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

This could help rescue teams prioritize responses.

---

## 📶 Better Network Diagnostics

The existing RSSI monitoring can be expanded into a complete network-health system containing:

* Node signal strength
* Connected devices
* Mesh neighbors
* Node uptime
* Free heap
* Connection status
* Link quality
* Node availability

---

## 🔋 Battery & Power Monitoring

For field deployment, nodes could monitor their own power status.

Possible dashboard information:

```text
Battery: 78%
Voltage: 3.91 V
Power Status: BATTERY
```

---

## 📡 Long-Range Communication

Future hardware experiments could investigate alternative long-range technologies such as:

```text
ESP-NOW
LoRa
LoRa Mesh
Sub-GHz communication
```

The objective would be to increase communication range and improve reliability in disaster environments.

---

# 🧪 Development Roadmap

```text
V0.0
 │
 ├── Basic ESP32 Mesh
 ├── SOS Portal
 ├── SOS Broadcasting
 ├── Node Labels
 └── Live Dashboard
       │
       ▼
V1.1
 │
 ├── Node Coordinates
 ├── Location-aware SOS
 ├── Dashboard Coordinates
 └── RSSI Monitoring
       │
       ▼
Future
 │
 ├── Real GPS
 ├── Interactive Map
 ├── Message IDs
 ├── ACK / Delivery Confirmation
 ├── Security
 ├── Battery Monitoring
 ├── Network Diagnostics
 └── Advanced Routing
       │
       ▼
Production-Oriented
Emergency Communication Platform
```

---

# 🧠 Design Philosophy

SeedLink follows several important design principles:

### Decentralization

The system does not rely on a single permanent base station.

### Local Communication

Communication can take place locally without relying on conventional Internet connectivity.

### Universal Nodes

Every node can perform the major functions required by the system.

### Expandability

The architecture is designed so additional capabilities can be integrated over time.

### Field-Oriented Design

Features such as node labels, coordinates, RSSI monitoring, and local dashboards are intended to support real-world testing and deployment.

---

# ⚠️ Important Disclaimer

SeedLink is currently a **prototype developed for research, experimentation, and demonstration purposes**.

It should not be considered a certified life-safety communication system.

Real-world disaster deployment would require extensive testing of:

* Reliability
* Range
* Power consumption
* Environmental durability
* Network congestion
* Security
* Data integrity
* Message delivery guarantees
* Regulatory requirements
* Failover behavior

---

# 👨‍💻 Project Status

| Component            | Status         |
| -------------------- | -------------- |
| ESP32 Node           | 🟢 Working     |
| Mesh Communication   | 🟢 Implemented |
| SOS Portal           | 🟢 Implemented |
| SOS Broadcasting     | 🟢 Implemented |
| Node Identification  | 🟢 Implemented |
| Rescue Dashboard     | 🟢 Implemented |
| WebSocket Updates    | 🟢 Implemented |
| Location Metadata    | 🟢 Implemented |
| RSSI Monitoring      | 🟢 Implemented |
| Real GPS             | 🔵 Planned     |
| Interactive Map      | 🔵 Planned     |
| Secure Communication | 🔵 Planned     |
| Message ACK          | 🔵 Planned     |
| Advanced Routing     | 🔵 Planned     |

---

# 🌱 SeedLink

**SeedLink aims to provide a resilient communication layer for situations where traditional communication infrastructure becomes unavailable.**

The project is being developed incrementally, starting from a basic ESP32 mesh prototype and evolving toward a more capable decentralized emergency communication platform.

```text
CONNECT → TRANSMIT → RELAY → MONITOR → RESPOND
```

---

## 📜 Version

**Current documented version: V1.1**

**Previous version: V0.0**

---

## ⭐ Repository

If you find the project interesting, consider starring the repository and following its development.

---

**SeedLink — Connecting people when conventional communication fails.**
