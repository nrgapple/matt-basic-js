// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");

let dreams = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById("dreams");
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements["note"];
const dreamsClearButton = document.getElementById("clear-dreams");

// a helper function to call when our request for dreams is done
const getDreamsListener = function() {
  // parse our response to convert to JSON
  dreams = JSON.parse(this.responseText);
  
  // iterate through every dream and add it to our page
  dreams.forEach(function(row) {
    appendNewDream(row.body, new Date(row.time_created));
  });
};

const refresh = () => {
  // request the dreams from our app's sqlite database
  const dreamRequest = new XMLHttpRequest();
  dreamRequest.onload = getDreamsListener;
  dreamRequest.open("get", "/api/get/notes");
  dreamRequest.send();
};

refresh();

const postDream = (dream) => {
  var dreamPost = new XMLHttpRequest();
  dreamPost.open("post", "/api/post/note", true);
  dreamPost.setRequestHeader("Content-Type", "application/json");
  dreamPost.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(`request was successful.`);
    }
  }
  
  console.log(dream);
  var dreamObj = {
    "note": dream
  };
  dreamPost.send(JSON.stringify(dreamObj));
};

// a helper function that removes all notes from the list.
const deleteDreams = () => {
  var dreamDelete = new XMLHttpRequest();
  dreamDelete.open("delete", "/api/delete/notes", true);
  dreamDelete.setRequestHeader("Content-Type", "application/json");
  dreamDelete.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(`delete was successful`);
    }
  }
  dreamDelete.send();
}

// a helper function that creates a list item for a given dream
const appendNewDream = function(dream, timeCreated) {
  
  
  const markup = `
    <div class="section__text mdl-cell mdl-cell--12-col-desktop mdl-cell--8-col-tablet mdl-cell--4-col-phone">
      <h5>${timeCreated.toUTCString()}</h5>
        ${dream}
    </div>     
  `;
  
  const newItem = document.createElement("div");
  dreamsList.innerHTML += markup;
};


/**************************************
 events
***************************************/

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  const dreamsClearButton = document.getElementById("clear-dreams");
  // stop our form submission from refreshing the page
  event.preventDefault();
  
  if (dreamInput.value === "")
    return;
  
  // get dream value and add it to the list
  dreams.push(dreamInput.value);
  postDream(dreamInput.value);
  appendNewDream(dreamInput.value, new Date());

  // reset form
  dreamInput.value = "";
  dreamInput.focus();
};

dreamsClearButton.onclick = function() {
  console.log("Clear button clicked.");
  deleteDreams();
  location.reload(true);
}
