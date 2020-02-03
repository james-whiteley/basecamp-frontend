import { Controller } from "stimulus"

export default class extends Controller {
  static targets = ["task"];

  connect() {
    this.online = navigator.onLine;

    let urlParams = new URLSearchParams(window.location.search)
    this.project_id = urlParams.get('project');
    
    let observer;
    if (this.online) {
      observer = new IntersectionObserver(() => this.load());
    } else {
      observer = new IntersectionObserver(() => this.loadOffline(this.project_id));
    }

    let load_more_div = document.getElementById("load-more");
    observer.observe(load_more_div);

    // Init next task page number for fetching paged results from API
    this.nextPage = 1;
  }

  load() {
    fetch(`https://1328d1c0.ngrok.io/api/v1/projects/${this.project_id}/tasks?per_page=12&page=${this.nextPage}`, {cache: "no-store"})
  	.then(response => {
  	  return response.json();
  	})
  	.then(response => {
      if (response.length > 0) {
        // Save tasks to local storage
        this.saveToIndexedDB(response);

        this.populateTaskCards(response);
      } else {
        document.getElementById("load-more").style.display = "none";
      }
  	})
		.catch(error => {
			console.log(error);
		});

    // Increment page number to get next page on next fetch from API
    this.nextPage++;
  }

  loadOffline(project_id) {
    let db;
    let connect = indexedDB.open('basecamp', 1);

    connect.onerror = function(event) {
      console.log(request.errorCode);
    };

    let that = this;
    connect.onsuccess = function(event) {
      db = event.target.result;

      var transaction = db.transaction(["tasks"], "readonly");
      var objectStore = transaction.objectStore("tasks");
      var projectIdIndex = objectStore.index('project_id');
      var request = projectIdIndex.getAll(parseInt(project_id));

      request.onerror = function(requestError) {
        console.log(requestError);
      }

      request.onsuccess = function(requestEvent) {
        that.populateTaskCards(requestEvent.target.result);
      }
    };
  }

  populateTaskCards(data) {
    let row_div = document.createElement("div");
    row_div.setAttribute("class", "row offset-sm-2 col-sm-8");
    document.getElementById("task-cards").appendChild(row_div);

  	for (var key in data) {
    	if (data.hasOwnProperty(key)) {
        let keyInt = parseInt(key);
        if ((keyInt !== 0) && (keyInt % 3 == 0)) {
          row_div = document.createElement("div");
          row_div.setAttribute("class", "row offset-sm-2 col-sm-8");
          document.getElementById("task-cards").appendChild(row_div);
        }

        // Create row column div element
			  let col_div = document.createElement("a");
        col_div.setAttribute("href", `/task.html?project=${this.project_id}&task=${data[key].id}`);
        col_div.setAttribute("class", "task-link col-sm-4");

        // Create card div element
			  let card_div = document.createElement("div");
        card_div.setAttribute("class", "card");

        // Create card body div element
			  let card_body_div = document.createElement("div");
        card_body_div.setAttribute("class", "card-body");

        // Create card title header element and set content
			  let card_title = document.createElement("h5");
        card_title.setAttribute("class", "card-title");
        card_title.textContent = data[key].title;

        // Create card text p element and set content
			  let card_text = document.createElement("p");
        card_text.setAttribute("class", "card-text");
        card_text.innerHTML = data[key].description;

        let card_text_fade = document.createElement("div");
        card_text_fade.setAttribute("class", "card-text-fade");

        let card_footer = document.createElement("div");
        card_footer.setAttribute("class", "card-footer");
        let card_author = document.createElement("div");
        card_author.setAttribute("class", "card-author");
        card_author.style.backgroundColor = this.generateColor();
        let authorInitials = data[key].author.match(/\b\w/g) || [];
			  authorInitials = ((authorInitials.shift() || '') + (authorInitials.pop() || '')).toUpperCase();
			  card_author.textContent = authorInitials;
        card_footer.appendChild(card_author);

        // Append card title and text to card body
			  card_body_div.appendChild(card_title);
			  card_body_div.appendChild(card_text);

        // Append card body to card element
			  card_div.appendChild(card_body_div);
        card_div.appendChild(card_text_fade);
        card_div.appendChild(card_footer);

        // Append card element to row col
			  col_div.appendChild(card_div);

        // Add complete card to #project-cards div
        row_div.appendChild(col_div);
    	}
		}
  }

  saveToIndexedDB(data) {
    let db;
    let request = indexedDB.open('basecamp', 1);

    request.onerror = function(event) {
      console.log(request.errorCode);
    };

    request.onsuccess = function(event) {
      db = event.target.result;

      var transaction = db.transaction(["tasks"], "readwrite");

      var objectStore = transaction.objectStore("tasks");
      data.forEach(function(task) {
        var request = objectStore.add(task);
        request.onsuccess = function(event) {
          //console.log(event);
          // event.target.result === customer.ssn;
        };
      });
    };
  }

  generateColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      // Ensure colour is dark enough to make text visible in all cases
      if (i == 0) {
        color += letters[Math.floor(Math.random() * 10)];
      } else {
        color += letters[Math.floor(Math.random() * 16)];
      }
    }
    return color;
  }
}
