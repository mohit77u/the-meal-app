'use strict';
const data_container = document.getElementById('foods');
const searchBtn = document.getElementById('searchBtn');
const warning = document.getElementById('warning');

// Search Btn Click Function
if (searchBtn) {
    searchBtn.addEventListener('click', function () {
        const keyword = document.getElementById('keyword').value;
        data_container.innerHTML = '';
        if (keyword === '') {
            warning.style.display = 'block';
        } else {
            getFood(keyword);
            warning.style.display = 'none';
        }
    });
}

// Render Single Food Info
const renderFoodInfo = (food) => {
    // Get all ingredients from the object. Up to 20
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (food[`strIngredient${i}`]) {
            ingredients.push(`${food[`strIngredient${i}`]} - ${food[`strMeasure${i}`]}`);
        } else {
            // Stop if there are no more ingredients
            break;
        }
    }
    const foodDetailsDiv = document.getElementById('foodsDetails');
    foodDetailsDiv.innerHTML = `
    <img class="img-fluid rounded mb-4" src="${food.strMealThumb}" alt="">
    <h4>${food.strMeal}</h4>
    
    <h5 class="pt-3 pb-2"><i class="icon-fire icons"></i> Ingredients</h5>
    <ul class="list-unstyled mb-0">
    ${ingredients.map((ingredient) => `<li><i class="icon-check icons"></i>${ingredient}</li>`).join('')}
    </ul>
`;
};
// Foods Loop
function getFood(mealId) {
    const mainApi = `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealId}`;

    fetch(mainApi)
        .then(res => res.json())
        .then(data => {
            displayFoods(data.meals);
        });

    const displayFoods = foods => {
        const foodsDiv = document.getElementById('foods');
        if (foods != null) {
            foods.map(food => {
                const foodDiv = document.createElement('div');
                foodDiv.className = 'col-sm-3';
                const foodInfo = `
                        <div class="food-box border rounded text-center h-100">
                        <img class="img-fluid rounded-top" src="${food.strMealThumb}" alt="">
                        <h4 class="h5 py-4 px-2 mb-0">${food.strMeal}</h4>
                        <div class="fav-btn-box"><div><button onClick="AddFavorites(${food.idMeal})" class="fav-btn"><i class="icon-heart"></i>Add Favourites</button><button class="view-btn" onClick="ShowSinglePage(${food.idMeal})">View Food</button></div></div>
                        </div>
                    `;
                foodDiv.innerHTML = foodInfo;
                foodsDiv.appendChild(foodDiv);
            });
        } else {
            warning.style.display = 'block';
        }
    };
}

// add to favourites
function AddFavorites(id) {
    // get items from local storage
    var meal = JSON.parse(localStorage.getItem('favMeal')) || [];
    const found = meal.some(el => el.id === id);
    console.log(found)
    if (found === false) {
        meal.push({
            id: id
        })
        // set local storage data
        localStorage.setItem('favMeal', JSON.stringify(meal))

        // to show toast and hide
        var toast = document.getElementById('toast');
        toast.classList.remove('hidden');
        document.getElementById('message').innerText = "Meal successfully added to favourites.";
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000)
    } else {
        var toast = document.getElementById('toast');
        toast.classList.remove('hidden');
        document.getElementById('message').innerText = "Meal Already Present in Your Favourites list.";
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000)
    }

}

// add to favourites
function DeleteFavorites(id) {
    // get items from local storage
    var meal = JSON.parse(localStorage.getItem('favMeal')) || [];
    const found = meal.some(el => el.id === id);
    if (found === true) {

        for(var i = 0; i < meal.length; i++) {
            if(meal[i].id == id) {
                meal.splice(i, 1);
                break;
            }
        }

        // set local storage data
        localStorage.setItem('favMeal', JSON.stringify(meal))

        // reload page to show new data after delete
        location.reload();
    }

}

