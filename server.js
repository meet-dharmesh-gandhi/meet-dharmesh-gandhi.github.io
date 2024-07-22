const { MongoClient } = require("mongodb");
const express = require("express");
const axios = require("axios");
const uniqid = require("uniqid");
const sha256 = require("sha256");

const app = express();
const port = 3000;

const HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";

let userName;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"),
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"),
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  next();
});

const uri =
  "mongodb+srv://test-user:test-user-password@js-integration-cluster.t8a77w9.mongodb.net/?retryWrites=true&w=majority&appName=Js-Integration-Cluster";

const client = new MongoClient(uri);

const Building_Details = client
  .db("Feature_Testing")
  .collection("Building Details");

const Usernames_and_Passwords = client
  .db("Feature_Testing")
  .collection("Usernames and Passwords");

async function main() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}

main().catch(console.error);

async function getPropertyDetails(query) {
  const result = await Building_Details.find(query).toArray();
  return result;
}

async function addToCart(userName, Type, Name) {
  const newValue = {};
  newValue["cart." + Type] = Name;
  const result = await Usernames_and_Passwords.updateOne(
    { username: userName },
    { $push: newValue }
  );
  return result;
}

async function removeFromCart(userName, Type, Name) {
  const newValue = {};
  newValue["cart." + Type] = Name;
  const result = await Usernames_and_Passwords.updateOne(
    { username: userName },
    { $pull: newValue }
  );
  return result;
}

async function showCart(userName) {
  const result = await Usernames_and_Passwords.findOne(
    { username: userName },
    { cart: 1, _id: 0 }
  );
  return result;
}

const addToWishlist = async (details) => {
  const { userName, propertyName } = details;
  const result = await Usernames_and_Passwords.updateOne(
    { username: userName },
    { $push: { wishlist: propertyName } }
  );
  return result;
};

const removeFromWishlist = async (details) => {
  const { userName, propertyName } = details;
  console.log(userName);
  console.log(propertyName);
  const result = await Usernames_and_Passwords.updateOne(
    { username: userName },
    { $pull: { wishlist: propertyName } }
  );
  return result;
};

const inArray = (item, array) => {
  for (let i = 0; i < array.length; i++) {
    element = array[i];
    if (element === item) {
      return true;
    }
  }
  return false;
};

async function stringOfFilters(filters) {
  const {
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    builderName,
    configuration,
    dealType,
    location,
  } = filters;
  const query = {
    $and: [
      { Price: { $lt: maxPrice } },
      { Price: { $gt: minPrice } },
      { Area: { $lt: maxArea } },
      { Area: { $gt: minArea } },
    ],
  };
  // builderName, configuration, dealType and location are arrays
  if (builderName.length > 0) {
    query.$and.push({ Builder: { $in: builderName } });
  }
  if (configuration.length > 0) {
    query.$and.push({ Configuration: { $in: configuration } });
  }
  if (!(inArray("Buy", dealType) && inArray("Rent", dealType))) {
    if (inArray("Buy", dealType)) {
      query.$and.push({ State: "For Purchase" });
    } else if (inArray("Rent", dealType)) {
      query.$and.push({ State: "For Rent" });
    }
  } else {
    query.$and.push({ State: "For Purchase and Rent" });
  }
  if (location.length > 0) {
    query.$and.push({ Location: { $in: location } });
  }
  return query;
}

async function addDocumentInDb(record) {
  const result = await Usernames_and_Passwords.insertOne(record);
  return result;
}

async function checkUserExistence(credentials) {
  const result = await Usernames_and_Passwords.find(credentials).toArray();
  return result;
}

async function filter(filters) {
  const query = await stringOfFilters(filters);
  const result = await Building_Details.find(query).toArray();
  return result;
}

async function getUniqueValues(value) {
  const result = await Building_Details.distinct(value);
  return result;
}

async function getUserProfile(username) {
  const result = await Usernames_and_Passwords.find({ username }).toArray();
  return result;
}

