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

	//appliance section
	let appliances = create("p", {class: "sr-only"});
	appliances.textContent = recipe[1].appliance;
	//utensils section
	let utensils = create("div", {class: "sr-only"});
	let eachUtensils = recipe[1].ustensils.map(function(utensil) {
		return "<p>" + utensil + "</p>";
	}).join("");
	utensils.innerHTML = eachUtensils;
	

	//card body
	let cardBody = create("div", {class: "card-body d-flex justify-content-between card-content"});
	//combine in card body
	cardBody.appendChild(ingredients);
	cardBody.appendChild(method);
	cardBody.appendChild(appliances);
	cardBody.appendChild(utensils);

	//card container
	let cardContainer = create("article", {class: "card recipe-card pb-3 mb-5"});

	//combine to DOM
	cardContainer.appendChild(image);
	cardContainer.appendChild(headerParent);
	cardContainer.appendChild(cardBody);

	let mainSection = document.getElementById("main");
	//put into DOM
	mainSection.appendChild(cardContainer);
})

//function to split
let splitString = (array) => {
	let newArr = [];
	for (let i=0; i<array.length; i++) {
		newArr.push(array[i].split(" "));
	}
	return newArr;
}

//extract all unique ingredients into one array
let ingredientsOptions = [...new Set(recipesArray.map(a => a[1].ingredients.map(b => b.ingredient.toLowerCase())).flat())];
//words from ingredients options
let ingredientsWords = [...new Set(splitString(ingredientsOptions).flat())];
//get lists of words from recipe name 
let recipeName = [...new Set(recipesArray.map(a => a[1].name.toLowerCase()))];
let recipeNameWords = [...new Set(splitString(recipeName).flat())];
//get lists of words from descriptions
let recipeDesc = [...new Set(recipesArray.map(a => a[1].description.toLowerCase().replace(/[^\w\s+è+ç+é+ï+à+ù+û+ô+ê+î]/gi, "")))];
let recipeDescWords = splitString(recipeDesc).flat();
//combine all options into one array for the main search
let searchOptions = [...new Set(ingredientsWords.concat(recipeNameWords, recipeDescWords))]; //array of 890 strings

