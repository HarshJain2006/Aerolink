# 🚁 AeroLink — Emergency Mesh Network

> **A UAV-deployable emergency communication network designed to rapidly restore communication connectivity in disaster-affected areas using strategically deployed ground communication nodes and a multi-hop mesh network.**

---

## 🏆 Smart India Hackathon 2026

**Problem Statement ID:** 26223  
**Problem Statement:** UAV-Deployable Emergency Communication Network  
**Theme:** Student Innovation – Disaster Management  
**Category:** Hardware  
**Team:** Apex

---

## 📌 Overview

Natural disasters can severely damage communication and power infrastructure, leaving affected regions disconnected from rescue teams and command centers.

In such situations:

- Cellular networks may become unavailable.
- Internet connectivity may be disrupted.
- Victims may be unable to send emergency messages.
- Rescue teams may lose communication with affected areas.
- Manually deploying temporary communication infrastructure can be slow and dangerous.
- UAV-based communication relays can be constrained by flight time and battery capacity.

**AeroLink** addresses this problem by using **UAVs to rapidly deploy ground-based communication nodes** at strategically selected locations.

After deployment, these nodes form a **multi-hop wireless mesh network**, allowing emergency information to travel across the affected area and eventually reach the rescue command center.

The UAV is primarily used for **rapid deployment of communication infrastructure**, while the deployed ground nodes provide persistent communication after landing.

> **Final architecture note:** The final project document specifies an ESP32-based ground node with LoRa communication, an SOS push button, local Wi-Fi/BLE access, and a command-center stack based on React.js, Node.js + Express.js, Firebase, OpenStreetMap, and WebSocket. Earlier firmware versions in this repository are prototype stages toward this architecture.

---

# 🎯 Problem Statement

During disasters, conventional communication infrastructure may be damaged or completely unavailable.

This creates several challenges:

- Rescue teams cannot communicate effectively with isolated areas.
- Survivors may have no reliable method to send emergency messages.
- Establishing temporary communication infrastructure manually can expose personnel to hazardous environments.
- Large disaster zones may require communication coverage over multiple locations.
- UAVs acting purely as communication relays are limited by their flight endurance and battery capacity.

AeroLink aims to overcome these limitations by **deploying communication nodes from UAVs instead of requiring the UAV itself to remain airborne as the communication relay**.

---

# 💡 Proposed Solution

AeroLink combines:

```text
UAV
+
Deployment Mechanism
+
Ground Communication Nodes
+
Wireless Mesh Network
+
Emergency Communication
+
Central Monitoring Dashboard
```

The UAV surveys the affected area and reaches a suitable deployment location.

A communication node is then released using a **deployment mechanism-assisted deployment mechanism**, allowing the UAV to release the payload without landing.

The node lands inside a protective deployment enclosure, initializes, and joins the existing ground mesh network.

Multiple deployed nodes can then relay information between one another, creating a temporary communication infrastructure across the disaster-affected region.

A command-center dashboard provides centralized monitoring of:

- Node locations
- Connectivity
- Node status
- Network health
- Emergency communication
- Battery information

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      UAV Platform    │
                         │                      │
                         │  Flight Controller   │
                         │  GPS                 │
                         │  Communication       │
                         │  Deployment System   │
                         └──────────┬───────────┘
                                    │
                            Aerial Deployment
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Ground Node        │
                         │                      │
                         │   ESP32 / MCU        │
                         │   Communication      │
                         │   GPS                │
                         │   Battery            │
                         │   Status Monitoring  │
                         └──────────┬───────────┘
                                    │
                              Wireless Mesh
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
           ┌────────────┐    ┌────────────┐    ┌────────────┐
           │  Ground    │    │  Ground    │    │  Ground    │
           │  Node N1   │◄──►│  Node N2   │◄──►│  Node N3   │
           └────────────┘    └────────────┘    └────────────┘
                  │                 │                 │
                  └─────────────────┼─────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Command Center     │
                         │                      │
                         │ Monitoring Dashboard │
                         │ Emergency Messages   │
                         │ Node Status          │
                         │ Network Health       │
                         └──────────────────────┘
```

---

# 🔄 Operational Workflow

```text
START
  │
  ▼
