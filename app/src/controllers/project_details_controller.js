import { Controller } from "stimulus"

export default class extends Controller {
  connect() {
    let urlParams = new URLSearchParams(window.location.search)
    this.project_id = urlParams.get('project');

		// Create references to repeatedly referenced page elements
		this.project_title = document.getElementById("project-title");
		this.project_author = document.getElementById("project-author");
		this.project_description = document.getElementById("project-description");

		// Edit project form/inputs
		this.edit_project_form = document.getElementById("edit-project-form");
		this.edit_title_input = document.getElementById("edit-title");
		this.edit_description_input = document.getElementById("description");

		// Initialise description editor variable
		this.edit_description_editor = null;

		this.edit_project_btn = document.getElementById("edit-btn");
		this.save_project_btn = document.getElementById("save-btn");
		this.cancel_project_btn = document.getElementById("cancel-btn");

    this.loadProjectDetails();
  }

  loadProjectDetails() {
    fetch(`http://localhost:8081/api/v1/projects/${this.project_id}`)
  	.then(response => {
  	  return response.json();
  	})
  	.then(response => {
			// Init global variable to reset project if edit is cancelled
			this.response = response;

			this.project_title.textContent = response.title;

			var authorInitials = response.author.match(/\b\w/g) || [];
			authorInitials = ((authorInitials.shift() || '') + (authorInitials.pop() || '')).toUpperCase();
			this.project_author.textContent = authorInitials;

			this.project_description.innerHTML = response.description;

			// Populate hidden edit project inputs
			this.edit_title_input.value = response.title;
			this.edit_description_input.value = response.description;
    });
  }

	editMode() {
		this.edit_project_btn.style.display = "none";
		this.save_project_btn.style.display = "block";
		this.cancel_project_btn.style.display = "block";

		this.project_title.style.display = "none";
		this.project_description.style.display = "none";

		this.edit_title_input.style.display = "block";

		this.edit_description_editor = document.createElement("trix-editor");
		this.edit_description_editor.setAttribute("input", "description");
		this.edit_description_editor.setAttribute("class", "col-sm-8 offset-sm-2");
		this.edit_description_editor.setAttribute("id", "edit-description-editor");
		this.edit_project_form.append(this.edit_description_editor);
	}

	viewMode() {
		this.edit_project_btn.style.display = "block";
		this.save_project_btn.style.display = "none";
		this.cancel_project_btn.style.display = "none";

		this.project_title.style.display = "block";
		this.project_description.style.display = "block";

		this.edit_title_input.style.display = "none";

		// Remove description editor
		let trix_toolbar = document.querySelector("trix-toolbar");
		this.edit_project_form.removeChild(this.edit_description_editor);
		this.edit_project_form.removeChild(trix_toolbar);
	}

	saveProject() {
		let title = this.edit_title_input.value;
		let description = this.edit_description_editor.value;
		
		let project_data = {
			title: title,
			description: description
		}

		fetch(`http://localhost:8081/api/v1/projects/${this.project_id}`, {
    	method: 'put',
    	body: JSON.stringify(project_data),
			headers: {
      	'Content-Type': 'application/json'
			}
  	})
  	.then(response => {
			if (response.status == 200) {
				// Show/hide form elements to enter view mode
				this.viewMode();

				// Replace old project data with new
				this.project_title.innerHTML = title;
				this.project_description.innerHTML = description;
			} else {
				console.error(response);
			}
  	});
	}

	resetProject() {
		// Reset edit project form fields to saved data
		this.loadProjectDetails();

		// Show/hide form elements to enter view mode
		this.viewMode();
	}
}