// single page show
function ShowSinglePage(id) {

    // set local storage data
    localStorage.setItem('viewFood', JSON.stringify(id))
    window.location.path = '/single-meal.html'

}

// get single food details
function getSingleFood() {

    var singleFoodPage = document.getElementById('single-food')

    if (singleFoodPage !== null) {
        var mealId = localStorage.getItem('viewFood')
        if (mealId) {
            const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const meal = data.meals[0]
                    document.getElementById('meal_name').innerText = meal.strMeal
                    document.getElementById('category').innerText = meal.strCategory
                    document.getElementById('meal_image').setAttribute('src', meal.strMealThumb)
                    document.getElementById('about').innerText = meal.strInstructions

                    document.getElementById('source').setAttribute('href', meal.strSource)
                    document.getElementById('source').innerText = meal.strSource
                    var tags = meal.strTags

                    // check tags are available or not
                    if (tags === null || tags === '') {
                        document.getElementById('tag-head').style.display = 'none';
                    } else {
                        const tagsData = tags.split(/\s*,\s*/);
                        const tagMainDiv = document.getElementById('tags');
                        for (var i = 0; i < tagsData.length; i++) {
                            const tagDiv = document.createElement('div');
                            tagDiv.className = 'tag';
                            const tagInfo = `
                                <span class="single-tag">${tagsData[i]}</span>
                            `;
                            tagDiv.innerHTML = tagInfo;
                            tagMainDiv.appendChild(tagDiv);
                        }
                    }
                    if (meal.strYoutube === null || meal.strYoutube === "") {
                        document.getElementById('video_link').innerText = 'Null'
                    } else {
                        document.getElementById('video_link').innerText = meal.strYoutube
                        document.getElementById('video_link').setAttribute('href', meal.strYoutube)
                    }
                    if (meal.strArea === null || meal.strArea === "") {
                        document.getElementById('meal_area').innerText = 'Null'
                    } else {
                        document.getElementById('meal_area').innerText = '(' + meal.strArea + ')'
                    }

                });
        }
    }
}
getSingleFood();

// get favourites food list
function getFavFood() {
    var favFoodPage = document.getElementById('favourite-foods');

    if (favFoodPage !== null) {
        // get value from local storage
        const foodIds = JSON.parse(localStorage.getItem('favMeal'))
        if (foodIds.length !== 0) {
            const key = 'id';

            // get unique value from local storage
            const foodIdsUniqueByKey = [...new Map(foodIds.map(item =>
                [item[key], item])).values()];

            // for each loop fo get data from api with id of meal
            foodIdsUniqueByKey.forEach(function (data) {
                const mainApi = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.id}`;
                fetch(mainApi)
                    .then(res => res.json())
                    .then(data => {
                        const meal = data.meals[0]

                        if (meal != null) {
                            const foodsDiv = document.getElementById('fav-row');
                            const foodDiv = document.createElement('div');
                            foodDiv.className = 'col-sm-12';
                            const foodInfo = `
                                <div class="meal-box">
                                    <div class="meal-img col-sm-2"><div class="img-box"><img class="rounded-top" src="${meal.strMealThumb}" alt="${meal.strMeal}"></div></div>
                                    <div class="meal-details col-sm-6"><h4 class="">${meal.strMeal}</h4><p>${meal.strCategory}</p><p>Source: <a href="${meal.strSource}" target="blank">${meal.strSource}</a></p></div>
                                    <div class="fav-btn-box col-sm-4"><div><button class="view-btn" onClick="ShowSinglePage(${meal.idMeal})">View Meal</button> <button class="delete-btn" onClick="DeleteFavorites(${meal.idMeal})">Remove Meal</button></div></div>
                                </div>
                            `;
                            foodDiv.innerHTML = foodInfo;
                            foodsDiv.appendChild(foodDiv);
                        }
                    });
            })

        } else {
            document.getElementById('not-found').classList.remove('d-none');
        }

    }
}

getFavFood();