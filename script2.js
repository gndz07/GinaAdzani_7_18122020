import {recipes} from './recipe-rawdata.js';

let recipesArray = Object.entries(recipes);

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
	let image = create("div", {class: "card-img-top card-img-placeholder", alt: "card-image"});
	//title
	let title = create("h2", {class: "card-title w-50 card-content-title"});
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
	let cardBody = create("div", {class: "card-body d-flex justify-content-between card-content"});
	//combine in card body
	cardBody.appendChild(ingredients);
	cardBody.appendChild(method);


	//card container
	let cardContainer = create("article", {class: "card recipe-card pb-3"});

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

//fill the dropdown menu
//function to put elements into the DOM
let addItem = (array, parentElm) => {
	array.forEach(item => {
		let option = create("li", {class: "dropdown-item"});
		option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
		parentElm.appendChild(option);
	})
}
//extract all unique ingredients into one array
let ingredientsOptions = [...new Set(recipesArray.map(a => a[1].ingredients.map(b => b.ingredient)).flat())];
//put ingredients options into dropdown
addItem(ingredientsOptions, document.getElementById("ingredients-dropdown"));
//extract all unique tools into one array
let appliancesOptions = [...new Set(recipesArray.map(a => a[1].appliance))];
//put appliances options into dropdown
addItem(appliancesOptions, document.getElementById("appliances-dropdown"));
//extract all unique utensils into one array
let utensilsOptions = [...new Set(recipesArray.map(a => a[1].ustensils).flat())];
//put utensils options into dropdown
addItem(utensilsOptions, document.getElementById("utensils-dropdown"));

//sorting function set
//function to swap position
let swap = (items, leftIndex, rightIndex) => {
	var temp = items[leftIndex];
	items[leftIndex] = items[rightIndex];
	items[rightIndex] = temp;
}
//partition code, to make a left and right elements list
let partition = (items, attribute, left, right) => {
	let pivot = items[Math.floor((right + left) / 2)][1][attribute]; //middle element

	while (left <= right) {
		while (items[left][1][attribute].localeCompare(pivot) < 0) {
			left++;
		}
		while (items[right][1][attribute].localeCompare(pivot) > 0) {
			right--;
		}
		if (left <= right) {
			swap(items, left, right);
			left++;
			right--;
		}
	}
	return left;
}

let quickSort = (items, attribute, left, right) => {
	//duplicate the array to sort
	//let sortedArray = [...items]; //why it doesn't work as well if I use this duplicate array?

	let index;
	if (items.length > 1) {
       	index = partition(items, attribute, left, right); //take index from partition
       	if (left<index-1) { //more elements on the left
       		quickSort(items, attribute, left, index-1);
       	}
       	if (index<right) { //more elements on the right
       		quickSort(items, attribute, index, right);
       	}
	}
	return items;
}

console.log(quickSort(recipesArray, "name", 0, recipesArray.length-1));

//binary search function
let searchRecipe = (items, attribute, left, right, target) => {
	quickSort(recipesArray, "name", 0, recipesArray.length-1);
	let startIndex = 0;
	let endIndex = items.length-1;
	//get middle index
	while (startIndex <= endIndex) {
		let middleIndex = Math.floor((startIndex+endIndex)/2);

		if (target === items[middleIndex][1][attribute]) {
			return console.log(middleIndex);
		}

		if (target.localeCompare(items[middleIndex][1][attribute]) < 0) {
			endIndex = middleIndex -1;
		}

		if (target.localeCompare(items[middleIndex][1][attribute]) > 0) {
			startIndex = middleIndex + 1;
		}
		else {
			console.log("Item not found");
		}
	}
}