async function setBuilderRating(details) {
  const { username, builderRatings, builderName } = details;
  let filter = {};
  const filterParam = "Builder Ratings." + builderName;
  filter[filterParam] = 1;
  filter["_id"] = 0;
  const previousUserRating = await Usernames_and_Passwords.findOne( { username : username }, filter )
  filter = {};
  filter[filterParam] = builderRatings;
  const updateUsername = await Usernames_and_Passwords.updateOne( { username : username }, { $set : filter } );
  const averageBuilderRating = await Building_Details.findOne( { "Builder Name" : builderName }, { "Rating" : 1, "_id" : 0 } );
  let updatedBuilderRatings = ((2 * averageBuilderRating["Rating"]) + builderRatings - previousUserRating["Builder Ratings"][builderName])/2;
  const updateBuilderRatings = await Building_Details.updateMany( { "Builder Name" : builderName }, { $set : { "Rating" : updatedBuilderRatings } } );
  return [updateUsername, updateBuilderRatings];
}

app.post("/add-new-user", async (req, res) => {
  try {
    const existence = await checkUserExistence(req.body);
    if (existence.length == 0) {
      await addDocumentInDb(req.body);
      res.json("User Added!!");
    } else {
      res.json("Username Exists!!");
    }
  } catch (error) {
    console.error("Error while adding user: ", error);
    res.status(500).send(error);
  }
});

app.post("/check-user-existence", async (req, res) => {
  try {
    const existence = await checkUserExistence(req.body);
    console.log(existence);
    if (existence.length == 0) {
      res.json("Incorrect Username or Password");
    } else {
      res.json("User Verified!!");
    }
  } catch (error) {
    console.error("Error verifying: ", error);
    res.status(500).send(error);
  }
});

