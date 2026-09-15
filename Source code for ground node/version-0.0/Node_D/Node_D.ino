#include "painlessMesh.h"
#include <WiFi.h>
#include <DNSServer.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncWebSocket.h>
#include <ArduinoJson.h>   // Library Manager: "ArduinoJson" by Benoit Blanchon

// ============================================================
// UNIVERSAL NODE — flash this SAME sketch onto every ESP32.
// Every node can:
//   - accept SOS submissions from nearby survivors on "/"
//   - broadcast those SOS messages into the mesh
//   - receive SOS broadcasts from every other node
//   - show a live dashboard of everything it has seen on "/dashboard"
// There is no dedicated "base station" board — any node, anywhere in
// the mesh, doubles as a control dashboard the moment someone connects
// to it and opens /dashboard.
// ============================================================

#define MESH_PREFIX     "EMERGENCY_SOS_WIFI"   // survivors + rescue team both connect here
#define MESH_PASSWORD   ""                      // EMPTY = open network, no password prompt for survivors.
                                                 // Trade-off: mesh backbone traffic between nodes is also
                                                 // unencrypted this way, and anyone in range can join the
                                                 // network (not just survivors). See notes below the code.
#define MESH_PORT       5555
#define MESH_CHANNEL    1

// ---------- IMPORTANT: change this ONE line before flashing each board ----------
// Give every physical node a unique, human-readable label — ideally tied to
// where it will be deployed (e.g. "GATE_3", "SHELTER_NORTH", "NODE_A").
// This label travels with every SOS message so the dashboard can tell you
// exactly which physical node — and therefore which area — a survivor is near.
#define NODE_LABEL      "NODE_D"

// ---------- Globals ----------
Scheduler userScheduler;
painlessMesh mesh;
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
DNSServer dnsServer;

// Rolling log of everything this node has seen (its own SOS sends + everything received from the mesh)
#define MAX_LOG 50
struct LogEntry {
  uint32_t fromNode;
  String   fromLabel;
  String   text;
  unsigned long millisReceived;
};
LogEntry messageLog[MAX_LOG];
int logCount = 0;
int logHead = 0;

// ---------- Node label directory ----------
// painlessMesh only knows raw node IDs — it has no concept of our labels.
// Every node periodically (and immediately on new connections) broadcasts
// its own label; everyone else remembers it here so IDs can be resolved
// to human-readable names as soon as possible.
#define MAX_KNOWN_NODES 20
struct NodeInfo {
  uint32_t id;
  String   label;
};
NodeInfo knownNodes[MAX_KNOWN_NODES];
int knownNodeCount = 0;

// Returns "" if the label for this id isn't known yet
String lookupLabel(uint32_t id) {
  for (int i = 0; i < knownNodeCount; i++) {
    if (knownNodes[i].id == id) return knownNodes[i].label;
  }
  return "";
}

// Adds or updates a label for a given node id. Returns true if this was NEW info.
bool rememberLabel(uint32_t id, const String &label) {
  for (int i = 0; i < knownNodeCount; i++) {
    if (knownNodes[i].id == id) {
      bool changed = knownNodes[i].label != label;
      knownNodes[i].label = label;
      return changed;
    }
  }
  if (knownNodeCount < MAX_KNOWN_NODES) {
    knownNodes[knownNodeCount++] = { id, label };
    return true;
  }
  return false; // directory full — rare with a small deployed mesh
}

void sendAnnounce(uint32_t toSingleNode = 0) {
  StaticJsonDocument<256> doc;
  doc["type"]  = "announce";
  doc["label"] = NODE_LABEL;
  doc["id"]    = mesh.getNodeId();
  String out;
  serializeJson(doc, out);
  if (toSingleNode) {
    mesh.sendSingle(toSingleNode, out);
  } else {
    mesh.sendBroadcast(out);
  }
}

// Periodic re-announce so any node that joins late, or missed an earlier
// announce, eventually learns everyone's label anyway
Task taskAnnounce(TASK_SECOND * 8, TASK_FOREVER, []() { sendAnnounce(); });