UAV Takes Off
  │
  ▼
Survey Disaster Area
  │
  ▼
Determine Deployment Location
  │
  ▼
Navigate to Location
  │
  ▼
Release Communication Node
  │
  ▼
Controlled Deployment-Assisted Descent
  │
  ▼
Node Lands
  │
  ▼
Node Initializes
  │
  ▼
Search for Nearby Nodes
  │
  ▼
Join Mesh Network
  │
  ▼
Transmit / Relay Packets
  │
  ▼
Network Operational
  │
  ▼
Update Command Center
```

---

# 🚁 UAV Deployment System

The UAV is responsible for transporting and deploying the communication node.

## Major UAV Components

### Flight Controller

Controls:

- Flight
- Navigation
- UAV movement
- Deployment positioning

### GPS

Provides UAV position information and assists with navigation and deployment positioning.

### Communication Module

Maintains communication between the UAV, deployed nodes, and command system where applicable.

### Deployment Mechanism

Releases the communication node at the selected location.

The design uses **controlled node deployment**, allowing the UAV to release the node without landing.

---

# 🪂 UAV-Based Controlled Node Deployment

AeroLink uses a controlled payload deployment mechanism to reduce the risk associated with direct payload dropping.

The basic process is:

```text
UAV reaches deployment location
          │
          ▼
Communication node released
          │
          ▼
Controlled Deployment deploys
          │
          ▼
Descent velocity reduced
          │
          ▼
Node reaches ground
          │
          ▼
Protective deployment box absorbs landing forces
```

This approach allows the UAV to remain airborne and continue its operation after releasing the communication node.

---

# 📦 Ground Communication Node

The ground node is the core communication element deployed into the disaster area.

The conceptual ground node contains:

- ESP32 / MCU
- Communication module
- GPS module
- Battery
- Status indicator
- Protective enclosure
- Antenna
- Supporting electronics

The node is designed to be compact, low-power, and suitable for rapid deployment.

---

# 🛡️ Stable Landing & Protective Enclosure

The ground node is housed inside a specially designed deployment enclosure.

The enclosure focuses on:

- Protecting the communication electronics
- Reducing landing impact
- Maintaining node stability
- Supporting field deployment

A **low center of gravity** is used to improve stability after landing.

---

# 📡 Ground Mesh Network

After deployment, the communication nodes search for nearby nodes and establish a multi-hop network.

Conceptually:

```text
             NODE 1
            /      \
           /        \
       NODE 2 ───── NODE 3
           \        /
            \      /
             NODE 4
```

Data does not necessarily need to travel directly from a remote node to the command center.

Instead, intermediate nodes can relay the information.

For example:

```text
Remote Area
     │
     ▼
  Node A
     │
     ▼
  Node B
     │
     ▼
  Node C
     │
     ▼
Command Center
```

This enables communication across a larger area using multiple deployed nodes.

---

# 📶 Networking Architecture

The final AeroLink architecture uses a **ground-node multi-hop communication network**. Each deployed node discovers nearby nodes and forwards emergency packets toward the command center. The final technical approach includes **LoRa-based long-range, low-power communication** for the ground communication system.

```text
Victim / Rescuer
       │
       ▼
Ground Node A
       │
       ▼
Ground Node B
       │
       ▼
Ground Node C
       │
       ▼
Command Center
```

### Final communication concept

| Connection | Technology / Layer | Purpose |
|---|---|---|
| Victim / Rescuer → Ground Node | Local Wi-Fi / BLE or SOS button | Submit or trigger emergency alert |
| Ground Node ↔ Ground Node | Multi-hop mesh + LoRa communication layer | Forward emergency packets |
| Ground Node → Command Center | Mesh backhaul / gateway path | Deliver alerts and node data |
| Command Center | React.js + Node.js + Express.js + Firebase + WebSocket | Monitor and manage the network |
| Map | OpenStreetMap | Display node locations |

### Firmware prototype vs. final architecture

The repository contains earlier ESP32 firmware prototypes (V0.0 and V1.1) that were developed to validate the ground-node communication concept. The current prototype code uses the earlier Wi-Fi/painlessMesh approach, while the **final AeroLink architecture presented in the project document includes LoRa, the SOS push-button interface, and the full React/Node.js/Firebase/OpenStreetMap command-center stack**.

This distinction keeps the repository history clear: the firmware versions document the development path, while the final architecture describes the intended integrated AeroLink system.

# 🆘 Emergency Communication

One of AeroLink's primary functions is to provide an emergency communication path when conventional infrastructure is unavailable.

A survivor can connect to a nearby communication node and submit an emergency message.

Conceptually:

```text
Survivor Smartphone
        │
        │ Wi-Fi
        ▼