app.post("/get-property-details", async (req, res) => {
  try {
    const propertyType = req.body;
    const result = await getPropertyDetails(propertyType);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/get-specifics", async (req, res) => {
  try {
    console.log("inside");
    const { Name, Type } = req.body;
    const result = await getPropertyDetails(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/add-to-cart", async (req, res) => {
  try {
    const { userName, type, name } = req.body;
    if (type === "building" || type === "car") {
      const result = await addToCart(userName, type, name);
      res.json(result);
    } else {
      res.status(400).send("Invalid Type");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/remove-from-cart", async (req, res) => {
  try {
    const { userName, type, name } = req.body;
    if (type === "building" || type === "car") {
      const result = await removeFromCart(userName, type, name);
      res.json(result);
    } else {
      res.status(400).send("Invalid Type");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/show-cart", async (req, res) => {
  try {
    const { userName } = req.body;
    const result = await showCart(userName);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/filter-properties", async (req, res) => {
  try {
    const result = await filter(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/get-unique-values", async (req, res) => {
  try {
    const { value } = req.body;
    const result = await getUniqueValues(value);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/add-to-wishlist", async (req, res) => {
  try {
    const result = await addToWishlist(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/remove-from-wishlist", async (req, res) => {
  try {
    const result = await removeFromWishlist(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/search", async (req, res) => {
  try {
    const { Searched } = req.body;
    const names = await Building_Details.distinct("Name");
    const types = await Building_Details.distinct("Type");
    const locations = await Building_Details.distinct("Location");
    const configurations = await Building_Details.distinct("Configuration");
    const areas = await Building_Details.distinct("Area");
    const builderNames = await Building_Details.distinct("Builder Name");
    const prices = await Building_Details.distinct("Price");
    const states = await Building_Details.distinct("State");
    let searchedNames,
      searchedTypes,
      searchedLocations,
      searchedConfigurations,
      searchedAreas,
      searchedBuilderNames,
      searchedPrices,
      searchedStates;
    searchedNames = names.filter((name) =>
      name.toLowerCase().includes(Searched.toLowerCase())
    );
    searchedTypes = types.filter((type) =>
      type.toLowerCase().includes(Searched.toLowerCase())
    );
    searchedLocations = locations.filter((location) =>
      location.toLowerCase().includes(Searched.toLowerCase())
    );
    searchedConfigurations = configurations.filter((configuration) =>
      Searched.toLowerCase().includes(configuration.toString().toLowerCase())
    );
    searchedAreas = areas.filter((area) =>
      Searched.toLowerCase().includes(area.toString().toLowerCase())
    );
    searchedBuilderNames = builderNames.filter((builderName) =>
      builderName.toLowerCase().includes(Searched.toLowerCase())
    );
    searchedPrices = prices.filter((price) =>
      Searched.toLowerCase().includes(price.toString().toLowerCase())
    );
    searchedStates = states.filter((state) =>
      state.toLowerCase().includes(Searched.toLowerCase())
    );
    const searchQuery = { $or : [] };
    if (searchedNames.length != 0) {
      searchQuery["$or"].push({ "Name" : { $in : searchedNames }});
    }
    if (searchedTypes.length != 0) {
      searchQuery["$or"].push({ "Type" : { $in : searchedTypes }});
    }
    if (searchedLocations.length != 0) {
      searchQuery["$or"].push({ "Location" : { $in : searchedLocations }});
    }
    if (searchedConfigurations.length != 0) {
      searchQuery["$or"].push({ "Configuration" : { $in : searchedConfigurations }});
    }
    if (searchedBuilderNames.length != 0) {
      searchQuery["$or"].push({ "Builder Name" : { $in : searchedBuilderNames }});
    }
    if (searchedPrices.length != 0) {
      searchQuery["$or"].push({ "Price" : { $in : searchedPrices }});
    }
    if (searchedStates.length != 0) {
      searchQuery["$or"].push({ "State" : { $in : searchedStates }});
    }
    const searchResults = await Building_Details.find(searchQuery).toArray();
    res.json(searchResults);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post("/get-user-profile", async (req, res) => {
  try {
    const { username } = req.body;
    const userProfile = await getUserProfile(username);
    res.json(userProfile);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

app.post("/set-builder-rating", async (req, res) => {
  try {
    const result = await setBuilderRating(req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

app.get("/", (req, res) => {
  res.send("PhonePe is On!!");
});

app.get("/pay/:amount/:username", async (req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const amount = Number.parseInt(req.params.amount);
  userName = req.params.username;
  const merchantTransactionId = uniqid();
  const userId = 123;
  const payLoad = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount,
    redirectUrl: `http://localhost:${port}/redirect-url/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const bufferObj = Buffer.from(JSON.stringify(payLoad), "utf8");
  const base63EncodedPayLoad = bufferObj.toString("base64");
  const xVerify =
    sha256(base63EncodedPayLoad + payEndpoint + SALT_KEY) + "###" + SALT_INDEX;
  console.log(xVerify);
  console.log(base63EncodedPayLoad);

  const options = {
    method: "POST",
    url: `${HOST_URL}${payEndpoint}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    data: {
      request: base63EncodedPayLoad,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
      console.log(url);
      res.redirect(url);
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.get("/redirect-url/:merchantTransactionId", (req, res) => {
  const { merchantTransactionId } = req.params;
  console.log(merchantTransactionId);
  const xVerify =
    sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) +
    "###" +
    SALT_INDEX;
  if (merchantTransactionId) {
    const options = {
      method: "get",
      url: `${HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantTransactionId,
      },
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        const clientPort = 5502;
        if (response.data.code === "PAYMENT_SUCCESS") {
          // go to success frontend
          res.redirect(
            `http://127.0.0.1:${clientPort}/show%20cart.html?username=${userName}&result=success`
          );
        } else if (response.data.code === "PAYMENT_ERROR") {
          // go to error frontend
          res.redirect(
            `http://127.0.0.1:${clientPort}/show%20cart.html?username=${userName}&result=failure`
          );
        } else if (response.data.code === "INTERNAL_SERVER_ERROR") {
          // go to server error frontend
          res.redirect(
            `http://127.0.0.1:${clientPort}/show%20cart.html?username=${userName}&result=internal-error`
          );
        } else {
          // go to loading frontend
          res.redirect(
            `http://127.0.0.1:${clientPort}/show%20cart.html?username=${userName}&result=loading`
          );
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    res.send({ error: "No merchantTransactionId found." });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
