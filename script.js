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
let ingredientsOptions = [...new Set(recipesArray.map(a => a[1].ingredients.map(b => b.ingredient)).flat())];
//words from ingredients options
let ingredientsWords = [...new Set(splitString(ingredientsOptions).flat())];
//get lists of words from recipe name 
let recipeName = [...new Set(recipesArray.map(a => a[1].name))];
let recipeNameWords = [...new Set(splitString(recipeName).flat())];
//get lists of words from descriptions
let recipeDesc = [...new Set(recipesArray.map(a => a[1].description))];
let recipeDescWords = [...new Set(splitString(recipeDesc).flat())];
//combine all options into one array for the main search
let searchOptions = [...new Set(ingredientsWords.concat(recipeNameWords, recipeDescWords))]; //array of 890 strings

var tree = tokenTree(searchOptions);
var currentTokenSet = 'co'; 
//var list = tree.getWords(currentTokenSet);

console.log(tree.getWords("ma"));