Ground Node
        │
        │ Mesh
        ▼
Neighboring Node
        │
        ▼
Neighboring Node
        │
        ▼
Command Center
```

The emergency message can contain information such as:

- Emergency description
- Survivor requirements
- Originating node
- Node identification
- Location information

---

# 🌐 Survivor SOS Portal

The current ESP32 prototype provides a local web-based interface that allows a nearby device to submit an emergency message.

The communication flow is:

```text
Smartphone
    │
    │ Wi-Fi
    ▼
ESP32 Node
    │
    │ HTTP
    ▼
SOS Web Interface
    │
    ▼
Emergency Message
    │
    ▼
Mesh Network
```

The interface is designed to provide a simple method of transmitting an emergency message without requiring conventional Internet connectivity.

---

# 📊 Rescue / Command Dashboard

AeroLink includes a web-based monitoring interface for rescue personnel.

The current ESP32 prototype provides a dashboard that can display information received by the node.

The dashboard can include information such as:

- Time
- Origin node
- Node ID
- Emergency message
- Latitude
- Longitude

The dashboard can be accessed from a connected device using the node's local IP address.

---

# ⚡ Real-Time Dashboard Updates

The current ESP32 prototype uses **WebSockets** for real-time dashboard communication.

```text
ESP32 Node
    │
    │ WebSocket
    ▼
Browser Dashboard
```

When an SOS message is received, the ESP32 can push the information to connected dashboard clients without requiring a manual page refresh.

---

# 📍 Location Awareness

Location information is important for disaster-response operations.

Each communication node can be associated with a geographical location.

The current software prototype supports latitude and longitude metadata for development and testing.

Future versions can integrate an actual GPS module to obtain the physical node location automatically.

The long-term architecture is:

```text
GPS
 │
 ▼
Ground Node
 │
 ▼
Node Location
 │
 ├────────► Mesh
 │
 ▼
Command Center
 │
 ▼
Map / Dashboard
```

---

# 📶 Network Health Monitoring

Network health is important for determining whether the emergency communication infrastructure is functioning correctly.

The current prototype includes connectivity-related monitoring capabilities such as:

- Mesh connections
- Connected devices
- Wi-Fi RSSI
- Node information

Future versions can extend this to:

- Battery level
- Node uptime
- Link quality
- Neighbor availability
- Packet delivery status
- Network topology
- Node failure detection

---

# 💻 Technology Stack

## 🚁 UAV Tech Stack

- Flight Controller
- GPS Module
- Servo Motor for node-release mechanism
- Companion Computer
- Battery
- ESC
- BLDC Motors

## 📦 Ground Node Tech Stack

- ESP32
- Multi-hop mesh communication
- LoRa communication technology
- Li-ion battery
- SOS push button
- Local Wi-Fi interface
- BLE interface
- GPS / location support
- Protective enclosure

## 🖥️ Dashboard Tech Stack

- React.js — frontend and user interface
- Node.js + Express.js — backend and APIs
- Firebase — node and emergency-data storage
- OpenStreetMap — node-location visualization
- WebSocket — real-time updates

## 🔧 Prototype Firmware Stack

The repository's current firmware-development versions contain ESP32-based prototype code used to validate the ground-node communication concept. The prototype includes Wi-Fi, painlessMesh, web-server, WebSocket, and JSON-based communication components.

The prototype firmware should not be interpreted as the complete final hardware/software stack; the final architecture is described above.

# 🧩 Core Software Architecture

The ESP32 ground-node software can be divided into several functional blocks:

```text
┌───────────────────────────────────────┐
│             ESP32 NODE                │
├───────────────────────────────────────┤
│                                       │
│  Wi-Fi Connectivity                   │
│           │                           │
│           ▼                           │
│  Mesh Communication                   │
│           │                           │
│           ▼                           │
│  Emergency Message Handling           │
│           │                           │
│           ▼                           │
│  Local Message Storage                │
│           │                           │
│           ▼                           │
│  Web Server / SOS Portal              │
│           │                           │
│           ▼                           │
│  Rescue Dashboard                     │
│           │                           │
│           ▼                           │
│  WebSocket Real-Time Updates          │
│                                       │
└───────────────────────────────────────┘
```

---

# 🔁 Universal Ground Node Concept

AeroLink follows a decentralized ground-node philosophy.

A deployed node is not intended to be a simple endpoint.

Each node can participate in the communication network and relay information.

```text
        ┌────────────┐
        │   NODE A   │
        └─────┬──────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
 ┌──────────┐   ┌──────────┐
 │  NODE B  │◄─►│  NODE C  │
 └──────────┘   └────┬─────┘
                     │
                     ▼
                ┌──────────┐
                │  NODE D  │
                └──────────┘
