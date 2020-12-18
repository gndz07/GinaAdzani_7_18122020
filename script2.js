import {recipes} from './recipe-rawdata.js';

const recipesArray = Object.entries(recipes);

console.log(recipesArray);
//function to create element
const create = (elm, attributes) => {
	const element = document.createElement(elm);
	for (let key in attributes) {
    	element.setAttribute(key, attributes[key])
  	}
	return element;
}

recipesArray.forEach(recipe => {
	//image
	let image = create("img", {class: "card-img-top bg-secondary", height: "200px", src: "#", alt: "card-image"});
	//title
	let title = create("h2", {class: "card-title w-50", style: "font-size:1.5rem"});
	title.textContent = recipe[1].name;

	let timeParent = create("div", {class: "d-flex font-weight-bold"});
	timeParent.innerHTML = "<span class='far fa-clock mt-2' style='font-size:1.5rem'></span>"
							+ "<p class='ml-2' style='font-size:1.5rem'>" + recipe[1].time + " min</p>"

	//grouping the header elements
	let headerParent = create("div", {class: "d-flex justify-content-between mt-3 px-3"});
	headerParent.appendChild(title);
	headerParent.appendChild(timeParent);

	//ingredients list
	let ingredients = create("div");

	let eachIngredient = recipe[1].ingredients.map(function(ingredients) {
		if (Object.prototype.hasOwnProperty.call(ingredients, "quantity") && Object.prototype.hasOwnProperty.call(ingredients, "unit")) {
			return "<p class='mb-0'><span class='font-weight-bold'>" + ingredients.ingredient + ": </span>"+ ingredients.quantity + ingredients.unit + "</p>";
		} else if (Object.prototype.hasOwnProperty.call(ingredients, "quantity") && !Object.prototype.hasOwnProperty.call(ingredients, "unit")) {
			return "<p class='mb-0'><span class='font-weight-bold'>" + ingredients.ingredient + ": </span>"+ ingredients.quantity + "</p>";
		} else if (!Object.prototype.hasOwnProperty.call(ingredients, "quantity") && !Object.prototype.hasOwnProperty.call(ingredients, "unit")) {
			return "<p class='mb-0'><span class='font-weight-bold'>" + ingredients.ingredient + "</span></p>";
		}
	}).join("");

	ingredients.innerHTML = eachIngredient;

	//cook method
	let method = create("p", {class: "w-50"});
	method.textContent = recipe[1].description;

	//card body
	let cardBody = create("div", {class: "card-body d-flex justify-content-between text-truncate text-wrap", style: "height:10rem"});
	//combine in card body
	cardBody.appendChild(ingredients);
	cardBody.appendChild(method);


	//card container
	let cardContainer = create("article", {class: "card rounded bg-light pb-3"});

	//container parent
	let containerParent = create("div", {class: "col-4 mb-5"});

	//combine to DOM
	containerParent.appendChild(cardContainer);
	cardContainer.appendChild(image);
	cardContainer.appendChild(headerParent);
	cardContainer.appendChild(cardBody);

	let mainSection = document.getElementById("main");
	//put into DOM
	mainSection.appendChild(containerParent);

})
