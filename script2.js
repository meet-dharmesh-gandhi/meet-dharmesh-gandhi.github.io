let animationEnd = document.querySelector(".image img");
animationEnd.addEventListener("animationend", () => {
  animationEnd.style.animation = "moveAstronaut 4s infinite";
});

const username = document.getElementById("userName");
const password = document.getElementById("password");
const signUpButon = document.querySelector(".sign-up");

signUpButon.addEventListener("click", () => {
  if (
    username.value === "" ||
    username.value == " " ||
    password.value === "" ||
    password.value == " "
  ) {
    alert("Please fill in all fields");
    return;
  }
  console.log(username.value);
  console.log(password.value);
  addNewUser(username.value, password.value);
  username.value = "";
  password.value = "";
});

const addNewUser = async (username, password) => {
  try {
    const response = await fetch("http://localhost:3000/add-new-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        cart: { car: [], house: [], gun: [] },
        wishlist: [],
      }),
    });
    if (!response.ok) {
      throw new Error("Something went wrong!! Status: " + response.status);
    }
    const data = await response.json();
    console.log("data: " + data);
    if (data === "Username Exists!!") {
      alert("Username Exists!!");
    } else {
      window.location.href = "./loggedIn.html";
    }
  } catch (error) {
    console.error("Error adding credentials: ", error);
  }
};
