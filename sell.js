let input = document.querySelector(".propertyCategoryInput");
let list = document.querySelectorAll(".propertyCategoryList li a");
let propertyType = document.querySelector(".property-type");
list.forEach((element) => {
    element.addEventListener("click", () => {
        input.value = element.innerText;
        propertyType.innerText = input.value;
        if(input.value == "Other") {
            let otherCategory = document.querySelector(".otherCategory");
            otherCategory.style.display = "block";
        }
        else {
            let otherCategory = document.querySelector(".otherCategory");
            otherCategory.style.display = "none";
        }
    });
});

let input1 = document.querySelector(".propertyStateInput");
let list1 = document.querySelectorAll(".propertyStateList li a");   
list1.forEach((element) => {
    element.addEventListener("click", () => {
        input1.value = element.innerText;
    });
});

let propertyName = document.querySelector("#inputPropertyName");
let cardTitle = document.querySelector(".card-title");
propertyName.addEventListener("input",() => {
    if(propertyName.value === "") {
        cardTitle.innerText = "Example Mansion";
    }
    else {
        cardTitle.innerText = propertyName.value;
    }
});

let price = document.querySelector("#inputPrice");
let cardPrice = document.querySelector(".card-price");
price.addEventListener("input",() => {
    if(price.value === "") {
        cardPrice.innerText = "Some Price";
    }
    else {
        cardPrice.innerText = "$" + price.value;
    }
});

let configuration = document.querySelector("#inputConfiguration");
let num1 = document.querySelector(".num1");
let num2 = document.querySelector(".num2");
configuration.addEventListener("input", () => {
    if(configuration.value === "") {
        num1.innerText = "x";
        num2.innerText = "x";
        num3.innerText = "xyz";
    }
    else {
        num1.innerText = configuration.value;
        num2.innerText = configuration.value;
        num3.innerText = area.value;
    }
});

let area = document.querySelector("#inputPropertArea");
let num3 = document.querySelector(".num3");
area.addEventListener("input", () => {
    if(area.value === "") {
        num3.innerText = "xyz";
    }
    else {
        num3.innerText = area.value;
    }
});

let cardLocation = document.querySelector("#inputLocation");
let propertyLocation = document.querySelector(".location");
cardLocation.addEventListener("input", () => {
    if(cardLocation.value === "") {
        propertyLocation.innerText = "Example location";
    }
    else {
        propertyLocation.innerText = cardLocation.value;
    }
});

let pictures = document.querySelectorAll(".pictures");