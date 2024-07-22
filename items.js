const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("username");

const getPropertyDetails = async (name, type) => {
  try {
    console.log("in too!!");
    const response = await fetch("http://localhost:3000/get-specifics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: name, Type: type }),
    });
    if (!response.ok) {
      throw new Error(
        "HTTP error while retrieving specifics " + response.status
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching details: ", error);
  }
};

const getUserProfile = async (username) => {
  try {
    const response = await fetch("http://localhost:3000/get-user-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error("Error getting user profile " + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile: ", error);
  }
};

const setBuilderRating = async (rating, builderName) => {
  try {
    const response = await fetch("http://localhost:3000/set-builder-rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
        builderRatings: rating,
        builderName,
      }),
    });
    if (!response.ok) {
      throw new Error("Error setting builder rating " + response.status);
    }
    const data = await response.json();
  } catch (error) {
    console.error("Error setting builder rating: ", error);
  }
};

let propertyName,
  builderName,
  price,
  configuration,
  propertyLocation,
  area,
  state,
  description,
  luxuryDescription,
  areaDescription,
  modernDescription,
  moreDescription,
  nothingDescription,
  builderPhoneNumber,
  rating,
  userRating;

const assignValues = async (name, type) => {
  let data = await getPropertyDetails(name, type);
  data = data[0];
  propertyName = data["Name"];
  builderName = data["Builder Name"];
  price = data["Price"];
  configuration = data["Configuration"];
  propertyLocation = data["Location"];
  area = data["Area"];
  state = data["State"];
  description = data["Description"];
  luxuryDescription = data["Luxury Description"];
  areaDescription = data["Area Description"];
  modernDescription = data["Modern Description"];
  moreDescription = data["More Description"];
  nothingDescription = data["Nothing Description"];
  builderPhoneNumber = data["Builder Contact Number"];
  rating = data["Rating"];
  data = await getUserProfile(userName);
  userRating = data[0]["Builder Ratings"][builderName];
};

const trimString = (numberString) => {
  while (numberString[numberString.length - 1] == "0") {
    numberString = numberString.slice(0, -1);
  }
  return numberString;
};

const numberToString = (number) => {
  let numberString = "";
  number = number.toString();
  if (number.slice(number.length - 6, number.length) === "000000") {
    numberString = number.slice(0, number.length - 7) + " M";
  } else if (number.length > 6) {
    numberString =
      trimString(number.slice(0, number.length - 6)) +
      "." +
      trimString(number.slice(number.length - 6, number.length - 1)) +
      " M";
  } else if (number.slice(number.length - 3, number.length) === "000") {
    numberString = number.slice(0, number.length - 3) + " K";
  } else {
    numberString = number;
  }
  return numberString;
};

