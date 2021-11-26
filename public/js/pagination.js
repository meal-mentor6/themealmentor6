const container = document.querySelector(".page-content");

let limit = 9;
let pageCount = 0;
let loading = true;
// console.log(currOptions, random, favRecipes);

document.querySelector('.progress').style.visibility = "hidden";

const getPost = async () => {
    loading = true;
	document.querySelector('.progress').style.visibility = "visible";
	const res = await fetch('/recipes-pagination',{
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			url: random ? 'recipes/random' : 'recipes/complexSearch',
			limit: limit,
			offset: pageCount,
			custom: random,
			options: currOptions
		})
	});
    const data = await res.json();
	console.log(data);
    data.recipes.map((card,index)=>{
        const htmlData = `
        	<div> 
			<article class="card card--1">
			<button onclick="favoriteHandler('${card.id}','${card.title}','${card.image}')" class="btn-floating pulse cardLike">
				<i class="material-icons fav-icon" id="${card.id}"> ${favRecipes.includes(card.id.toString()) ?  'favorite' : 'favorite_border' } </i>
			</button>
			<a href="/show/${card.id}" class="card_link">
			<div class="card__img" style="background-image: url('${card.image}');"> </div>
				<div class="card__img--hover" style="background-image: url('${card.image}');"> </div> 
				<div class="card__info">
					<p class="card__title">${card.title}</p>
				</div>
			</a>
			</article>
			</div>
        `;

        container.insertAdjacentHTML("beforeend", htmlData);
    })
	loading = false;
	document.querySelector('.progress').style.visibility = "hidden";
}

getPost();

function getScrollXY() {
	var scrOfX = 0,
		scrOfY = 0;
	if (typeof window.pageYOffset == 'number') {
		//Netscape compliant
		scrOfY = window.pageYOffset;
		scrOfX = window.pageXOffset;
	} else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
		//DOM compliant
		scrOfY = document.body.scrollTop;
		scrOfX = document.body.scrollLeft;
	} else if (
		document.documentElement &&
		(document.documentElement.scrollLeft || document.documentElement.scrollTop)
	) {
		//IE6 standards compliant mode
		scrOfY = document.documentElement.scrollTop;
		scrOfX = document.documentElement.scrollLeft;
	}
	return [scrOfX, scrOfY];
}

function getDocHeight() {
	var D = document;
	return Math.max(
		D.body.scrollHeight,
		D.documentElement.scrollHeight,
		D.body.offsetHeight,
		D.documentElement.offsetHeight,
		D.body.clientHeight,
		D.documentElement.clientHeight
	);
}

document.addEventListener('scroll', function (event) {
	if (getDocHeight() - 1 <= getScrollXY()[1] + window.innerHeight) {
		console.log("new page fired");
		if(!loading) {
			pageCount += limit;
			getPost();
		}
	}
});


const favoriteHandler = (id, title, image)=>{
	// console.log(id, title, image);
	if(!id || !title || !image) return;
	fetch(`/handleFavorites?id=${id}&title=${title}&image=${image}`).then(res=>res.json())
	.then(data=>{
		if(data.err){
			M.toast({html: `<span> ${data.err} </span>`, classes: 'rounded deep-orange darken-3'})	
		}
		if(data.message){
			if(data.code == 1){
				document.getElementById(`${id}`).innerText = 'favorite';
				M.toast({html: `<span> ${data.message} </span>`, classes: 'rounded orange darken-4'})
			}else{
				document.getElementById(`${id}`).innerText = 'favorite_border';
				M.toast({html: `<span> ${data.message} </span>`, classes: 'rounded orange darken-4'})
			}
		}
	}).catch(err=>{
		console.log(err.message);
		M.toast({html: `<span> ${err.message} </span>`, classes: 'rounded deep-orange darken-3'})	
	})
}