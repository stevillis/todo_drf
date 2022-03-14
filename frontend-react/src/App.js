import React, { Component } from 'react';

import './App.css';

const PROD_BASE_URL = 'https://todo-drf-vanillajs.herokuapp.com/';
const DEV_BASE_URL = 'http://127.0.0.1:8000/';

const API_URL = `${PROD_BASE_URL}api/`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      taskList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false,
        created: null,
        updated: null
      },
      editing: false,
    }

    this.getCookie = this.getCookie.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchTasks('task-list/', 'GET', null);
  }

  getCookie(name) {
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

  fetchTasks(endpoint, method, body) {
    const csrftoken = this.getCookie('csrftoken');

    fetch(`${API_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: body
    })
      .then(response => response.json())
      .then(tasks => {
        if (method === 'GET') this.setState({ taskList: tasks });
        else {
          this.fetchTasks('task-list/', 'GET', null);
          this.setState({
            activeItem: {
              id: null,
              title: '',
              completed: false
            }
          });
        }
      })
      .catch(error => console.log('Error:', error));
  }

  formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true
    });
  }

  deleteTask(task) {
    this.fetchTasks(`task-delete/${task.id}/`, 'DELETE', JSON.stringify(task));
  }

  strikeUnstrike(task) {
    task.completed = !task.completed;
    this.fetchTasks(`task-update/${task.id}/`, 'PUT', JSON.stringify(task));
  }

  handleChange(e) {
    const value = e.target.value;

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.state.editing) {
      this.fetchTasks(`task-update/${this.state.activeItem.id}/`, 'PUT', JSON.stringify(this.state.activeItem));
      this.setState({ editing: false })
    } else this.fetchTasks('task-create/', 'POST', JSON.stringify(this.state.activeItem));
  }

  render() {
    const tasks = this.state.taskList;
    const self = this;

    return (
      <div className="container">
        <div id="banner" className="text-center">
          <span id="forkongithub">
            <a href={PROD_BASE_URL}>
              VanillaJS
            </a>
          </span>
        </div>
        <h1 className="text-center bg-info text-white rounded" id="pageTitle">To Do - React</h1>
        <div id="task-container" className="border-rounded">
          <div id="form-wrapper" className="border-rounded-top">
            <form id="form" onSubmit={this.handleSubmit}>
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input type="text" id="title" name="title" value={this.state.activeItem.title} className="form-control" placeholder="Add task" maxLength="60" onChange={this.handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <button id="submit" className="btn btn-outline-success" type="submit">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper" className='border-rounded-bottom'>
            {
              tasks.map((task, index) => {
                const created = new Date(task.created);
                const updated = new Date(task.updated);
                const createdFormated = this.formatDate(created);
                const updatedFormated = this.formatDate(updated);
                const dataRowId = `data-row-${index}`;
                return (
                  <div key={index} id={dataRowId} className="task-wrapper flex-wrapper">
                    <div style={{ flex: 7 }} className="data" onClick={() => self.strikeUnstrike(task)}>
                      {
                        task.completed ?
                          <span id="task-title" className="title line-through">{task.title}</span> :
                          <span id="task-title" className="title">{task.title}</span>
                      }
                      <br />
                      <small>
                        Criada em: {createdFormated}
                      </small>
                      {
                        task.completed ? <span><br /><small>Concluída em: {updatedFormated}</small></span> : ''
                      }
                    </div>
                    <div style={{ flex: 1 }} className="text-center" onClick={() => self.startEdit(task)}>
                      <button className="btn btn-sm btn-outline-info edit">
                        <i className="fa-solid fa-pencil"></i>
                      </button>
                    </div>
                    <div style={{ flex: 1 }} className="text-center">
                      <button className="btn btn-sm btn-outline-danger delete" onClick={() => self.deleteTask(task)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        <footer>
          <ul class="d-flex justify-content-center list-unstyled">
            <li class="mx-4">
              <a href="https://www.linkedin.com/in/stevillis/" target="_blank"><i class="fab fa-linkedin"></i></a>
            </li>
            <li class="mx-4">
              <a href="https://github.com/stevillis" target="_blank"><i class="fab fa-github"></i></a>
            </li>
          </ul>
          <p class="text-black text-center">2022 - Stévillis Sousa</p>
        </footer>
      </div>
    );
  }
}

export default App;
