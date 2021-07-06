let boxData, url = '';
let limit = 9, offset = 0;
const modalRes = document.querySelector('.search-results');

function setBoxdata(boxId) {
  boxData = boxId;
}

document.getElementById('meal-type').addEventListener('change', (e) => {
  url = e.target.value;
})

const searchMeal = (ipId) => {
  modalRes.innerHTML = '';
  if (!url) {
    M.toast({ html: '<span>Please Select Type of Meal!</span>', classes: 'rounded teal darken-1' });
    return;
  }
  const query = document.getElementById(ipId).value;
  if (!query) {
    M.toast({ html: '<span>Please Type Some Value!</span>', classes: 'rounded teal darken-1' });
    return;
  }
  fetch('/getsearchresults', {
    method: 'POST',
    body: JSON.stringify({
      url: url,
      limit: limit,
      offset: offset,
      options: [{ key: 'query', value: query }]
    }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(data => {
    // console.log(data);
    if(data.results.length === 0){
      M.toast({ html: `Sorry! No Result Found`, classes: 'rounded' });
    }
    data.results.forEach(c => {
      let html = `<div class="res-card" id="${c.id}">
              <i class="material-icons" onclick="addToSchedule('${c.id}', '${c.image}', '${c.title}', '${url}')">add_circle_outline</i>
              <img src="${c.image}">
              <span>${c.title}</span>
            </div>`;
      modalRes.insertAdjacentHTML('beforeend', html);
    })
  }).catch(err => {
    console.log(err);
    M.toast({ html: `<span>${err.message}</span>`, classes: 'rounded' });
  })
}

const addToSchedule = (id, image, title, url) => {
  let category = 'recipe';
  if (url === 'food/ingredients/search') {
    category = 'product';
  } else if (url === 'food/menuItems/search') {
    category = 'menuitem';
  }
  // else if (url === 'food/products/search') {
  //   category = 'grocery';
  // }
  // console.log(title);
  const time = boxData.split('-')[0], day = boxData.split('-')[1];
  fetch('/addMealItem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      time: time,
      day: day,
      id: id,
      title: title,
      image: image,
      category: category
    })
  }).then(res => res.json())
    .then(resData => {
      if (resData.err) {
        M.toast({ html: `<span>${resData.err}</span>`, classes: 'rounded' });
        return;
      }
      const selectedBox = document.getElementById(boxData);
      const html = `<span id="m-${resData._id}" class="magictime foolishIn"> <img src="${image}"> <input type="number" min="1" max="10000" step="1" placeholder="quantity">
      <a href="${category == 'recipe' ? '/show/' + id : '#'}" target='__blank'> <p> ${title} </p></a>
      <i class="material-icons" onclick="removeFromSchedule('${id}', '${day}', '${time}', '${resData._id}')">remove_circle_outline</i>
      </span>`;
      selectedBox.insertAdjacentHTML('beforeend', html);
      M.toast({ html: '<b>Added Successfully</b>', classes: 'rounded  teal darken-1' });

      const selectedSummary = document.getElementById('summary-' + day);
      selectedSummary.querySelector('.t-protein').innerText = Number(resData.summary.totalProtein).toFixed(2);
      selectedSummary.querySelector('.t-fat').innerText = Number(resData.summary.totalFat).toFixed(2);
      selectedSummary.querySelector('.t-calories').innerText = Number(resData.summary.totalCalories).toFixed(2);
      selectedSummary.querySelector('.t-carbs').innerText = Number(resData.summary.totalCarbs).toFixed(2);
    }).catch(err => {
      M.toast({ html: `<span>${err.message}</span>`, classes: 'rounded' });
      console.log(err.message);
    })
}

const removeFromSchedule = (id, day, time, _id) => {

  fetch('/removeMealItem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      time: time,
      day: day,
      _id: _id,
      id: id
    })
  }).then(res => res.json())
    .then(resData => {
      if (resData.err) {
        M.toast({ html: `<span>${resData.err}</span>`, classes: 'rounded' });
        return;
      }
      document.getElementById(`m-${_id}`).classList.remove('tinDownIn', 'vanishIn');
      document.getElementById(`m-${_id}`).classList.add('holeOut');
      setTimeout(()=>{document.getElementById(`m-${_id}`).remove()}, 1000); 
      M.toast({ html: '<b>Removed Successfully!</b>', classes: 'rounded  teal darken-1' })
      const selectedSummary = document.getElementById('summary-' + day);
      selectedSummary.querySelector('.t-protein').innerText = Number(resData.summary.totalProtein).toFixed(2);
      selectedSummary.querySelector('.t-fat').innerText = Number(resData.summary.totalFat).toFixed(2);
      selectedSummary.querySelector('.t-calories').innerText = Number(resData.summary.totalCalories).toFixed(2);
      selectedSummary.querySelector('.t-carbs').innerText = Number(resData.summary.totalCarbs).toFixed(2);
    }).catch(err => {
      M.toast({ html: `<span>${err.message}</span>`, classes: 'rounded' });
      console.log(err.message);
    })
}

