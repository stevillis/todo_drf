/**
 KEY COMPONENTS:
 "activeItem" - null until an edit button is clicked. Will contain object of item we are editing
 "list_snapshot" - Will contain previous state of list. Used for removing extra rows on list update

 PROCESS:
 1 - Fetch Data and build rows "buildList()"
 2 - Create Item on form submit
 3 - Edit Item click - Prefill form and change submit URL
 4 - Delete Item - Send item id to delete URL
 5 - Cross out completed task - Event handler update item

 NOTES:
 -- Add event handlers to "edit", "delete", "title"
 -- Render with strike through items completed
 -- Remove extra data on re-render
 -- CSRF Token
 */


const BASE_URL_API = 'http://127.0.0.1:8000/api/'

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getEndpointURL(endpoint) {
    return `${BASE_URL_API}${endpoint}`;
}

function buildList() {
    const wrapper = document.querySelector('#list-wrapper');
    const taskListURL = getEndpointURL('task-list/');

    wrapper.innerHTML = '';
    fetch(taskListURL)
        .then(response => response.json())
        .then(tasks => {
            console.log(tasks)

            for (let i in tasks) {
                const item = `
                        <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                            <div style="flex:7">
                                <span class="title">${tasks[i].title}</span>
                            </div>
                            <div style="flex:1">
                                <button class="btn btn-sm btn-outline-info edit">Edit</button>
                            </div>
                            <div style="flex:1">
                                <button class="btn btn-sm btn-outline-dark delete">-</button>
                            </div>
                        </div>
                    `;

                wrapper.innerHTML += item;
            }
        });

}

function main() {
    buildList();

    const form = document.querySelector('#form-wrapper');
    form.addEventListener('submit', event => {
        event.preventDefault();

        const taskCreateURL = getEndpointURL('task-create/');
        const title = document.querySelector('#title').value;
        const csrftoken = getCookie('csrftoken');

        fetch(taskCreateURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(
                {
                    'title': title
                }
            )
        }).then(() => {
            buildList();
            document.querySelector('#form').reset();
        });
    });
}

main();