void addToLog(uint32_t from, const String &fromLabel, const String &text) {
  int idx = (logHead + logCount) % MAX_LOG;
  if (logCount < MAX_LOG) {
    logCount++;
  } else {
    logHead = (logHead + 1) % MAX_LOG; // overwrite oldest
  }
  messageLog[idx] = { from, fromLabel, text, millis() };
}

void broadcastMessageToLocalDashboard(uint32_t from, const String &fromLabel, const String &text) {
  StaticJsonDocument<512> doc;
  doc["type"]  = "message";
  doc["from"]  = from;
  doc["label"] = fromLabel;
  doc["text"]  = text;
  doc["ms"]    = millis();
  String out;
  serializeJson(doc, out);
  ws.textAll(out); // pushes to anyone viewing THIS node's dashboard right now
}

void broadcastTopologyToLocalDashboard() {
  StaticJsonDocument<256> doc;
  doc["type"] = "topology";
  doc["nodeCount"] = mesh.getNodeList().size() + 1; // +1 = include this node itself
  doc["thisNode"] = mesh.getNodeId();
  doc["thisLabel"] = NODE_LABEL;
  String out;
  serializeJson(doc, out);
  ws.textAll(out);
}

void sendHistoryTo(AsyncWebSocketClient *client) {
  StaticJsonDocument<4096> doc;
  doc["type"] = "history";
  JsonArray arr = doc.createNestedArray("messages");
  for (int i = 0; i < logCount; i++) {
    int idx = (logHead + i) % MAX_LOG;
    JsonObject o = arr.createNestedObject();
    o["from"]  = messageLog[idx].fromNode;
    o["label"] = messageLog[idx].fromLabel;
    o["text"]  = messageLog[idx].text;
    o["ms"]    = messageLog[idx].millisReceived;
  }
  String out;
  serializeJson(doc, out);
  client->text(out);
}

// ---------- Survivor-facing SOS form ----------
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EMERGENCY SOS SYSTEM</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; background-color: #1a1a1a; color: white; padding: 20px; }
    h2 { color: #ff3333; }
    textarea { width: 90%; max-width: 400px; height: 100px; border-radius: 5px; padding: 10px; font-size: 16px; }
    button { background-color: #ff3333; color: white; border: none; padding: 15px 30px; font-size: 18px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
  </style>
</head>
<body>
  <h2>⚠️ EMERGENCY SOS PORTAL</h2>
  <p>Your message will be routed directly to the Search & Rescue Team.</p>
  <form action="/send" method="GET">
    <textarea name="msg" placeholder="Type your name, location, condition, and needs here..." required></textarea><br>
    <button type="submit">SEND SOS TEXT</button>
  </form>
</body>
</html>
)rawliteral";

const char success_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial;text-align:center;background:#1a1a1a;color:white;padding:50px;}</style></head>
<body>
  <h2 style="color:#00ff00;">✅ SOS TRANSMITTED!</h2>
  <p>Your text has entered the self-healing mesh. Keep your phone close to this node.</p>
  <a href="/" style="color:#ff3333; text-decoration:none;">Send another message</a>
</body>
</html>
)rawliteral";

