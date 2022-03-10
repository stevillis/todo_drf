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


const PROD_BASE_URL = 'https://todo-drf-vanillajs.herokuapp.com/';
const DEV_BASE_URL = 'http://127.0.0.1:8000/';

const API_URL = `${PROD_BASE_URL}api/`;
let activeItem = null;
let tasksSnapshot = [];


function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
}

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
    return `${API_URL}${endpoint}`;
}

function editItem(item) {
    const title = document.querySelector('#title');

    activeItem = item;
    title.value = activeItem.title;
    title.focus();
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

    // wrapper.innerHTML = '';

    fetch(taskListURL)
        .then(response => response.json())
        .then(tasks => {
            for (let i in tasks) {
                try {
                    document.querySelector(`#data-row-${i}`).remove();
                } catch (error) {

                }

                const created = new Date(tasks[i].created);
                const updated = new Date(tasks[i].updated);
                const createdFormated = formatDate(created);
                const updatedFormated = formatDate(updated);
                const title = tasks[i].completed ?
                    `<span id="task-title" class="title line-through">${tasks[i].title}</span>` :
                    `<span id="task-title" class="title">${tasks[i].title}</span>`;

                const taskDoneAt = tasks[i].completed ? `<br><small>Concluída em: ${updatedFormated}</small>` : '';

                const item = `
                        <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                            <div style="flex:7" class="data">
                                ${title}
                                <br>
                                <small>
                                    Criada em: ${createdFormated}
                                </small>
                                ${taskDoneAt}
                            </div>
                            <div style="flex:1" class="text-center">
                                <button class="btn btn-sm btn-outline-info edit">
                                    <i class="fa-solid fa-pencil"></i>
                                </button>
                            </div>
                            <div style="flex:1" class="text-center">
                                <button class="btn btn-sm btn-outline-danger delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;

                wrapper.innerHTML += item;
            }

            if (tasksSnapshot.length > tasks.length) {
                for (let i = tasks.length; i < tasksSnapshot.length; i++) {
                    document.querySelector(`#data-row-${i}`).remove();
                }
            }
            tasksSnapshot = tasks;

            for (let i in tasks) {
                const editBtn = document.querySelectorAll('.edit')[i];
                const deleteBtn = document.querySelectorAll('.delete')[i];
                const data = document.querySelectorAll('.data')[i];

                editBtn.addEventListener('click', event => {
                    editItem(tasks[i]);
                });

                deleteBtn.addEventListener('click', event => {
                    deleteItem(tasks[i]);
                });

                data.addEventListener('click', event => {
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