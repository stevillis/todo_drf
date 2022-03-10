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


const BASE_URL_API = 'http://127.0.0.1:8000/api/';
let activeItem = null;


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

function makeRequest(requestURL, method, body) {
    const csrftoken = getCookie('csrftoken');

    fetch(requestURL, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: body
    }).then(() => {
        buildList();
        document.querySelector('#form').reset();
    });
}

function getEndpointURL(endpoint) {
    return `${BASE_URL_API}${endpoint}`;
}

function editItem(item) {
    activeItem = item;
    document.querySelector('#title').value = activeItem.title;
}

function deleteItem(item) {
    const requestURL = getEndpointURL(`task-delete/${item.id}/`);
    const method = 'DELETE';

    makeRequest(requestURL, method, null);
}

function strikeUnstrike(item) {
    const requestURL = getEndpointURL(`task-update/${item.id}/`);
    const method = 'PUT';
    const body = JSON.stringify(
        {
            'title': item.title,
            'completed': !item.completed
        }
    );

    makeRequest(requestURL, method, body);
}

function buildList() {
    const wrapper = document.querySelector('#list-wrapper');
    const taskListURL = getEndpointURL('task-list/');

    wrapper.innerHTML = '';
    fetch(taskListURL)
        .then(response => response.json())
        .then(tasks => {
            for (let i in tasks) {
                const title = tasks[i].completed ?
                    `<span class="title line-through">${tasks[i].title}</span>` :
                    `<span class="title">${tasks[i].title}</span>`;
                const item = `
                        <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                            <div style="flex:7">
                                ${title}
                            </div>
                            <div style="flex:1">
                                <button class="btn btn-sm btn-outline-info edit">
                                    <i class="fa-solid fa-pencil"></i>
                                </button>
                            </div>
                            <div style="flex:1">
                                <button class="btn btn-sm btn-outline-dark delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;

                wrapper.innerHTML += item;
            }

            for (let i in tasks) {
                const editBtn = document.querySelectorAll('.edit')[i];
                const deleteBtn = document.querySelectorAll('.delete')[i];
                const title = document.querySelectorAll('.title')[i];

                editBtn.addEventListener('click', event => {
                    editItem(tasks[i]);
                });

                deleteBtn.addEventListener('click', event => {
                    deleteItem(tasks[i]);
                });

                title.addEventListener('click', event => {
                    strikeUnstrike(tasks[i]);
                });
            }
        });

}

function main() {
    buildList();

    const form = document.querySelector('#form-wrapper');
    form.addEventListener('submit', event => {
        event.preventDefault();

        const title = document.querySelector('#title').value;
        const body = JSON.stringify({'title': title});

        let requestURL = getEndpointURL('task-create/');
        let method = 'POST';

        if (activeItem) {
            requestURL = getEndpointURL(`task-update/${activeItem.id}/`);
            method = 'PUT';
            activeItem = null;
        }

        makeRequest(requestURL, method, body);
    });
}

main();