let planday = '', timeFrame = '', planData = '';
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const getMealPlan = () => {
  const tf = document.getElementById('time').value;
  const diet = document.getElementById('diet').value;
  const tc = document.getElementById('target-cal').value;
  const ex = document.getElementById('ex-ing').innerText;
  if (!tf || !diet) {
    M.toast({ html: `<span>Please Select All Fields!</span>`, classes: 'rounded' });
    return;
  }
  if (tc < 1000) {
    M.toast({ html: `<span>Minimum Calories should be greater than 1000</span>`, classes: 'rounded' });
    return;
  }
  const exList = ex.replaceAll(/\nclose/g, '').replaceAll('\n', ',');
  timeFrame = tf;

  fetch(`/generatemealplan?timeFrame=${tf}&diet=${diet}&targetCalories=${tc}&exclude=${exList}`).then(res => res.json())
    .then(data => {
      if (data.err) {
        M.toast({ html: `<span>${data.err}</span>`, classes: 'rounded' });
        return;
      }
      planData = data;
      const container = document.querySelector('.mealplan-results');
      let html = '';
      if (tf == 'week') {
        html = `<table class="centered">
        <thead>
          <tr>
            <th> Plan </th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thrusday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="firstcol"><b>Morning</b></td>
              ${days.map(day =>
          `<td> <a href='/show/${data.week[day].meals[0].id}' target='__blank'>
                  <div> <img src="https://spoonacular.com/recipeImages/${data.week[day].meals[0].id}-556x370.jpg">
                  <p> ${data.week[day].meals[0].title} </p> </div> </a>
                </td>`
        )}
          </tr>
          <tr>
            <td class="firstcol"><b>Noon</b></td>
            ${days.map(day =>
          `<td> <a href='/show/${data.week[day].meals[1].id}' target='__blank'>
                <div> <img src="https://spoonacular.com/recipeImages/${data.week[day].meals[1].id}-556x370.jpg">
                <p> ${data.week[day].meals[1].title} </p> </div> </a>
              </td>`
        )}
          </tr>
          <tr>
            <td class="firstcol"><b>Evening</b></td>
            ${days.map(day =>
          `<td> <a href='/show/${data.week[day].meals[2].id}' target='__blank'>
                <div> <img src="https://spoonacular.com/recipeImages/${data.week[day].meals[2].id}-556x370.jpg">
                <p> ${data.week[day].meals[2].title} </p> </div> </a>
              </td>`
        )}
          </tr>
          <tr>
            <td class="firstcol">Summary</td>
              ${days.map(day =>
          `<td>
                  <div class="day-summary">
                    <div><b>TotalProtien:</b>
                      ${data.week[day].nutrients['protein']}
                    </div>
                    <div><b>totalFat:</b>
                      ${data.week[day].nutrients['fat']}
                    </div>
                    <div><b>TotalCalories:</b>
                      ${data.week[day].nutrients['calories']}
                    </div>
                    <div><b>TotalCarbs: </b>
                      ${data.week[day].nutrients['carbohydrates']}
                    </div>
                  </div>
                </td>`
        )}
          </tr>
        </tbody>
      </table>
      `;
      } else {
        html = `
        <table class="centered">
          <thead>
            <tr>
              <th> Plan </th>
              <th>
                <select id="day-plan">
                  <option value="" disabled selected>Choose Day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thrusday">Thrusday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select> 
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="firstcol"><b>Morning</b></td>
              <td> <a href='/show/${data.meals[0].id}' target='__blank'>
                <div> <img src="https://spoonacular.com/recipeImages/${data.meals[0].id}-556x370.jpg">
                <p> ${data.meals[0].title} </p> </div> </a>
              </td>
            </tr>
            <tr>
              <td class="firstcol"><b>Noon</b></td>
              <td> <a href='/show/${data.meals[1].id}' target='__blank'>
                <div> <img src="https://spoonacular.com/recipeImages/${data.meals[1].id}-556x370.jpg">
                <p> ${data.meals[1].title} </p> </div> </a>
              </td>
            </tr>
            <tr>
              <td class="firstcol"><b>Evening</b></td>
              <td> <a href='/show/${data.meals[2].id}' target='__blank'>
                <div> <img src="https://spoonacular.com/recipeImages/${data.meals[2].id}-556x370.jpg">
                <p> ${data.meals[2].title} </p> </div> </a>
              </td>
            </tr>
            <tr>
              <td class="firstcol">Summary</td>
                <td>
                  <div class="day-summary">
                    <div><b>TotalProtien:</b>
                      ${data.nutrients['protein']}
                    </div>
                    <div><b>totalFat:</b>
                      ${data.nutrients['fat']}
                    </div>
                    <div><b>TotalCalories:</b>
                      ${data.nutrients['calories']}
                    </div>
                    <div><b>TotalCarbs: </b>
                      ${data.nutrients['carbohydrates']}
                    </div>
                  </div>
                </td>
            </tr>
          </tbody>
        </table>`
      }

      container.innerHTML = html;
      M.FormSelect.init(document.getElementById('day-plan'));
      document.getElementById('day-plan')?.removeEventListener('change', (e) => {
        planday = e.target.value;
      })
      document.getElementById('day-plan')?.addEventListener('change', (e) => {
        planday = e.target.value;
      })
      M.Modal.getInstance(document.getElementById('mealPlan-modal')).open();
    }).catch(err => {
      M.toast({ html: `<span>${err.message}</span>`, classes: 'rounded' });
      console.log(err.message);
    })
}

