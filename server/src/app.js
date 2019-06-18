const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var router = express.Router();
const PORT = process.env.PORT || 3000;
const path = require("path");
const app = express();
const url = "https://cdn.optimizely.com/datafiles/NSr4V9hUHFm7RqQ4Tm2Agc.json";
const rp = require("request-promise");
const options = { uri: url, json: true };
const optimizelySDK = require("@optimizely/optimizely-sdk");
const defaultLogger = require("@optimizely/optimizely-sdk/lib/plugins/logger");
const LOG_LEVEL = require("@optimizely/optimizely-sdk/lib/utils/enums")
  .LOG_LEVEL;
var defaultErrorHandler = require("@optimizely/optimizely-sdk").errorHandler;
const crypto = require("crypto");
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
var optimizelyEnums = require("@optimizely/optimizely-sdk").enums;
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/dist")));

const TOKEN = "PPwWaWGC8rrBx6dJhPyKrJ0_1bq_0gn1-tYnoWJ_OC0";
let encrypted = encrypt(TOKEN);
console.log("encrypted one", encrypted);
let decrypted = decrypt(encrypted);
console.log("decrpt", decrypted);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

var htmlPath = path.join(__dirname, "/public");
app.use(express.static(htmlPath));

app.use("/", router);

app.listen(PORT, function() {
  console.log("Server is running at PORT:", PORT);
});

// Home page route.
router.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/public", "index.html"));
  console.log("dirname", path.join(__dirname, "/public", "index.html"));
});

var username = "";
var dessert = "";
var appt = "";
var entree = "";
var optimizelyClientInstance = "";
var login = "";

//called when user is logged in
router.post("/login", function(req, res) {
  username = req.body.name;
  login = req.body.login;

  if (username === "" || username === "invaliduser") {
    res.status(401).send(login);
  } else {
    rp(options).then(function(datafile) {
      optimizelyClientInstance = optimizelySDK.createInstance({
        datafile: datafile,
        logger: defaultLogger.createLogger({
          logLevel: LOG_LEVEL.INFO
        }),
        errorHandler: defaultErrorHandler
      });

      var attributes = {
        LoggedIn: login.toString()
      };

      console.log("attributes", attributes);

      var variation = optimizelyClientInstance.activate(
        "sorting_experiment",
        username,
        attributes
      );

      var enabled = optimizelyClientInstance.isFeatureEnabled(
        "prix-fixe-menu",
        username,
        attributes
      );

      if (enabled) {
        dessert = optimizelyClientInstance.getFeatureVariableString(
          "prix-fixe-menu",
          "dessert",
          username
        );
        appt = optimizelyClientInstance.getFeatureVariableString(
          "prix-fixe-menu",
          "app",
          username
        );
        entree = optimizelyClientInstance.getFeatureVariableString(
          "prix-fixe-menu",
          "entree",
          username
        );

        console.log("   -- prix fixe --    ");
        console.log("Appetizer: ", appt);
        console.log("Entree: ", entree);
        console.log("Dessert: ", dessert);

        console.log(
          `DEBUG: [Feature ON] The feature "prix_fixe" is on for user "${username}"`
        );
      }

      if (username.includes("user1")) {
        optimizelyClientInstance.setForcedVariation(
          "sorting_experiment",
          "user1",
          "Menu_1"
        );

        console.log("user is bucketed into variation1");
        res.send([
          {
            variation: "Menu_1",
            enabled: enabled,
            appetizer: appt,
            dessert: dessert,
            entree: entree
          }
        ]);
      } else if (username.includes("user2")) {
        optimizelyClientInstance.setForcedVariation(
          "sorting_experiment",
          "user2",
          "Menu_2"
        );

        console.log("user is bucketed into variation2");
        res.send([
          {
            variation: "Menu_2",
            enabled: enabled,
            appetizer: appt,
            dessert: dessert,
            entree: entree
          }
        ]);
      }

      //adding notification listener
      optimizelyClientInstance.notificationCenter.addNotificationListener(
        optimizelyEnums.NOTIFICATION_TYPES.DECISION,
        onDecision
      );
    });
  }
});

router.post("/userinput", function(req, res) {
  if (req.body.prixfixemeal === "y") {
    optimizelyClientInstance.track("prix-fix-meal", username);
  }
});

router.post("/appetizer", function(req, res) {
  if (req.body.appetizer === "y") {
    optimizelyClientInstance.track("order-app", username);
  }
});

router.post("/entree", function(req, res) {
  if (req.body.entree === "y") {
    optimizelyClientInstance.track("Order-entree", username);
  }
});

router.post("/dessert", function(req, res) {
  if (req.body.dessert === "y") {
    optimizelyClientInstance.track("Order-desser", username);
  }
});

//function that listens for webhook events
router.post("/", function(req, res) {
  console.log("body", req.body);
  console.log("header", req.headers);

  var request_signature = req.headers["x-hub-signature"];
  var computed_signature = getComputedSignature(TOKEN, req.body);

  console.log("request sign", request_signature);
  console.log("comp sign", computed_signature);

  //to prevent timing attacks the below type of comparison is done
  var mismatch = 0;
  for (var i = 0; i < request_signature.length; ++i) {
    mismatch |=
      request_signature.charCodeAt(i) ^ computed_signature.charCodeAt(i);
  }

  if (mismatch !== 0) {
    rp(options).then(function(datafile) {
      optimizelyClientInstance = optimizelySDK.createInstance({
        datafile: datafile,
        logger: defaultLogger.createLogger({
          logLevel: LOG_LEVEL.INFO
        }),
        errorHandler: defaultErrorHandler
      });
    });
  }
});

//to encrypt token
function encrypt(text) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

//to decrypt token
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

//function to calculated signature using hmac sha1 hex
function getComputedSignature(token, payload) {
  var hash = crypto
    .createHmac("sha1", token)
    .update(JSON.stringify(payload), "utf8")
    .digest("hex");
  return hash;
}

function onDecision(decisionObject) {
  console.log("decisionObject type", decisionObject.type);
  console.log("decisionObject decisioninfo", decisionObject.decisionInfo);
}