//autocomplete function
let autocomplete = (input, arr, minLength) => {
	let currentFocus; //to catch when user input something new
	
		input.addEventListener("input", function(e) {
			if (input.value.length > minLength) {
				let val = this.value;
				//take out all of current autocompleted values
				closeLists();
				if (!val) { return false;}
				currentFocus = -1;
				//create div element that will contain the suggestions
				let a = create("div", {class: "autocomplete-items", id: this.id+"-autocomplete-lists"});
				//append to parent element
				this.parentNode.appendChild(a);
				//iterate the array
				for (let i=0; i<arr.length; i++) {
					if (arr[i].substr(0, val.length).toLowerCase() == val.toLowerCase()) {
						let b = create("p");
						b.textContent = arr[i];
						//when click on the value

						b.addEventListener("click", function() {
							//insert value
							input.value = this.textContent;
							//close list
							closeLists();
						});
						a.appendChild(b);
					}
				}
			} else {
				closeLists();
			}
		});
		//execute function on keydown
		input.addEventListener("keydown", function(e) {
			let x = document.getElementById(this.id + "autocomplete-lists");
			if (x) x = x.getElementsByTagName("p");
			if (e.keyCode == 40) { //key down
				currentFocus++;
				addActive(x);
			} else if (e.keyCode == 38) { //key up
				currentFocus--;
				addActive(x)
			} else if (e.keyCode == 13) { //enter
				e.preventDefault();
				if (currentFocus > -1) {
					if (x) x[currentFocus].click();
				}
			} else if (e.keyCode == 27) { //escape
				closeLists();
			}
		});
		let addActive = (x) => {
			if (!x) return false;
			//remove other active class
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
			//add active class
			x[currentFocus].classList.add("autocomplete-active");
		}
		let removeActive = (x) => {
			for (let i=0; i<x.length; i++) {
				x[i].classList.remove("autocomplete-active");
			}
		}
		let closeLists = (element) => {
			let x = document.getElementsByClassName("autocomplete-items");
			for (let i=0; i<x.length; i++) {
				if (element != x[i] && element != input) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}
		document.addEventListener("click", function(e) {
			closeLists(e.target);
		})
}
let searchInput = document.getElementById("search-input");
//implement the function on key press
autocomplete(searchInput, searchOptions, 2);

//click on search icon
searchInput.addEventListener("keyup", function(e) {
	let recipeCards = Array.from(document.getElementsByClassName("recipe-card"));
	if (e.target.value.length > 2) {
		let input = searchInput.value.toLowerCase();

		for (let i = 0; i< recipeCards.length; i++) {
			if (!recipeCards[i].innerHTML.toLowerCase().includes(input)) {
				recipeCards[i].style.display = "none";
			} else {
				recipeCards[i].removeAttribute("style");
			}
		}
	} else {
		recipeCards.forEach(recipe => {
			recipe.removeAttribute("style");
		})
	}
})

//add item function for dropdown options
let addItem = (array, parentElm) => {
	array.forEach(item => {
		let option = create("li", {class: "dropdown-item"});
		option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
		parentElm.appendChild(option);
	})
}
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

/*
//function to get computed style of an element
function getStyle(el, name) {
	if (document.defaultView && document.defaultView.getComputedStyle) {
		let style = document.defaultView.getComputedStyle(el, null);
		if (style)
			return style[name];
	}
	//for IE
	else if(el.currentStyle)
		return el.currentStyle[name];
}*/ //for unknown reason, it doesn't work if I get the computed style?

//function on tag buttons
let openDropdown = (btn, placeholder, id) => {
	btn.addEventListener("click", function() {
		if (!btn.hasAttribute("style")) {
			removeClass(dropDownOptions, "show-opts");
			btn.style.width = "400px";
			btn.innerHTML = "<input type='text' class='tag-search'" + placeholder + id + "class='tag-search-bar'><span class='fas fa-chevron-up'></span>";
			btn.nextElementSibling.classList.add("show-opts");
		} 
	})
}
let removeClass = (array, className) => {
	array.forEach(item => {
		item.classList.remove(className);
	})
}
let removeAttr = (array, attr) => {
	array.forEach(item => {
		item.removeAttribute(attr);
	})
}
//implement function to each button
openDropdown(document.getElementById("ingredients-tag-btn"), "placeholder='Rechercher un ingrédient...'", "id='ingredient-search'");
openDropdown(document.getElementById("appliances-tag-btn"), "placeholder='Rechercher un appareil...'", "id='appliance-search'");
openDropdown(document.getElementById("utensils-tag-btn"), "placeholder='Rechercher un ustensil...'", "id='utensil-search'");


let dropDownOptions = Array.from(document.getElementsByClassName("dropdown-options"));

document.addEventListener("click", function(e) {
	if (e.target.matches(".fa-chevron-up")) {
		e.target.parentElement.removeAttribute("style");
		e.target.parentElement.innerHTML = e.target.parentElement.getAttribute("data-val") + "<span class='fas fa-chevron-down'></span>";
		removeClass(dropDownOptions, "show-opts");
	}
})

document.addEventListener("click", function(e) {
	if (e.target.matches("#ingredient-search")) {
		autocomplete(document.getElementById("ingredient-search"), ingredientsOptions, 0);
		removeClass(dropDownOptions, "show-opts");
	} else if (e.target.matches("#appliance-search")) {
		autocomplete(document.getElementById("appliance-search"), appliancesOptions, 0);
		removeClass(dropDownOptions, "show-opts");
	} else if (e.target.matches("#utensil-search")) {
		autocomplete(document.getElementById("utensil-search"), utensilsOptions, 0);
		removeClass(dropDownOptions, "show-opts");
	} else if (e.target.matches(".dropdown-item")) {
		createTag(e.target);
		filterByTag(e.target);
		e.target.parentNode.previousElementSibling.removeAttribute("style");
		e.target.parentNode.previousElementSibling.innerHTML = e.target.parentNode.previousElementSibling.getAttribute("data-val") + "<span class='fas fa-chevron-down'></span>";
		removeClass(dropDownOptions, "show-opts");
	} else if (e.target.matches(".fa-times")) {
		document.getElementById("selected-tags").removeChild(e.target.parentElement);
		unfilterTag(e.target.parentElement);
	}
})

//create selected tag button
let createTag = (target) => {
	let selectedTag = create("button", {class: "btn selected-tag-btn"});
	selectedTag.innerHTML = target.textContent + "<span class='fas fa-times ml-2'></i>";
	let computedStyle = getComputedStyle(target.parentElement);
	selectedTag.style.backgroundColor = computedStyle.getPropertyValue("background-color");
	//put to DOM
	document.getElementById("selected-tags").appendChild(selectedTag);
}
//function to filter by tag
let filterByTag = (tag) => {
	let recipeCards = Array.from(document.getElementsByClassName("recipe-card"));
	let input = tag.textContent.toLowerCase();

	for (let i = 0; i<recipeCards.length; i++) {
		if (!recipeCards[i].hasAttribute("style")) {
			if (!recipeCards[i].innerHTML.toLowerCase().includes(input)) {
				recipeCards[i].style.display = "none";
			} else {
				recipeCards[i].removeAttribute("style");
			}
		}
	}
}
//function to unfilter
let unfilterTag = (tag) => {
	let recipeCards = Array.from(document.getElementsByClassName("recipe-card"));
	let input = tag.textContent.toLowerCase();
	for (let i = 0; i<recipeCards.length; i++) {
		if (recipeCards[i].hasAttribute("style") && !recipeCards[i].innerHTML.toLowerCase().includes(input)) {
				recipeCards[i].removeAttribute("style");
		}
	}
}