```

This enables additional nodes to be added as the affected area grows.

---

# 📈 Scalability

AeroLink is designed to support expansion by deploying additional nodes.

For example:

```text
Small Area

    Node A ─── Node B ─── Command Center
```

can become:

```text
Large Area

 Node A ─── Node B ─── Node C
    │          │          │
 Node D ─── Node E ─── Node F
               │
               ▼
        Command Center
```

Additional UAVs can also be used to deploy more nodes when required.

This creates a scalable communication infrastructure for larger disaster-affected regions.

---

# 📏 Research & Reference Results

The final project document references research and field results relevant to UAV communication and emergency mesh networking. These values are **reference results from external studies/prototypes, not AeroLink performance claims**.

### Emergency mesh field prototype

- **280 m** maximum hop distance using IEEE 802.11n
- **290 m** maximum hop distance using IEEE 802.11ac
- **220 m** hop distance under interference using IEEE 802.11n

The referenced prototype involved **2 UAVs and 3 Raspberry Pi-based nodes**.

### UAV communication field trial

The project document also references a public-safety UAV communication field trial reporting:

- **>1,000 m** UAV-based communication coverage
- **<600 m** ground coverage in the same trial
- **>50 Mbps** throughput below 300 m
- **30 Mbps** at 900 m
- **40–75 ms** typical RTT at approximately 350 m

These measurements are included to provide research context and should not be treated as guaranteed AeroLink specifications.

---

# 🧪 Development Versions

## V0.0 — Initial Mesh Prototype

The initial software prototype focused on establishing the fundamental communication architecture.

### Implemented Concepts

- ESP32-based communication nodes
- Wi-Fi mesh networking
- painlessMesh
- Node identification
- SOS message generation
- SOS message broadcasting
- SOS message reception
- Local SOS message history
- Web-based SOS interface
- Rescue dashboard
- WebSocket-based live updates

The purpose of V0.0 was to validate the basic concept of communication between multiple ESP32 ground nodes.

---

# 🔹 V1.1 — Enhanced Ground Node Prototype

V1.1 builds on the initial communication architecture.

### Added Capabilities

- Node latitude and longitude metadata
- Location information in emergency messages
- Location display in the monitoring interface
- Connected-device RSSI monitoring
- Improved network diagnostics
- Enhanced node information

V1.1 is an intermediate prototype toward a more complete AeroLink communication node.

---

# 📊 Version Comparison

| Feature | V0.0 | V1.1 |
|---|:---:|:---:|
| ESP32 Ground Node | ✅ | ✅ |
| Wi-Fi Communication | ✅ | ✅ |
| painlessMesh | ✅ | ✅ |
| Multi-Node Networking | ✅ | ✅ |
| SOS Portal | ✅ | ✅ |
| SOS Broadcasting | ✅ | ✅ |
| SOS Reception | ✅ | ✅ |
| Node Identification | ✅ | ✅ |
| Local SOS History | ✅ | ✅ |
| Rescue Dashboard | ✅ | ✅ |
| WebSocket Updates | ✅ | ✅ |
| Node Coordinates | ❌ | ✅ |
| Location in SOS Data | ❌ | ✅ |
| RSSI Monitoring | ❌ | ✅ |
| Real GPS Integration | ❌ | 🔵 Planned |
| Interactive Map | ❌ | 🔵 Planned |
| ESP-NOW Mesh | ❌ | 🔵 Future |
| UAV Deployment Integration | 🔵 Concept | 🔵 Future |
| Central Network Monitoring | Prototype | 🔵 Expanding |

---

# 🧪 Prototype Testing

The communication-node prototype can be tested independently before integration with the complete UAV deployment system.

## Test 1 — Single Ground Node

1. Flash the ESP32 firmware.
2. Power the node.
3. Connect a smartphone to the node's Wi-Fi network.
4. Open the SOS interface.
5. Submit an emergency message.
6. Verify that the message is received.
7. Open the dashboard.
8. Verify that the emergency message appears.

---

## Test 2 — Multiple Ground Nodes

Deploy multiple ESP32 nodes.

Example:

```text
NODE_A
NODE_B
NODE_C
NODE_D
```

Verify:

- Node discovery
- Mesh connectivity
- Node identification
- SOS propagation
- Message reception
- Dashboard updates

---

## Test 3 — RSSI Testing

Connect a device to a ground node and monitor its Wi-Fi signal strength.

RSSI measurements can be used during field testing to understand connectivity conditions.

---

## Test 4 — Multi-Hop Communication

Place nodes at different positions.

Verify that an emergency message can travel through intermediate nodes.

```text
NODE A
  │
  ▼
