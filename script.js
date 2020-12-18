import {recipes} from './recipe-rawdata.js';

function render(data) {
	var main = document.getElementById("main");
	var recipeBlock = 
		data.map(function(recipes) {
			return "<div class='col-4'>"
			+"<article class='card'>"
				+"<img class='card-img-top' height='150px' src='#' alt='card image'>"
				+ "<div class='card-body'>"
					+ "<div class='d-flex justify-content-between'>"
						+ "<h2 class='card-title'>" + recipes.name + "</h2>"
						+ "<div class='d-flex font-weight-bold'>"
							+ "<span class='far fa-clock'></span>"
							+ "<p class='ml-2'>" + recipes.time + " min</p>"
						+ "</div>"
					+ "</div>"
					+ "<div>"
						
					+ "</div>"
				+ "</div>"
			+ "</article>"
			+ "</div>";
		})

	main.innerHTML = recipeBlock;

}

function renderIngredients(data){
	for (let key in data) {
		return "<p>" + data[key] + "</p>";
	}
}

render(recipes);