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

let createCard = (recipe) => {
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
			return "<p class='mb-0'><span class='font-weight-bold ingredient'>" + ingredients.ingredient + "</span>: "+ ingredients.quantity + ingredients.unit + "</p>";
		} else if (Object.prototype.hasOwnProperty.call(ingredients, "quantity") && !Object.prototype.hasOwnProperty.call(ingredients, "unit")) {
			return "<p class='mb-0'><span class='font-weight-bold ingredient'>" + ingredients.ingredient + "</span>: "+ ingredients.quantity + "</p>";
		} else if (!Object.prototype.hasOwnProperty.call(ingredients, "quantity") && !Object.prototype.hasOwnProperty.call(ingredients, "unit")) {
			return "<p class='mb-0'><span class='font-weight-bold ingredient'>" + ingredients.ingredient + "</span></p>";
		}
	}).join("");

	ingredients.innerHTML = eachIngredient;

	//cook method
	let method = create("p", {class: "w-50"});
	method.textContent = recipe[1].description;

	//appliance section
	let appliances = create("p", {class: "sr-only appliance"});
	appliances.textContent = recipe[1].appliance;
	//utensils section
	let utensils = create("div", {class: "sr-only"});
	let eachUtensils = recipe[1].ustensils.map(function(utensil) {
		return "<p class='utensil'>" + utensil + "</p>";
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
}

recipesArray.forEach(recipe => createCard(recipe));

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

//function sets to extract and sort all keywords
//sorting functions
let quickSort = (array, left, right) => {
	let index;
	if (array.length > 1) {
       	index = partition(array, left, right); //take index from partition
       	if (left<index-1) { //more elements on the left
       		quickSort(array, left, index-1);
       	}
       	if (index<right) { //more elements on the right
       		quickSort(array, index, right);
       	}
	}
	return array;
}
//partition code, to make a left and right elements list
let partition = (array, left, right) => {
	let pivot = array[Math.floor((right + left) / 2)]; //middle element

	while (left <= right) {
		while (array[left].localeCompare(pivot) < 0) {
			left++;
		}
		while (array[right].localeCompare(pivot) > 0) {
			right--;
		}
		if (left <= right) {
			swap(array, left, right);
			left++;
			right--;
		}
	}
	return left;
}
//function to swap position
let swap = (items, leftIndex, rightIndex) => {
	var temp = items[leftIndex];
	items[leftIndex] = items[rightIndex];
	items[rightIndex] = temp;
}
//filter and extract only id, name, ingredients, and description
let createFilteredArr = (arr) => {
	let filteredArr = [];
	for (let i = 0; i<arr.length; i++) {
		let filtered = (({id, ingredients, name, description}) => ({id, ingredients, name, description}))(arr[i][1]);
		filteredArr.push(filtered);
	}
	return filteredArr;
}
let filteredArr = createFilteredArr(recipesArray);

function FilterKeyword(item) {
	this.id = item.id;
	let thisIngre = item.ingredients.map(b => b.ingredient.toLowerCase()).flat();
	let keywordString = item.name + " " + thisIngre + " " + item.description;
	let uniqueValue = [...new Set(keywordString.split(/[\s,().]+/))];
	this.keyword = quickSort(uniqueValue, 0, uniqueValue.length-1);
}

let extractKeyword = (arr) => {
	let newArr = [];
	for (let i=0; i<arr.length; i++) {
		let keyword = new FilterKeyword(arr[i]);
		newArr.push(keyword);
	}
	return newArr;
}
let filteredKeywordArr = extractKeyword(filteredArr);
console.log(filteredKeywordArr);
//take only the keywords
let allKeywords = [];
filteredKeywordArr.forEach(item => {allKeywords.push(item.keyword)});
let searchOptions = [...new Set(allKeywords.flat())];

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
						launchSearch(e);
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
let searchInput = document.getElementById("search-input");
//implement the function on key press
autocomplete(searchInput, searchOptions, 2);

//binary search function
let binarySearch = (obj, target) => {
	let start = 0;
	let end = obj.keyword.length-1;
	while(start <= end) {
		let middleIndex = Math.floor((start+end)/2);

		if (obj.keyword[middleIndex].toLowerCase().includes(target.toLowerCase())) {
			return obj.id;
		} else if (target.toLowerCase().localeCompare(obj.keyword[middleIndex].toLowerCase()) < 0) {
			end = middleIndex - 1;
		} else if (target.toLowerCase().localeCompare(obj.keyword[middleIndex].toLowerCase()) > 0) {
			start = middleIndex +1;
		} else {
			return -1;
		}
	}
}

//function to clean all child
let removeAllChildren = (children, parent) => {
	children.forEach(child => {
		parent.removeChild(child);
	})
}
//searching function
let launchSearch = (e) => {
	let mainSection = document.getElementById("main");
	let cardElm = Array.from(document.getElementsByClassName("recipe-card"));
	if (searchInput.value.length > 2) {
		removeAllChildren(cardElm, mainSection);
		let input = e.target.value.toLowerCase();
		for (let i=0; i<filteredKeywordArr.length; i++) {
			let recipeId = binarySearch(filteredKeywordArr[i], input);
			if (recipeId > 0) {
				createCard(recipesArray[recipeId-1]);
			}
		}
	} else {
		removeAllChildren(cardElm, mainSection);
		recipesArray.forEach(recipe => createCard(recipe));
	}
}
searchInput.addEventListener("keyup", function(e) {launchSearch(e)});

//tag filtering functions
//function to add items for dropdown options
let addItem = (array, parentElm) => {
	array.forEach(item => {
		let option = create("li", {class: "dropdown-item"});
		option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
		parentElm.appendChild(option);
	})
}
//search function on tag buttons
let tagSearch = (input, options) => {
	input.addEventListener("input", function(e) {
		for (let i=0; i<options.length; i++) {
			if (!options[i].textContent.includes(e.target.value.toLowerCase())) {
				options[i].style.display = "none";
			} else {
				options[i].removeAttribute("style");
			}
		}
	})
}

let openDropdown = (btn, className, parentElm, inputId, optionsArray) => {
	//close other open dropdowns, if any
	closeAllDropdowns();
	//current dropdown DOM
	let dropdownContainer = document.getElementById(parentElm);
	//empty current dropdown
	dropdownContainer.textContent = "";
	//take available tag options from DOM
	let choices = Array.from(document.querySelectorAll(className));
	let choicesArr = [];
	choices.forEach(choice => {
		choicesArr.push(choice.textContent);
	})
	let optionsArr = [...new Set(choicesArr)];
	//put into dropdown options
	addItem(optionsArr, dropdownContainer);
	//search input DOM
	let inputField = document.getElementById(inputId);
	//run keyword search function
	tagSearch(inputField, Array.from(document.querySelectorAll(optionsArray)));
	inputField.parentElement.classList.add("show");
	dropdownContainer.parentElement.classList.add("show-opts");
	btn.style.display = "none";
};
//implement the function
//ingredient tag
document.getElementById("ingredients-tag-btn").addEventListener("click", function(e) {openDropdown(e.target, ".ingredient", "ingredients-dropdown", "ingredients-tag-input", "#ingredients-dropdown .dropdown-item")});
//appliances tag
document.getElementById("appliances-tag-btn").addEventListener("click", function(e) {openDropdown(e.target, ".appliance", "appliances-dropdown", "appliances-tag-input", "#appliances-dropdown .dropdown-item")});
//utensils tag
document.getElementById("utensils-tag-btn").addEventListener("click", function(e) {openDropdown(e.target, ".utensil", "utensils-dropdown", "utensils-tag-input", "#utensils-dropdown .dropdown-item")});

//ingredients dropdown
//tagSearch(document.getElementById("ingredients-tag-input"), Array.from(document.querySelectorAll("#ingredients-dropdown .dropdown-item")));
tagSearch(document.getElementById("appliances-tag-input"), Array.from(document.querySelectorAll("#appliances-dropdown .dropdown-item")));
tagSearch(document.getElementById("utensils-tag-input"), Array.from(document.querySelectorAll("#utensils-dropdown .dropdown-item")));
//create selected tag button
let createTag = (target) => {
	let selectedTag = create("button", {class: "btn selected-tag-btn"});
	selectedTag.innerHTML = target.textContent + "<span class='fas fa-times ml-2'></i>";
	let computedStyle = getComputedStyle(target.parentNode.parentElement);
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
//function to unfilter, NOT SURE WORKING PERFECTLY YET
let unfilterTag = (tag) => {
	let recipeCards = Array.from(document.getElementsByClassName("recipe-card"));
	let input = tag.textContent.toLowerCase();
	for (let i = 0; i<recipeCards.length; i++) {
		if (recipeCards[i].hasAttribute("style") && !recipeCards[i].innerHTML.toLowerCase().includes(input)) {
				recipeCards[i].removeAttribute("style");
		}
	}
}
//function when user click on a tag option
document.addEventListener("click", function(e) {
	if (e.target.matches(".dropdown-item")) { //selecting tag filter
		createTag(e.target);
		filterByTag(e.target);
		closeAllDropdowns();
	} else if (e.target.matches(".fa-times")) { //delete the selected tag
		document.getElementById("selected-tags").removeChild(e.target.parentElement);
		unfilterTag(e.target.parentElement);
	} else if (!e.target.matches(".tag-btn")) { //close dropdowns when clicking anywhere on the page
		closeAllDropdowns();
	}
})

//function to close all dropdowns
let closeAllDropdowns = () => {
	Array.from(document.getElementsByClassName("tag-btn")).forEach(btn => {btn.removeAttribute("style")});
	Array.from(document.getElementsByClassName("tag-search")).forEach(item => {item.classList.remove("show")});
	Array.from(document.getElementsByClassName("container-tag-options")).forEach(item => {item.classList.remove("show-opts")});
}
//close by clicking on arrow up
Array.from(document.getElementsByClassName("fa-chevron-up")).forEach(item => {
	item.addEventListener("click", function() {
		closeAllDropdowns();
	});
})