NODE B
  │
  ▼
NODE C
  │
  ▼
COMMAND CENTER
```

This validates the fundamental multi-hop communication concept.

---

# ⚙️ Feasibility

## Technical Feasibility

AeroLink uses readily available embedded hardware and communication technologies.

The communication node is based on an ESP32/MCU platform, while wireless mesh networking provides multi-hop communication between deployed nodes.

---

## Operational Feasibility

UAV deployment can reduce the need for personnel to manually enter hazardous or inaccessible areas.

Nodes can be deployed at strategically selected locations depending on communication requirements.

---

## Economic Feasibility

The system is based on commercially available and modular components.

A modular node design allows additional nodes to be added as network requirements increase.

---

## Financial Viability

AeroLink can reduce the dependence on manually deployed temporary communication infrastructure.

UAVs and communication nodes can be reused across multiple disaster-response operations.

---

## Sustainability & Scalability

The architecture supports:

- Reusable UAVs
- Reusable communication nodes
- Additional node deployment
- Multi-UAV operation
- Expandable communication coverage

---

## Market / Operational Viability

The system can be useful in environments where conventional communication infrastructure is damaged or unavailable.

Potential applications include:

- Natural disasters
- Flood-affected regions
- Earthquake-affected areas
- Landslide zones
- Remote emergency operations
- Search-and-rescue operations
- Temporary disaster-response communication

---

# 🌍 Impact & Benefits

## 🚨 Disaster Response

AeroLink aims to rapidly establish temporary communication infrastructure across disaster-affected areas.

This can reduce communication delays during the initial stages of rescue operations.

---

## 📡 Communication Resilience

The system provides an independent communication layer when conventional communication infrastructure becomes unavailable.

---

## 🚑 Rescue Operations

Continuous communication between field teams and command centers can improve coordination across affected locations.

---

## 🛡️ Responder Safety

UAVs can deploy nodes into hazardous or inaccessible areas, reducing the need for rescue personnel to immediately enter communication-dead zones.

---

## 🗺️ Disaster Area Coverage

Multiple deployed nodes can establish connectivity across a larger affected region.

Additional nodes can be deployed as communication requirements change.

---

## 📋 Emergency Coordination

The command center can monitor:

- Node status
- Connectivity
- Network health
- Emergency messages
- Node locations

---

## ⚡ Rapid Deployment

UAVs can quickly transport communication nodes to affected locations.

Controlled Deployment-assisted deployment allows the node to be released without requiring the UAV to land.

---

## 🔗 Reliable Connectivity

Ground nodes provide persistent communication after deployment, while multi-hop networking allows information to travel through multiple nodes.

---

## 💰 Cost Efficiency

The system uses commercially available and modular hardware components.

The architecture can be expanded gradually instead of requiring a large fixed communication infrastructure.

---

# 🔬 Research & Engineering Areas

AeroLink combines multiple engineering domains.

## UAV Technology

Research areas include:

- UAV platforms
- Flight controllers
- GPS systems
- Payload capacity
- Navigation
- Deployment mechanisms

---

## Embedded Systems

The ground communication node uses an ESP32/MCU-based embedded architecture.

Research areas include:

- Low-power operation
- Wireless communication
- Embedded processing
- Node monitoring
- Emergency data transmission

---

## Wireless Communication

Research focuses on:

- Wireless mesh networking
- Multi-hop communication
- Node discovery
- Emergency packet forwarding
- Network scalability

---

## Mechanical Design

Research includes:

- Controlled Deployment-assisted delivery
- Payload protection
- Center-of-gravity optimization
- Landing stability
- Protective enclosure design

---

## Power Systems

Power considerations include:

- UAV battery requirements
- Ground-node battery requirements
- Power consumption
- Operating time
- Field deployment endurance

---

# 🔮 Future Development Roadmap

```text
                 AEROLINK
                    │
                    ▼
          ┌──────────────────┐
          │ V0.0 Mesh        │
          │ Prototype        │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ V1.1 Enhanced    │
          │ Ground Node      │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ ESP-NOW / Custom │
          │ Mesh Development │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ GPS Integration  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Interactive      │
          │ Rescue Map       │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Secure Emergency │
          │ Communication    │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ UAV Deployment   │
          │ Integration      │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Complete UAV +   │
          │ Ground Mesh      │
          │ System           │
          └──────────────────┘