// ---------- Rescue-team-facing dashboard ----------
const char dashboard_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SOS Mesh Dashboard</title>
<style>
  body { font-family: Arial, sans-serif; background:#0d0d0d; color:#eee; margin:0; padding:20px; }
  h1 { color:#ff3333; margin-bottom:5px; }
  #status { font-size:14px; margin-bottom:15px; }
  .connected { color:#00ff00; }
  .disconnected { color:#ff3333; }
  table { width:100%; border-collapse:collapse; }
  th, td { border-bottom:1px solid #333; padding:10px; text-align:left; font-size:14px; }
  th { color:#ff3333; }
  tr:hover { background:#1a1a1a; }
  .newmsg { animation: flash 1.2s ease-out; }
  @keyframes flash { from { background:#ff3333; } to { background:transparent; } }
  #meta { color:#888; font-size:12px; margin-bottom:10px; }
</style>
</head>
<body>
  <h1>⚠️ SOS MESH DASHBOARD</h1>
  <div id="status">Connecting... | Nodes in mesh: <span id="nodeCount">-</span></div>
  <div id="meta">Viewing via node: <span id="thisLabel">-</span> (ID: <span id="thisNode">-</span>) — any node in the mesh shows the same log</div>
  <table>
    <thead><tr><th>Time (ms)</th><th>Origin Node</th><th>Origin ID</th><th>Message</th></tr></thead>
    <tbody id="log"></tbody>
  </table>
<script>
let ws;
function connect() {
  ws = new WebSocket("ws://" + location.host + "/ws");
  ws.onopen = () => {
    document.getElementById("status").innerHTML =
      '<span class="connected">● Connected</span> | Nodes in mesh: <span id="nodeCount">-</span>';
  };
  ws.onclose = () => {
    document.getElementById("status").innerHTML =
      '<span class="disconnected">● Disconnected — retrying...</span>';
    setTimeout(connect, 2000);
  };
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.type === "message") {
      addRow(data.from, data.label, data.text, data.ms, true);
    } else if (data.type === "history") {
      data.messages.forEach(m => addRow(m.from, m.label, m.text, m.ms, false));
    } else if (data.type === "topology") {
      document.getElementById("nodeCount").textContent = data.nodeCount;
      document.getElementById("thisNode").textContent = data.thisNode;
      document.getElementById("thisLabel").textContent = data.thisLabel;
    }
  };
}
function addRow(from, label, text, ms, isNew) {
  const tbody = document.getElementById("log");
  const row = document.createElement("tr");
  if (isNew) row.className = "newmsg";
  const displayLabel = label && label.length ? label : "(unlabeled)";
  row.innerHTML = `<td>${ms}</td><td><b>${displayLabel}</b></td><td>${from}</td><td>${text}</td>`;
  tbody.insertBefore(row, tbody.firstChild);
}
connect();
</script>
</body>
</html>
)rawliteral";

// ---------- WebSocket connection handler ----------
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.printf("🖥️  Dashboard viewer connected: #%u\n", client->id());
    sendHistoryTo(client);
    broadcastTopologyToLocalDashboard();
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.printf("🖥️  Dashboard viewer disconnected: #%u\n", client->id());
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  // 1. Join the mesh. Its own AP IS the shared survivor + rescue-team network —
  //    no separate softAP() call, since a node can only broadcast one AP identity.
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT, WIFI_AP_STA, MESH_CHANNEL);

  // 2. Every mesh broadcast lands here — could be an SOS message or a
  //    label announcement, distinguished by the "type" field.
  mesh.onReceive([](uint32_t from, String &msg) {
    StaticJsonDocument<512> in;
    DeserializationError err = deserializeJson(in, msg);

    String msgType = (!err && in.containsKey("type")) ? String((const char*)in["type"]) : "sos"; // old/plain payloads assumed SOS

    if (msgType == "announce") {
      String label = in["label"] | "(unlabeled)";
      bool isNew = rememberLabel(from, label);
      if (isNew) {
        Serial.printf("🏷️  Node ID %u identified as \"%s\"\n", from, label.c_str());
      }
      return; // announcements don't get logged as SOS messages
    }

    // Otherwise treat as an SOS message
    String originLabel = "(unlabeled)";
    String messageText = msg; // fallback: show raw payload if it isn't valid JSON
    if (!err) {
      originLabel = in["label"] | "(unlabeled)";
      messageText = in["msg"]   | msg;
    }
    rememberLabel(from, originLabel); // learn the label from the SOS payload too, no need to wait for a separate announce

    Serial.println("\n========================================");
    Serial.printf("📥 SOS RECEIVED — Origin: %s (Node ID: %u)\n", originLabel.c_str(), from);
    Serial.println(messageText);
    Serial.println("========================================");

    addToLog(from, originLabel, messageText);
    broadcastMessageToLocalDashboard(from, originLabel, messageText); // push live to anyone viewing THIS node's dashboard
  });

  mesh.onNewConnection([](uint32_t nodeId) {
    String known = lookupLabel(nodeId);
    if (known.length()) {
      Serial.printf("🔗 New mesh connection — Node ID %u (\"%s\")\n", nodeId, known.c_str());
    } else {
      Serial.printf("🔗 New mesh connection — Node ID %u (label not yet known, resolving...)\n", nodeId);
    }
    sendAnnounce(nodeId); // tell the new node our own label right away, don't wait for the periodic broadcast
    broadcastTopologyToLocalDashboard();
  });

  mesh.onChangedConnections([]() {
    Serial.printf("🔄 Total connected nodes: %d\n", mesh.getNodeList().size());
    broadcastTopologyToLocalDashboard();
  });

  // 3. Captive portal DNS — auto-redirects survivor phones to the SOS form
  dnsServer.start(53, "*", WiFi.softAPIP());

  // 3b. Start periodic label announcements (also fires once immediately)
  userScheduler.addTask(taskAnnounce);
  taskAnnounce.enable();
  sendAnnounce(); // announce immediately on boot too, don't wait 8s for the first one

  // 4. Web server routes
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  server.on("/dashboard", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", dashboard_html);
  });

  server.on("/generate_204", HTTP_GET, [](AsyncWebServerRequest *request){ request->send_P(200, "text/html", index_html); });
  server.on("/redirect", HTTP_GET, [](AsyncWebServerRequest *request){ request->send_P(200, "text/html", index_html); });

  server.on("/send", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("msg")) {
      String textToSend = request->getParam("msg")->value();

      // Build a structured JSON payload so this node's label travels with
      // the message across the mesh, not just in this node's own log.
      StaticJsonDocument<512> out;
      out["type"]  = "sos";
      out["label"] = NODE_LABEL;
      out["id"]    = mesh.getNodeId();
      out["msg"]   = textToSend;
      String payload;
      serializeJson(out, payload);

      Serial.println("\n----------------------------------------");
      Serial.printf("📤 LOCAL SEND — Origin: %s (Node ID: %u)\n", NODE_LABEL, mesh.getNodeId());
      Serial.println(textToSend);
      Serial.printf("Connected mesh nodes right now: %d\n", mesh.getNodeList().size());
      Serial.println("----------------------------------------");

      bool sent = mesh.sendBroadcast(payload);
      Serial.printf("Broadcast result: %s\n", sent ? "OK" : "FAILED");

      // sendBroadcast does NOT loop back to this node's own onReceive, so we
      // log it locally ourselves — otherwise this node's own dashboard would
      // never show SOS messages that originated from itself.
      addToLog(mesh.getNodeId(), NODE_LABEL, textToSend);
      broadcastMessageToLocalDashboard(mesh.getNodeId(), NODE_LABEL, textToSend);

      request->send_P(200, "text/html", success_html);
    } else {
      request->send(400, "text/plain", "Bad Request");
    }
  });

  // Captive portal fallback for any unmatched path — survivor phones land on the SOS form
  server.onNotFound([](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  // 5. WebSocket for live dashboard updates
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.begin();
  Serial.println("🚒 Universal Mesh Node Ready-> SYSTEM ONLINE");
  Serial.printf("Node Label: %s   |   Node ID: %u\n", NODE_LABEL, mesh.getNodeId());
  Serial.print("Connect to Wi-Fi: "); Serial.println(MESH_PREFIX);
  Serial.print("Node IP: "); Serial.println(WiFi.softAPIP());
  Serial.println("Survivors -> http://<node IP>/         (SOS form, auto-popup via captive portal)");
  Serial.println("Rescue team -> http://<node IP>/dashboard   (live log, works from ANY node)");
}

void loop() {
  mesh.update();
  dnsServer.processNextRequest();
  ws.cleanupClients();
}
