import { Controller } from "stimulus"

export default class extends Controller {
	static targets = [ "back" ];

  connect() {
    let urlParams = new URLSearchParams(window.location.search)
    this.project_id = urlParams.get('project');
		this.task_id = urlParams.get('task');

		let back_btn = document.getElementById("back-btn");
		back_btn.setAttribute("href", `/tasks.html?project=${this.project_id}`);

		// Create references to repeatedly referenced page elements
		this.task_title = document.getElementById("task-title");
		this.task_author = document.getElementById("task-author");
		this.task_description = document.getElementById("task-description");

		// Edit task form/inputs
		this.edit_task_form = document.getElementById("edit-task-form");
		this.edit_title_input = document.getElementById("edit-title");
		this.edit_description_input = document.getElementById("description");

		// Initialise description editor variable
		this.edit_description_editor = null;

		this.edit_task_btn = document.getElementById("edit-btn");
		this.save_task_btn = document.getElementById("save-btn");
		this.cancel_task_btn = document.getElementById("cancel-btn");

    this.loadTaskDetails();
  }

  loadTaskDetails() {
    fetch(`http://localhost:8081/api/v1/projects/${this.project_id}/tasks/${this.task_id}`)
  	.then(response => {
  	  return response.json();
  	})
  	.then(response => {
			// Init global variable to reset task if edit is cancelled
			this.response = response;

			this.task_title.textContent = response.title;

			var authorInitials = response.author.match(/\b\w/g) || [];
			authorInitials = ((authorInitials.shift() || '') + (authorInitials.pop() || '')).toUpperCase();
			this.task_author.textContent = authorInitials;

			this.task_description.innerHTML = response.description;

			// Populate hidden edit task inputs
			this.edit_title_input.value = response.title;
			this.edit_description_input.value = response.description;
    });
  }

	editMode() {
		this.edit_task_btn.style.display = "none";
		this.save_task_btn.style.display = "block";
		this.cancel_task_btn.style.display = "block";

		this.task_title.style.display = "none";
		this.task_description.style.display = "none";

		this.edit_title_input.style.display = "block";

		this.edit_description_editor = document.createElement("trix-editor");
		this.edit_description_editor.setAttribute("input", "description");
		this.edit_description_editor.setAttribute("class", "col-sm-8 offset-sm-2");
		this.edit_description_editor.setAttribute("id", "edit-description-editor");
		this.edit_task_form.append(this.edit_description_editor);
	}

	viewMode() {
		this.edit_task_btn.style.display = "block";
		this.save_task_btn.style.display = "none";
		this.cancel_task_btn.style.display = "none";

		this.task_title.style.display = "block";
		this.task_description.style.display = "block";

		this.edit_title_input.style.display = "none";

		// Remove description editor
		let trix_toolbar = document.querySelector("trix-toolbar");
		this.edit_task_form.removeChild(this.edit_description_editor);
		this.edit_task_form.removeChild(trix_toolbar);
	}

	saveTask() {
		let title = this.edit_title_input.value;
		let description = this.edit_description_editor.value;
		
		let task_data = {
			title: title,
			description: description
		}

		fetch(`https://1328d1c0.ngrok.io/api/v1/projects/${this.project_id}/tasks/${this.task_id}`, {
			cache: "no-store",
    	method: "put",
    	body: JSON.stringify(task_data),
			headers: {
      	"Content-Type": "application/json"
			}
  	})
  	.then(response => {
			if (response.status == 200) {
				// Show/hide form elements to enter view mode
				this.viewMode();

				// Replace old task data with new
				this.task_title.innerHTML = title;
				this.task_description.innerHTML = description;
			} else {
				console.error(response);
			}
  	});
	}

	resetTask() {
		// Reset edit task form fields to saved data
		this.loadTaskDetails();

		// Show/hide form elements to enter view mode
		this.viewMode();
	}
}