```

---

# 🔮 Planned Improvements

## 📍 Real GPS Integration

Replace predefined node coordinates with actual GPS hardware.

---

## 🗺️ Interactive Command-Center Map

Display deployed nodes and emergency locations on a real-time map.

---

## 🔐 Secure Communication

Future versions should include:

- Authentication
- Encryption
- Message integrity
- Secure dashboard access
- Role-based access

---

## 🆔 Unique Emergency Message IDs

Each emergency message can be assigned a unique identifier.

Example:

```text
SOS-000001
SOS-000002
SOS-000003
```

This can help prevent duplicate processing and improve message tracking.

---

## ✅ Message Acknowledgement

Future versions can provide confirmation that an emergency message successfully reached the command center.

```text
Survivor
   │
   ▼
Node A
   │
   ▼
Node B
   │
   ▼
Command Center
   │
   └──────── ACK ────────► Survivor / Node
```

---

## 🔋 Battery Monitoring

Ground nodes can report:

- Battery percentage
- Battery voltage
- Power status
- Estimated operating time

---

## 📊 Advanced Network Monitoring

Future dashboards can provide:

- Network topology
- Node health
- RSSI
- Battery
- Uptime
- Link quality
- Neighbor nodes
- Packet delivery
- Node failure detection

---

## 🛩️ Multi-UAV Deployment

Multiple UAVs can operate together to deploy communication nodes over large disaster-affected regions.

```text
          UAV 1                 UAV 2
            │                     │
            ▼                     ▼
         Node A                 Node D
            │                     │
            ▼                     ▼
         Node B ─────────────── Node C
                    │
                    ▼
              Command Center