const createWebsite = async (name, type) => {
  await assignValues(name, type);
  let body = document.querySelector("body");
  body.innerHTML += `<section class="productContainer">
    <div class="container">
        <div class="row">
            <div class="images col-12 col-md-12 col-lg-8">
                <img src="../images/mansion.jpg" alt="" height="400px" width="400px" class="bigImage">
                <div class="smallImages">
                    <img src="" alt="" class="smallImage1" height="200px" width="174px">
                    <img src="" alt="" class="smallImage2" height="200px" width="174px">
                    <img src="" alt="" class="smallImage3" height="200px" width="174px">
                    <img src="" alt="" class="smallImage4" height="200px" width="174px">
                </div>
            </div>
            <div class="productDetails col-12 col-md-12 col-lg-4">
                <h1 class="text-danger">${propertyName}</h1>
                <p class="byline">by ${builderName}</p>
                <ul>
                    <li><span class="text-warning">Price : </span>$${numberToString(
                      price
                    )}</li>
                    <li><span class="text-warning">Configuration : </span>${configuration} BHK</li>
                    <li><span class="text-warning">Location : </span>${propertyLocation}</li>
                    <li><span class="text-warning">Area : </span>${area} sq ft.</li>
                    <li><span class="text-warning">Available As : </span>${state}</li>
                    <li><span class="text-warning">Average Rating : </span><span class="rating-text">${rating.toString().slice(0, 3)}</span></li>
                    <li><span class="text-warning">You Rated : </span class="user-rating">${userRating}</li>
                    <li class="ratings-container"></li>
                </ul>
                <p class="description">${description}</p>
                <button type="button" class=" addToCart btn btn-primary" id="liveToastBtn">Add to Cart</button>
                <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
                    <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header">
                            <strong class="me-auto text-warning fw-bold name">LS Real Estate</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body"></div>
                    </div>
                </div>
                <button class="contactButton btn btn-primary">Contact Us</button>
            </div>
        </div>
    </div>
</section>
<section class="description1">
    <h1 class="text-danger">What you get</h1>
    <div class="container">
        <div class="row">
            <p><span class="text-warning">Luxury : </span>${luxuryDescription}</p>
            <p><span class="text-warning">Big Area : </span>${areaDescription}</p>
            <p><span class="text-warning">Modern : </span>${modernDescription}</p>
            <p><span class="text-warning">More and more : </span>${moreDescription}</p>
            <p><span class="text-warning">Nothing else to think : </span>${nothingDescription}</p>
        </div>
    </div>
</section>
<section class="more">
    <h1 class="company text-danger">More from ${builderName}</h1>
    <div class="container">
        <div class="row">
            <div class="properties mansion" id="mansion">
                <div class="container container3"></div>
            </div>
        </div>
    </div>
</section>
<section class="contactUs" id="contactUs">
    <h1 class="text-danger">Contact Us</h1>
    <div class="container">
        <div class="row">
            <p>For more information or to schedule a viewing, please contact us
                <br>
                Builder Contact Number : ${builderPhoneNumber}
                <br>
                Our Email : info@realestate.com
            </p>
        </div>
    </div>
</section>`;

  const ratingText = document.querySelector(".rating-text");
  const displayedUserRating = document.querySelector(".user-rating");

  if (userRating < 1) {
    displayedUserRating.style.display = "none";
  }

  const ratingStarsContainer = document.querySelector(".ratings-container");

  for (let i = 0; i < 5; i++) {
    const ratingStar = document.createElement("i");
    if (i < Math.floor(Number.parseFloat(ratingText.textContent))) {
      ratingStar.className = `fa-solid fa-star rating-star rating-star-${
        i + 1
      }`;
    } else if (i + 1 === Math.ceil(Number.parseFloat(ratingText.textContent))) {
      ratingStar.className = `fa-solid fa-star-half-stroke rating-star rating-star-${
        i + 1
      }`;
    } else {
      ratingStar.className = `fa-regular fa-star rating-star rating-star-${
        i + 1
      }`;
    }
    ratingStar.addEventListener("click", async () => {
      console.log("clicked star number: " + (i + 1));
      for (let j = 1; j <= i + 1; j++) {
        console.log(j);
        const ratingStar = document.querySelector(`.rating-star-${j}`);
        ratingStar.className = `fa-solid fa-star rating-star rating-star-${j}`;
      }
      for (let j = i + 2; j <= 5; j++) {
        const ratingStar = document.querySelector(`.rating-star-${j}`);
        ratingStar.className = `fa-regular fa-star rating-star rating-star-${j}`;
      }
      await setBuilderRating(i + 1, builderName);
      data = await getUserProfile(userName);
      userRating = data[0]["Builder Ratings"][builderName];
      console.log(userRating);
      const displayedUserRating = document.querySelector(".user-rating");
      displayedUserRating.textContent = userRating;
      data = await getPropertyDetails(name, type);
      console.log(JSON.stringify(data));
      data = data[0];
      rating = data["Rating"];
      ratingText.textContent = rating;
    });
    ratingStarsContainer.appendChild(ratingStar);
  }

  const showCards = async (type) => {
    let propertyTypes = [],
      propertyNames = [],
      locations = [],
      configurations = [],
      areas = [],
      builderNames = [],
      builderContactNumber = [],
      prices = [],
      states = [],
      images = [];
    const data = await getOnlyPropertyDetails(builderName);
    document.querySelector(".container3").innerHTML = "";
    // Creating Given Type Cards
    let seenI = [];
    for (let j = 0; j < 3; j++) {
      let i = getRandomNumber(0, data.length - 1);
      if (!seenI.includes(i) && data[i]["Name"] != name) {
        seenI.push(i);
        propertyTypes.push(data[i]["Type"]);
        propertyNames.push(data[i]["Name"]);
        locations.push(data[i]["Location"]);
        configurations.push(data[i]["Configuration"]);
        areas.push(data[i]["Area"]);
        builderNames.push(data[i]["Builder Name"]);
        builderContactNumber.push(data[i]["Builder Contact Number"]);
        prices.push(data[i]["Price"]);
        states.push(data[i]["State"]);
        images.push(data[i]["Images"][0]);
      } else {
        j--;
      }
    }

    for (let i = 0; i < propertyTypes.length; i++) {
      createCard(
        propertyTypes[i],
        images[i],
        propertyNames[i],
        prices[i],
        locations[i],
        configurations[i],
        configurations[i],
        areas[i]
      );
    }
  };

  const getOnlyPropertyDetails = async (builderName) => {
    try {
      const response = await fetch(
        "http://localhost:3000/get-property-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "Builder Name": builderName }),
        }
      );
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      let data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching details: ", error);
      console.log(error.message);
    }
  };

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  let contactus = document.querySelector(".contactButton");
  contactus.addEventListener("click", () => {
    window.location.href = "#contactUs";
  });

  document
    .querySelector("#liveToastBtn")
    .addEventListener("click", function () {
      let toastEl = document.querySelector("#liveToast");
      let toast = new bootstrap.Toast(toastEl);
      toast.show();
    });

  let addtocart = document.querySelector(".addToCart");
  let toastBody = document.querySelector(".toast-body");

  addtocart.addEventListener("click", async () => {
    console.log(userName);
    let userCart = await getCart(userName);
    console.log(inCart(name, userCart));
    if (addtocart.innerText == "Added !") {
      addtocart.innerText = "Add to Cart";
      toastBody.innerText = "Removed from cart";
      try {
        const response = await fetch("http://localhost:3000/remove-from-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userName,
            type: "building",
            name,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
      } catch (error) {
        console.error("Error while removing from cart: ", error);
      }
    } else if (addtocart.innerText == "Add to Cart") {
      addtocart.innerText = "Added !";
      toastBody.innerText = "Added to cart !";
      try {
        const response = await fetch("http://localhost:3000/add-to-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userName,
            type: "building",
            name,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
      } catch (error) {
        console.error("Error while adding to cart: ", error);
      }
    }
  });

  function createCard(
    propertyType,
    imgSrc,
    propertyName,
    price,
    Locations,
    bedroom,
    bathroom,
    area
  ) {
    const card = document.createElement("div");
    card.className = "card col-lg-3";
    card.style.width = "18rem";
    card.id = "card1";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = propertyName;
    img.className = "card-img-top";
    card.appendChild(img);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = propertyName;
    cardBody.appendChild(cardTitle);

    const cardText = document.createElement("p");
    cardText.className = "card-price";
    cardText.textContent = numberToString(price);
    cardBody.appendChild(cardText);

    const location = document.createElement("p");
    location.className = "location";
    location.textContent = Locations;
    cardBody.appendChild(location);

    const hr1 = document.createElement("hr");
    cardBody.appendChild(hr1);

    const details = document.createElement("div");
    details.className = "details";

    const bedIcon = document.createElement("i");
    bedIcon.className = "fa-solid fa-bed";
    details.appendChild(bedIcon);

    const bedrooms = document.createElement("p");
    bedrooms.className = "bedrooms";
    bedrooms.innerHTML = `<span class="num1">${bedroom}</span> Bedrooms`;
    details.appendChild(bedrooms);

    const bathIcon = document.createElement("i");
    bathIcon.className = "fa-solid fa-bath";
    details.appendChild(bathIcon);

    const bathrooms = document.createElement("p");
    bathrooms.className = "bathrooms";
    bathrooms.innerHTML = `<span class="num2">${bathroom}</span> Bathrooms`;
    details.appendChild(bathrooms);

    const areaIcon = document.createElement("i");
    areaIcon.className = "fa-solid fa-chart-area";
    details.appendChild(areaIcon);

    const areas = document.createElement("p");
    areas.className = "area";
    areas.innerHTML = `<span class="num3">${area}</span> Sq Feet`;
    details.appendChild(areas);

    cardBody.appendChild(details);

    const hr2 = document.createElement("hr");
    cardBody.appendChild(hr2);

    const button = document.createElement("a");
    button.className = "btn btn-primary btn1";
    button.textContent = "View Details";
    cardBody.appendChild(button);

    button.addEventListener("click", () => {
      button.href = `http://127.0.0.1:5500/items.html?username=${userName}&name=${propertyName}&type=${propertyType}`;
    });

    card.appendChild(cardBody);

    document.querySelector(".container3").appendChild(card);
  }

  showCards(type);
};

document.addEventListener("DOMContentLoaded", async () => {
  await createWebsite(urlParams.get("name"), urlParams.get("type"));
});

function showCart() {
  window.location.href = `./show%20cart.html?username=${userName}`;
}

const getCart = async (user) => {
  try {
    const response = await fetch("http://localhost:3000/show-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: user }),
    });
    let data = await response.json();
    data = data["cart"];
    return data;
  } catch (error) {
    console.log(error);
  }
};

const inCart = (item, cart) => {
  console.log(cart);
  for (let i = 0; i < cart["building"].length; i++) {
    element = cart["building"][i];
    console.log(element);
    console.log(item);
    if (item === element) {
      return true;
    }
  }
  return false;
};

const setAddToCartText = async () => {
  let userCart = await getCart(userName);
  let addtocart = document.querySelector(".addToCart");
  let toastBody = document.querySelector(".toast-body");
  if (inCart(urlParams.get("name"), userCart)) {
    addtocart.innerText = "Added !";
    value = "added";
    toastBody.innerText = "Added to cart !";
  }
};

let i = 0;

window.addEventListener("mousemove", () => {
  if (i < 1) {
    setAddToCartText();
    console.log("ok");
    i++;
  }
});

window.addEventListener("scroll", () => {
  const mansionSection = document.querySelector(".mansion");
  const sectionPosition = mansionSection.getBoundingClientRect().top;
  const screenPosition = window.innerHeight / 1.5;

  if (sectionPosition < screenPosition) {
    mansionSection.classList.add("visible");
  }
});
