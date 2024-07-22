const urlParams = new URLSearchParams(window.location.search);
const cart = document.getElementById("cart");
const userName = urlParams.get("username");
let paymentResult;
try {
  paymentResult = urlParams.get("result");
} catch (error) {
  paymentResult = "pending";
}
console.log(paymentResult);
const checkoutButton = document.querySelector(".checkout-button");
const propertyNames = [],
  prices = [];
let userCart,
  totalPrice = 100;

checkoutButton.addEventListener("click", () => {
  const reply = window.confirm(
    `Are you sure, you want to pay $${formatNumber(
      Math.ceil(1.11 * totalPrice)
    )}??`
  );
  console.log(reply);
  if (reply) {
    window.location.href = `http://localhost:3000/pay/${Math.ceil(
      1.11 * totalPrice
    )}/${userName}`;
  }
});

function extractOtherThanNumbers(numberString) {
  numberString = numberString.toString().split("");
  let stringNumber = [];
  for (let i = 0; i < numberString.length; i++) {
    if (
      !(
        numberString[i].charCodeAt(0) >= 48 &&
        numberString[i].charCodeAt(0) <= 57
      ) &&
      numberString[i] != " " &&
      numberString[i] != "."
    ) {
      stringNumber.push(numberString[i]);
    }
  }
  return stringNumber.join("");
}

const trimString = (numberString, dir) => {
  if (dir === "left") {
    while (numberString[0] == "0") {
      numberString = numberString.slice(0, -1);
    }
  } else if (dir === "right") {
    while (numberString[numberString.length - 1] == "0") {
      numberString = numberString.slice(0, -1);
    }
  }
  return numberString;
};

const numberToString = (number) => {
  let numberString = "";
  number = number.toString();
  //      number = number.split(".")[0];
  if (number.slice(number.length - 6, number.length) === "000000") {
    numberString = number.slice(0, number.length - 6) + " M";
  } else if (number.split(".")[0].length > 6) {
    numberString =
      trimString(
        number.split(".")[0].slice(0, number.split(".")[0].length - 6),
        "left"
      ) +
      "." +
      trimString(
        number
          .split(".")[0]
          .slice(number.split(".")[0].length - 6, number.split(".")[0].length),
        "right"
      );
    if (number.split(".").length > 1) {
      numberString += number.split(".")[1];
    }
    numberString += " M";
  } else if (number.slice(number.length - 3, number.length) === "000") {
    numberString = number.slice(0, number.length - 3) + " K";
  } else {
    numberString = number;
  }
  return numberString;
};

const formatNumber = (number) => {
  number = numberToString(number);
  const otherChars = extractOtherThanNumbers(number);
  number = Number.parseFloat(number);
  const numberArray = number.toString().split(".");
  const nonDecimalValues = numberArray[0].toString().split("").reverse();
  let formattedString = [],
    lastIndex = 0;
  for (let i = 0; i < nonDecimalValues.length; i++) {
    if (i % 3 === 0 && i != 0) {
      formattedString[lastIndex] = ",";
      lastIndex++;
      formattedString[lastIndex] = nonDecimalValues[i];
    } else {
      formattedString[lastIndex] = nonDecimalValues[i];
    }
    lastIndex++;
  }
  if (numberArray.length > 1) {
    return (
      formattedString.reverse().join("") +
      "." +
      numberArray[1] +
      " " +
      otherChars
    );
  } else {
    return formattedString.reverse().join("") + " " + otherChars;
  }
};

const getUserCart = async () => {
  try {
    const response = await fetch("http://localhost:3000/show-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: userName }),
    });
    let data = await response.json();
    data = data["cart"];
    userCart = data;
  } catch (error) {
    console.log(error);
  }
};

const getCartPrices = async () => {
  for (let i = 0; i < Object.keys(userCart).length; i++) {
    userCart[Object.keys(userCart)[i]].forEach((element) => {
      propertyNames.push(element);
    });
  }
  try {
    const response = await fetch("http://localhost:3000/get-specifics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: { $in: propertyNames } }),
    });
    let data = await response.json();
    data.forEach((element) => {
      prices.push(element["Price"]);
    });
    prices.forEach((element) => {
      totalPrice += element;
    });
  } catch (error) {
    console.log(error);
  }
};

const inArray = (item, array) => {
  for (let i = 0; i < array.length; i++) {
    let element = array[i];
    if (element === item) {
      return true;
    }
  }
  return false;
};

const getElementDetails = async (propertyNames) => {
  try {
    const response = await fetch("http://localhost:3000/get-specifics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: { $in: propertyNames } }),
    });
    let data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const showCart = async () => {
  const elementDetails = await getElementDetails(propertyNames);
  elementDetails.forEach((element) => {
    const { Name, Configuration, Type, State, Price } = element;
    createItemCard(Name, Configuration, Type, State, Price);
    totalPrice += Price;
  });
  const subTotal = document.querySelector("#sub-total");
  const tax = document.querySelector("#tax");
  const convenienceFees = document.querySelector("#convenience-fees");
  const totalAmount = document.querySelector("#total-amount");
  subTotal.innerHTML = totalPrice;
  tax.innerHTML = Math.ceil(totalPrice / 10);
  convenienceFees.innerHTML = Math.ceil(totalPrice / 100);
  totalAmount.innerHTML = Math.ceil(1.11 * totalPrice);
};

await getUserCart();
await getCartPrices();
await showCart();

function createItemCard(
  propertyName,
  configuration,
  propertyType,
  state,
  price
) {
  let box = document.querySelector(".box");
  box.innerHTML += `
  <div class="cards">
  <div class="image">
    <img src="./images/mansion.jpg" alt="">
  </div>
  <div class="details">
    <h1>${propertyName}</h1>
    <p class="area">Example Area, Los Santos</p>
    <p class="configurations">Configurations</p>
    <ul>
      <li>${configuration}</li>
      <li>${propertyType}</li>
      <li>${state}</li>
    </ul>
    <hr class="line2">
    <div class="price-button">
    <button class="remove-button ${propertyName.replaceAll(
      " ",
      "-"
    )}">Remove from Cart</button>
    <h4 class="cardPrice">${price}</h4>
    </div>
  </div>
  </div>
  `;
}

const removeFromCart = async (name) => {
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
};

const removeFromCartButtons = document.querySelectorAll(".remove-button");

removeFromCartButtons.forEach((element) => {
  element.addEventListener("click", async () => {
    const setPropertyName = element.classList[1].replaceAll("-", " ");
    console.log(setPropertyName);
    const reply = confirm(
      `Are you sure to delete ${setPropertyName} from your cart??`
    );
    if (reply) {
      await removeFromCart(setPropertyName);
      location.reload();
    }
  });
});
