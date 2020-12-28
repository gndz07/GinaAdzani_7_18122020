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

//token tree creation function
let tokenTree = function (tokenArray) {
	let createLetterObject = function (l) {
    	let pChildren = [];

    	let getMatchingWords = function (characterArr, availableWords, children) {
        	if (characterArr.length === 0) {
            	for (let child in children) {
                	if ({}.hasOwnProperty.call(children, child)) {
                    	let currentChild = children[child];

                    	let words = currentChild.getWords(characterArr);

                    	for (let pos in words) {
                        	if ({}.hasOwnProperty.call(words, pos)) {
                            	availableWords.push(words[pos]);
                        	}
                    	}

                    	if (currentChild.word) {
                        	availableWords.push(currentChild.word);
                    	}
                	}
            	}
        	} else {
            	let currentCharacter = characterArr.pop();
           		getMatchingWords(characterArr, availableWords, children[currentCharacter].children);
        	}
    	};

    	function getWords(wordPart) {
        	let len = wordPart.length;
        	let arr = [];
        	let wordList = [];

        	for (let i = len - 1; i >= 0; i --) {
            	arr.push(wordPart[i].toUpperCase());
        	}

        	getMatchingWords(arr, wordList, pChildren);

        	return wordList;
   		}

    	return {
        	letter: l,
        	children: pChildren,
        	parent: null,
        	word: null,
        	getWords: getWords
    	};
	};

	let startingPoint = createLetterObject();

	function parseWord(wordCharacterArray, parent, fullWord) {
    	if (wordCharacterArray.length === 0) {
        	parent.word = fullWord;
        	return;
    	}

    	let currentCharacter = wordCharacterArray.pop().toUpperCase();

    	if (!parent.children[currentCharacter]) {
       		parent.children[currentCharacter] = createLetterObject(currentCharacter);
    	}
    	parseWord(wordCharacterArray, parent.children[currentCharacter], fullWord);
	}

	for (let counter in tokenArray) {
    	if ({}.hasOwnProperty.call(tokenArray, counter)) {
        	let word = tokenArray[counter];

        	if (!word) {
            	continue;
        	}

        	let arr = [];

        	let wordLength = word.length;

        	for (let i = wordLength - 1; i >= 0; i--) {
            	arr.push(word[i]);
        	}
        	parseWord(arr, startingPoint, word);
    	}
	}
  	return startingPoint;
};


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
				//launch the trie function
				let tree = tokenTree(arr);
				let lists = tree.getWords(val);
				//shows each item in the list
				lists.forEach(item => {
					let b = create("p");
					b.textContent = item;
					//when click on the value
					b.addEventListener("click", function() {
						//insert value
						input.value = this.textContent;
						//close list
						closeLists();
					});
					a.appendChild(b);
				})
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

//implement the function on key press
autocomplete(document.getElementById("search-input"), searchOptions, 2);

//add item to dropdown function
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
	}
})
