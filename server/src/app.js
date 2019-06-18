const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var router = express.Router();
const PORT = process.env.PORT || 3000;
const path = require("path");
const app = express();
const url = "https://cdn.optimizely.com/datafiles/NSr4V9hUHFm7RqQ4Tm2Agc.json";
const rp = require("request-promise");
const Input = require("prompt-input");
const options = { uri: url, json: true };
const optimizelySDK = require("@optimizely/optimizely-sdk");
const defaultLogger = require("@optimizely/optimizely-sdk/lib/plugins/logger");
const LOG_LEVEL = require("@optimizely/optimizely-sdk/lib/utils/enums")
  .LOG_LEVEL;
var defaultErrorHandler = require("@optimizely/optimizely-sdk").errorHandler;
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

//app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../../client/dist")));

const TOKEN = "PPwWaWGC8rrBx6dJhPyKrJ0_1bq_0gn1-tYnoWJ_OC0";
let encrypted = encrypt(TOKEN);
console.log("encrypted one", encrypted);
let decrypted = decrypt(encrypted);
console.log("decrpt", decrypted);

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  // Pass to next layer of middleware
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

// About page route.
router.post("/login", function(req, res) {
  console.log("req body", req.body);
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

      var enabled = optimizelyClientInstance.isFeatureEnabled(
        "prix-fixe-menu",
        username,
        attributes
      );

      console.log("enabled", enabled);

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
        // var price = null; /* ? */
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

        // var variation1 = optimizelyClientInstance.activate(
        //   "sorting_experiment",
        //   username,
        //   attributes
        // );

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

        // var variation2 = optimizelyClientInstance.activate(
        //   "sorting_experiment",
        //   username,
        //   attributes
        // );

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
    });
  }
});

router.post("/userinput", function(req, res) {
  if (req.body.prixfixemeal === "y") {
    console.log("inside userinput track");
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
    optimizelyClientInstance.track("Order-dessert", username);
  }
});

router.post("/", function(req, res) {
  console.log("body", req.body);

  var request_signature = req.headers["x-hub-signature"];
  var computed_signature = "sha1=" + TOKEN;

  console.log('request sign',request_signature);
  console.log('comp sign',computed_signature);

  var mismatch = 0;
  for (var i = 0; i < request_signature.length; ++i) {
    mismatch |=
      request_signature.charCodeAt(i) ^ computed_signature.charCodeAt(i);
  }
  
  console.log('mismatch',mismatch);

  if (!mismatch) {
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

function encrypt(text) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
