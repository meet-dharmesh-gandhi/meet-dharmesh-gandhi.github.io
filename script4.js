const username = document.getElementById("userName");
const password = document.getElementById("password");
const signInButon = document.getElementById("sign-in");

signInButon.addEventListener("click", () => {
  let input1 = document.querySelector(".input1");
  let input2 = document.querySelector(".input2");
  if (username.value === "" || username.value === " ") {
    setTimeout(() => {
      alert("Please enter your Username !");
    }, 100);
    input1.style.border = "2px solid red";
    input1.addEventListener("click", () => {
      input1.style.border = "none";
      input1.style.borderRadius = "5px";
    });
  } else if (password.value === "" || password.value === " ") {
    setTimeout(() => {
      alert("Please enter your password !");
    }, 100);
    input2.style.border = "2px solid red";
    input2.addEventListener("click", () => {
      input2.style.border = "none";
    });
  } else {
    checkUserExistence(username.value, password.value);
    username.value = "";
    password.value = "";
  }
});

let animationEnd = document.querySelector(".image img");
animationEnd.addEventListener("animationend", () => {
  animationEnd.style.animation = "moveAstronaut 4s infinite";
});

const checkUserExistence = async (username, password) => {
  try {
    const response = await fetch("http://localhost:3000/check-user-existence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error("Something went wrong!! Status: " + response.status);
    }
    const data = await response.json();
    console.log("data: " + data);
    if (data === "Incorrect Username or Password") {
      alert("Incorrect Username or Password");
    } else {
      window.location.href = "./loggedin.html";
    }
  } catch (error) {
    console.error("Error verifying credentials: ", error);
  }
};