```

---

# ⚠️ Current Prototype Limitations

AeroLink is currently a research and prototype-stage system.

The following areas require further development before real-world emergency deployment:

### Communication Reliability

Real-world environments can introduce:

- Interference
- Obstacles
- Signal attenuation
- Node failures
- Network congestion

### Power Constraints

Both UAVs and ground nodes operate under battery limitations.

Power optimization is therefore critical for field deployment.

### GPS Accuracy

Accurate positioning is important for locating deployed nodes and emergency sources.

### Mechanical Reliability

The UAV deployment mechanism and protective enclosure require extensive physical testing.

### Network Security

Emergency communication may contain sensitive information and therefore requires appropriate authentication and encryption.

### Environmental Durability

Ground nodes would need protection against:

- Dust
- Water
- Impact
- Temperature
- Vibration
- Harsh terrain

---

# 🧠 Design Philosophy

AeroLink is based on five core principles:

### 1. Rapid Deployment

Communication infrastructure should be deployable quickly in disaster zones.

### 2. Decentralization

The communication network should not depend on a single ground node.

### 3. Multi-Hop Connectivity

Nodes should be able to relay information through neighboring nodes.

### 4. Scalability

Additional nodes and UAVs should be deployable as the affected area expands.

### 5. Remote Monitoring

Rescue teams should be able to monitor the network without physically entering hazardous areas.

---

# 🌐 Overall System Flow

```text
                 DISASTER OCCURS
                        │
                        ▼
              Communication Failure
                        │
                        ▼
                 UAV Surveys Area
                        │
                        ▼
             Select Deployment Point
                        │
                        ▼
             UAV Deploys Ground Node
                        │
                        ▼
                Node Lands Safely
                        │
                        ▼
                 Node Initializes
                        │
                        ▼
             Searches Nearby Nodes
                        │
                        ▼
                Joins Ground Mesh
                        │
                        ▼
          ┌──────────────────────────┐
          │    EMERGENCY NETWORK     │
          │                          │
          │ Node ─ Node ─ Node       │
          │   \      │      /        │
          │    ─── Node ───          │
          └──────────┬───────────────┘
                     │
                     ▼
              Emergency Data
                     │
                     ▼
              Command Center
                     │
                     ▼
            Rescue Team Response
```

---

# 📁 Repository Structure

```text
AeroLink/
│
├── README.md
│
├── V0.0/
│   └── AeroLink_V0.0.ino
│
├── V1.1/
│   └── AeroLink_V1.1.ino
│
├── Documentation/
│   ├── Architecture/
│   ├── Testing/
│   └── Research/
│
├── Hardware/
│   ├── Ground_Node/
│   ├── UAV/
│   └── Deployment_Mechanism/
│
└── Media/
    ├── Images/
    └── Demo/
```

> **Note:** This is the recommended organization for the repository. Folder names can be updated as the actual AeroLink repository evolves.

---

# 📌 Project Status

| Component | Status |
|---|:---:|
| AeroLink Concept | 🟢 Defined |
| Ground Node Prototype | 🟢 Developed |
| V0.0 Firmware | 🟢 Available |
| V1.1 Firmware | 🟢 Available |
| Ground Mesh Architecture | 🟢 Defined |
| ESP32 Ground Node | 🟢 Prototype |
| SOS Communication | 🟢 Prototype |
| UAV Architecture | 🟡 Development |
| GPS-Based Deployment | 🟡 Development |
| Controlled Deployment Deployment | 🟡 Development |
| Low-CG Protective Enclosure | 🟡 Development |
| LoRa Communication | 🟡 Development |
| SOS Push Button | 🟡 Development |
| React Dashboard | 🟡 Development |
| Node.js + Express Backend | 🟡 Development |
| Firebase Integration | 🟡 Development |
| OpenStreetMap Integration | 🟡 Development |
| WebSocket Monitoring | 🟡 Development |
| Multi-UAV Deployment | 🔵 Future |
| Advanced Network Monitoring | 🔵 Future |
| Full Integrated Field System | 🔵 Future |

# 🏆 Project Vision

AeroLink aims to create a rapidly deployable communication infrastructure for disaster-response environments where conventional communication systems have failed.

Instead of depending on a continuously airborne UAV relay, AeroLink uses UAVs to **deploy ground communication nodes**, allowing the UAV to continue its mission while the deployed nodes establish a persistent multi-hop communication network.

```text
        UAV
         │
         ▼
   RAPID DEPLOYMENT
         │
         ▼
   GROUND NODES
         │
         ▼
    MESH NETWORK
         │
         ▼
EMERGENCY COMMUNICATION
         │
         ▼
 COMMAND CENTER
         │
         ▼
  RESCUE RESPONSE
