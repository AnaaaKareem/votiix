#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <ArduinoJson.h>
#include <Keypad.h>
#include <queue>

const byte ROWS = 4;
const byte COLS = 3;
char keys[ROWS][COLS] = {{'1','2','3'},{'4','5','6'},{'7','8','9'},{'*','0','#'}};
byte rowPins[ROWS] = {13, 12, 14, 27};
byte colPins[COLS] = {26, 25, 33};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger(&mySerial);

const char* WIFI_SSID = "Omar";
const char* WIFI_PASS = "123456789";
const String SERVER_IP = "172.20.10.2";
const String DEVICE_CODE = "esp32-01";

const String KEYPAD_API = "http://" + SERVER_IP + ":3001/api/keypad";
const String VERIFY_API = "http://" + SERVER_IP + ":3001/verify-fingerprint";
const String ENROLL_NEXT_API = "http://" + SERVER_IP + ":3001/enrollment/next?device_code=" + DEVICE_CODE;
const String ENROLL_COMPLETE_API = "http://" + SERVER_IP + ":3001/enrollment/complete";

struct NetworkRequest { String url; String body; };
std::queue<NetworkRequest> networkQueue;
SemaphoreHandle_t queueMutex;

volatile int pendingEnrollUserId = -1;
volatile int pendingEnrollRequestId = -1;
unsigned long lastEnrollCheck = 0;

void setup() {
  Serial.begin(115200);
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);
  queueMutex = xSemaphoreCreateMutex();

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }

  xTaskCreatePinnedToCore(NetworkTask, "NetworkTask", 10000, NULL, 1, NULL, 0);
  Serial.println("System Ready - Unified Flow Active");
}

void NetworkTask(void * pvParameters) {
  for(;;) {
    if (!networkQueue.empty()) {
      NetworkRequest req;
      if (xSemaphoreTake(queueMutex, portMAX_DELAY)) {
        req = networkQueue.front(); networkQueue.pop();
        xSemaphoreGive(queueMutex);
      }
      HTTPClient http;
      http.begin(req.url);
      http.addHeader("Content-Type", "application/json");
      http.setTimeout(1000);
      http.POST(req.body);
      http.end();
    }

    if (millis() - lastEnrollCheck > 3000) {
      lastEnrollCheck = millis();
      HTTPClient http;
      http.begin(ENROLL_NEXT_API);
      if (http.GET() == 200) {
        StaticJsonDocument<256> doc;
        deserializeJson(doc, http.getString());
        if (doc["status"] == "success") {
          pendingEnrollRequestId = doc["request_id"];
          pendingEnrollUserId = doc["user_id"];
        }
      }
      http.end();
    }
    delay(50);
  }
}

void addToQueue(String url, String body) {
  if (xSemaphoreTake(queueMutex, portMAX_DELAY)) {
    networkQueue.push({url, body});
    xSemaphoreGive(queueMutex);
  }
}

void loop() {
  if (pendingEnrollUserId != -1) {
    handleEnrollment(pendingEnrollUserId, pendingEnrollRequestId);
    pendingEnrollUserId = -1; 
  }

  char key = keypad.getKey();
  if (key != NO_KEY) {
    addToQueue(KEYPAD_API, "{\"key\": \"" + String(key) + "\"}");
  }

  if (finger.getImage() == FINGERPRINT_OK) {
    if (finger.image2Tz() == FINGERPRINT_OK) {
      if (finger.fingerFastSearch() == FINGERPRINT_OK) {
        addToQueue(VERIFY_API, "{\"finger_id\": " + String(finger.fingerID) + "}");
        delay(1500);
      }
    }
  }
  delay(10);
}

void handleEnrollment(int userId, int requestId) {
  int fingerId = getNextID();
  Serial.println("Starting Enrollment Process...");
  
  while (finger.getImage() != FINGERPRINT_OK) { delay(100); }
  finger.image2Tz(1);
  
  Serial.println("Remove finger and place again...");
  delay(2000);
  while (finger.getImage() != FINGERPRINT_OK) { delay(100); }
  finger.image2Tz(2);
  
  if (finger.createModel() == FINGERPRINT_OK) {
    if (finger.storeModel(fingerId) == FINGERPRINT_OK) {
      String body = "{\"request_id\":"+String(requestId)+",\"user_id\":"+String(userId)+",\"finger_id\":"+String(fingerId)+",\"device_code\":\""+DEVICE_CODE+"\"}";
      addToQueue(ENROLL_COMPLETE_API, body);
      Serial.println("Enrollment Successful!");
    }
  }
}

int getNextID() {
  finger.getTemplateCount();
  return finger.templateCount + 1;
}
