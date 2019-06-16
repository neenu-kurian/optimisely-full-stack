const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var router = express.Router();
const PORT = process.env.PORT || 3000;
//const morgan = require('morgan')
//const {sequelize} = require('./models')
// const config = require('./config/config')
const path=require('path');
const app = express()
const url = "https://cdn.optimizely.com/datafiles/NSr4V9hUHFm7RqQ4Tm2Agc.json";
const rp = require("request-promise");
const Input = require("prompt-input");
const options = { uri: url, json: true };
const optimizelySDK = require("@optimizely/optimizely-sdk");
const defaultLogger = require("@optimizely/optimizely-sdk/lib/plugins/logger");
const LOG_LEVEL = require("@optimizely/optimizely-sdk/lib/utils/enums")
  .LOG_LEVEL;
//app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "../../client/dist")));

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

// About page route.
router.post("/login", function(req, res) {
  console.log("backend", req.body.name);
  username = req.body.name;

  rp(options).then(function(datafile) {
    optimizelyClientInstance = optimizelySDK.createInstance({
      datafile: datafile,
      logger: defaultLogger.createLogger({
        logLevel: LOG_LEVEL.INFO
      })
    });

    console.log("name", username);

    if (username !== "") {
      var attributes = {
        LoggedIn: "true"
      };
    }

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
      // var price = null; /* ? */
      console.log(
        `DEBUG: [Feature ON] The feature "prix_fixe" is on for user "${username}"`
      );
    }

    if (username === "user1") {
      var variation1 = optimizelyClientInstance.activate(
        "sorting_experiment",
        username,
        attributes
      );
      console.log("user is bucketed into variation1");
      res.send([
        {
          variation: variation1,
          enabled: enabled,
          appetizer: appt,
          dessert: dessert,
          entree: entree
        }
      ]);
    } else if (username === "user2") {
      var variation2 = optimizelyClientInstance.activate(
        "sorting_experiment",
        username,
        attributes
      );
      console.log("user is bucketed into variation2");
      res.send([
        {
          variation: variation1,
          enabled: enabled,
          appetizer: appt,
          dessert: dessert,
          entree: entree
        }
      ]);
    }
  });
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
    optimizelyClientInstance.track("Order-dessert", username);
  }
});