```

---

# 🚁 AeroLink

### Emergency Mesh Network

**Deploy. Connect. Communicate. Respond.**

---

## 📜 Project Information

**Project:** AeroLink  
**Event:** Smart India Hackathon 2026  
**Problem Statement ID:** 26223  
**Problem Statement:** UAV-Deployable Emergency Communication Network  
**Theme:** Student Innovation – Disaster Management  
**Category:** Hardware  
**Team:** Apex

---

## ⚠️ Disclaimer

AeroLink is currently a prototype/research project developed for Smart India Hackathon 2026 and engineering experimentation.

The system should not be considered a certified life-safety communication system.

Real-world deployment would require extensive testing, validation, safety assessment, communication reliability testing, UAV flight testing, mechanical testing, cybersecurity evaluation, regulatory compliance, and field trials.
---
# AeroLink Command

Build AeroLink — a Ground Control Station (GCS) dashboard for a disaster-response system (SIH 2026, PS ID 26223). Real system context, for accuracy — do not invent features beyond this:

UAVs drop hardened relay nodes (ESP32 + LoRa/TTGO) into disaster zones.

Each node broadcasts a local EMERGENCY_SOS_WIFI captive portal so survivors can submit SOS + triage info from their own phone — that portal is separate embedded firmware, NOT part of this app.

Nodes relay data to each other and back to this dashboard over a self-healing LoRa mesh (multi-hop).

A Django REST API (endpoints TBD, using placeholders below) is the data source for this dashboard.

This is an operator/command-center tool used by rescue teams, not a public-facing app. No marketing landing page, no signup flow, no auth screen unless told otherwise.

Tech stack

React + TypeScript + Tailwind CSS

Dark theme only — this is a 24/7 command-center tool, not a consumer app. Think ops/NOC dashboard aesthetic: near-black background, high-contrast status colors, monospace for coordinates/IDs/timestamps.

No backend framework — this app will call a REST API. For now, mock the API responses locally using the exact TypeScript interfaces below, structured so swapping in real fetch calls later requires no data-shape changes.

Data model (use these exact shapes)

interface Node {
  id: string;              // e.g. "N1"
  lat: number;
  lng: number;
  status: "online" | "degraded" | "offline";
  batteryPercent: number;  // 0-100
  lastSeen: string;        // ISO timestamp
  connectedTo: string[];   // IDs of peer nodes currently linked (mesh edges)
}

interface SOSMessage {
  id: string;
  nodeId: string;          // which node relayed this message
  timestamp: string;       // ISO timestamp
  message: string;         // free-text SOS content
  coordinates: { lat: number; lng: number };
  triageStatus: "critical" | "injured" | "stable" | "unknown";
}


Generate realistic mock data: 4-6 nodes in a rough geographic cluster (simulate a disaster zone), a handful with degraded/offline status and missing connectedTo links to demonstrate mesh self-healing, and 5-10 SOS messages spread across nodes with varied triage statuses and timestamps over the last hour.

Pages / layout

Single main dashboard view (no multi-page nav needed unless it gets crowded):

Top status bar — network health summary: total nodes, nodes online/degraded/offline, total active links, last update time.

Mesh map/graph panel (primary, largest panel) — nodes plotted as points (use lat/lng on a simple map, or a force-directed graph if a real map is overkill for the demo) with lines drawn between nodes listed in each other's connectedTo. Color-code nodes by status: green=online, yellow=degraded, red=offline. This panel is the single most important thing on the screen — it's the visual proof the mesh is self-healing when a node drops.

Node list panel (sidebar) — scrollable list of all nodes with id, status badge, battery %, last seen. Clicking a node highlights it on the map panel.

SOS/Triage feed panel — reverse-chronological list of incoming messages, each showing node id, timestamp, triage status (color-coded badge), coordinates, and message text. This is the emotionally resonant part of the demo — make triage status visually unmissable (critical = red pulse/highlight).

Behavior requirements

Simulate live updates: every few seconds, randomly jitter a node's battery down slightly, occasionally flip a node's status, occasionally push a new mock SOS message — so the dashboard looks alive during a demo even without a real backend connected yet.

Add a small toggle or config flag (e.g. USE_MOCK_DATA = true) clearly separated from the rest of the code, so swapping to real API calls later is a one-line change, not a rewrite.

No login/auth, no settings page, no user management — out of scope.

Explicit constraints

Don't add features not described above (no chat, no analytics history charts, no admin panel) — this is a focused ops dashboard, not a general SaaS product.

Don't default to a light theme or add a marketing hero section — this opens directly into the dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aerolinkmesh.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b80e7789-d4e4-41a1-8b21-9fd2d2a0905b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