const setMyMealPlan = () => {
  const saveBut = document.querySelector('.waves-green.tooltipped');
  saveBut.innerHTML = `<div class="preloader-wrapper small active">
    <div class="spinner-layer spinner-blue-only">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
  </div>`;
  if (timeFrame === 'day') {
    if (!planday) { M.toast({ html: 'Please Choose a Day!', classes: 'rounded' }); saveBut.innerHTML = 'Save'; return; }
  }
  if (!planData) { M.toast({ html: 'Something Went Wrong! Please Try Again.', classes: 'rounded' }); saveBut.innerHTML = 'Save'; return; }

  fetch('/setmymealplan', {
    method: 'POST',
    body: JSON.stringify({ planday, timeFrame, planData }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(resData => {
    saveBut.innerHTML = 'Save';
    M.Modal.getInstance(document.getElementById('mealPlan-modal')).close();
    location.reload();
  }).catch(err => {
    saveBut.innerHTML = 'Save';
    M.toast({ html: `<span>${err.message}</span>`, classes: 'rounded' });
    console.log(err.message);
    M.Modal.getInstance(document.getElementById('mealPlan-modal')).close();
  })
}

// /* draggable element */
// const item = document.querySelector('.item');

// item.addEventListener('dragstart', dragStart);

// function dragStart(e) {
//   e.dataTransfer.setData('text/plain', e.target.id);
//   setTimeout(() => {
//     // e.target.classList.add('hide');
//   }, 0);
// }

// /* drop targets */
// const boxes = document.querySelectorAll('.box');

// boxes.forEach(box => {
//   box.addEventListener('dragenter', dragEnter)
//   box.addEventListener('dragover', dragOver);
//   box.addEventListener('dragleave', dragLeave);
//   box.addEventListener('drop', drop);
// });


// function dragEnter(e) {
//   e.preventDefault();
//   e.target.classList.add('drag-over');
// }

// function dragOver(e) {
//   e.preventDefault();
//   e.target.classList.add('drag-over');
// }

// function dragLeave(e) {
//   e.target.classList.remove('drag-over');
// }

// function drop(e) {
//   e.target.classList.remove('drag-over');

//   // get the draggable element
//   const id = e.dataTransfer.getData('text/plain');
//   const draggable = document.getElementById(id);

//   // add it to the drop target
//   e.target.appendChild(draggable);

//   // display the draggable element
//   draggable.classList.remove('hide');
// }


// let category = 'recipe';
//   if (url === 'food/ingredients/search' || url === 'product') {
//     category = 'product';
//   } else if (url === 'food/menuItems/search' || url === 'menuitem') {
//     category = 'menuitem';
//   } 
// else if (url === 'food/products/search') {
//   category = 'grocery';
// }