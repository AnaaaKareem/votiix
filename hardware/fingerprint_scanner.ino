#include <Adafruit_Fingerprint.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <Keypad.h>
#include <WiFi.h>

const byte ROWS = 4;
const byte COLS = 3;

char keys[ROWS][COLS] = {
    {'1', '2', '3'}, {'4', '5', '6'}, {'7', '8', '9'}, {'*', '0', '#'}};

byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

const char *WIFI_SSID = "Ahmed Nadel";
const char *WIFI_PASS = "ahmed191968";
int currentUserID = -1;
bool isWaitingForVote = false;
const String SERVER_IP = "192.168.1.10";
const String DEVICE_CODE = "esp32-01";

const String VERIFY_API = "http://" + SERVER_IP + ":3001/verify-fingerprint";
const String ENROLL_NEXT_API =
    "http://" + SERVER_IP + ":3001/enrollment/next?device_code=" + DEVICE_CODE;
const String ENROLL_COMPLETE_API =
    "http://" + SERVER_IP + ":3001/enrollment/complete";
const String VOTE_API = "http://" + SERVER_IP + ":3001/api/vote";

static const int RX_PIN = 16;
static const int TX_PIN = 17;
static const int FP_BAUD = 57600;

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger(&mySerial);

unsigned long lastEnrollCheck = 0;
const unsigned long enrollCheckInterval =
    4000; // Check for new users every 5 seconds

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("\n--- Starting Smart Fingerprint System ---");

  mySerial.begin(FP_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);
  finger.begin(FP_BAUD);

  delay(500); // CRITICAL: Give sensor half a second to boot up before checking
              // password!

  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found!");
    finger.getTemplateCount();
    Serial.printf("Stored templates: %d\n", finger.templateCount);
  } else {
    Serial.println("Fingerprint sensor not found :(");
    while (1) {
      delay(1);
    } // Halt system if sensor fails
  }

  // 2. Connect to Wi-Fi SECOND
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("\nSystem Ready. Place finger to verify, or use Postman to "
                 "trigger enrollment.");
}

void loop() {
  // If a user just scanned their finger, we wait for the keypad
  if (isWaitingForVote) {
    char key = keypad.getKey();
    if (key != NO_KEY && key >= '1' && key <= '9') {
      int selection = key - '0';
      sendVote(currentUserID, selection);
    }
    // Timeout reset (Optional: Reset after 15 seconds of no activity)
  } else {
    // Normal fingerprint verification
    int id = getFingerprintID();
    if (id >= 0) {
      sendVerificationToBackend(id);
      delay(1000);
    }

    // Polling for new enrollments
    if (millis() - lastEnrollCheck >= enrollCheckInterval) {
      lastEnrollCheck = millis();
      checkEnrollmentRequest();
    }
  }
  delay(50);
}

// ==========================================
// 1. VERIFICATION LOGIC
// ==========================================

int getFingerprintID() {
  uint8_t p = finger.getImage();
  if (p == FINGERPRINT_NOFINGER)
    return -1;
  if (p != FINGERPRINT_OK)
    return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)
    return -1;

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK)
    return -1;

  Serial.printf("Found ID #%d with confidence %d\n", finger.fingerID,
                finger.confidence);
  return finger.fingerID;
}

void sendVerificationToBackend(int fingerID) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(VERIFY_API);
    http.addHeader("Content-Type", "application/json");

    String jsonBody = "{\"finger_id\": " + String(fingerID) + "}";
    int httpResponseCode = http.POST(jsonBody);

    if (httpResponseCode == 200) {
      String response = http.getString();
      StaticJsonDocument<512> doc;
      deserializeJson(doc, response);

      if (doc["success"] == true) {
        // Extract User ID for the vote
        currentUserID = doc["user"]["id"];
        isWaitingForVote = true;
        Serial.printf("\nUser %s Verified! Waiting for keypad selection...\n",
                      doc["user"]["full_name"].as<const char *>());
      }
    } else {
      Serial.println("Fingerprint not recognized in database.");
    }
    http.end();
  }
}

// ==========================================
// 2. ENROLLMENT LOGIC (SMART POLLING)
// ==========================================

void checkEnrollmentRequest() {
  if (WiFi.status() != WL_CONNECTED)
    return;

  HTTPClient http;
  http.begin(ENROLL_NEXT_API);
  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();

    // Parse the JSON from Node.js
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc["status"] == "success") {
      int requestId = doc["request_id"];
      int userId = doc["user_id"];

      Serial.println("\n*** NEW ENROLLMENT REQUEST DETECTED ***");

      int newFingerId = getNextFreeFingerID();
      if (newFingerId < 0) {
        Serial.println("Error: Sensor memory is full!");
        http.end();
        return;
      }

      Serial.printf("Assigning User ID: %d to Sensor Slot: %d\n", userId,
                    newFingerId);

      uint8_t enrollResult = enrollFinger(newFingerId);

      if (enrollResult == FINGERPRINT_OK) {
        Serial.println("Fingerprint saved physically. Notifying Node.js...");
        sendEnrollmentComplete(requestId, userId, newFingerId);
      } else {
        Serial.println("Enrollment failed or timed out.");
      }
    }
  }
  http.end();
}

int getNextFreeFingerID() {
  finger.getTemplateCount();
  // Loop through 1 to 127 to find an empty slot on the sensor
  for (int id = 1; id <= 127; id++) {
    uint8_t p = finger.loadModel(id);
    if (p != FINGERPRINT_OK) {
      return id; // Found an empty slot!
    }
  }
  return -1; // Sensor is full
}

uint8_t enrollFinger(int id) {
  int p = -1;
  unsigned long startTime = millis();
  Serial.println("===> Place finger on sensor NOW...");

  // Wait for finger
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER)
      delay(100);
    if (millis() - startTime > 15000) {
      Serial.println("Timeout waiting for first finger!");
      return -1;
    }
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK)
    return p;

  Serial.println("===> Remove finger...");
  delay(2000);
  while (finger.getImage() != FINGERPRINT_NOFINGER) {
    delay(100);
  }

  Serial.println("===> Place SAME finger again...");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER)
      delay(100);
    if (millis() - startTime > 15000) {
      Serial.println("Timeout waiting for first finger!");
      return -1;
    }
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK)
    return p;

  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("Error: Fingers did not match.");
    return p;
  }

  p = finger.storeModel(id);
  return p;
}
void sendVote(int userId, int selection) {
  HTTPClient http;
  http.begin(VOTE_API);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["user_id"] = userId;
  doc["keypad_selection"] = selection;

  String jsonBody;
  serializeJson(doc, jsonBody);

  int httpResponseCode = http.POST(jsonBody);
  if (httpResponseCode == 200) {
    Serial.println("Vote Recorded Successfully!");
  } else {
    Serial.println("Vote Error (User might have already voted)");
  }

  // RESET system for next user
  isWaitingForVote = false;
  currentUserID = -1;
  http.end();
}
void sendEnrollmentComplete(int requestId, int userId, int fingerId) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(ENROLL_COMPLETE_API);
    http.addHeader("Content-Type", "application/json");

    // Build JSON payload
    StaticJsonDocument<200> doc;
    doc["request_id"] = requestId;
    doc["user_id"] = userId;
    doc["finger_id"] = fingerId;
    doc["device_code"] = DEVICE_CODE;

    String jsonBody;
    serializeJson(doc, jsonBody);

    int httpResponseCode = http.POST(jsonBody);

    if (httpResponseCode == 200) {
      Serial.println("Node.js successfully saved the fingerprint!");
    } else {
      Serial.println("Failed to update Node.js database.");
    }
    http.end();
  }
}