const API_URL = 'http://127.0.0.1:8000/todos';

// Global state array
let todos = [];

// DOM Elements
const todoListContainer = document.getElementById('todo-list');
const addModal = document.getElementById('add-modal');
const addTaskForm = document.getElementById('add-task-form');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const closeModalX = document.getElementById('close-modal-x');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');

// Step 3.1: Fetch todo data from backend
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error("Failed to fetch todos from backend:", error);
    }
}

// Step 3.2: Render returned items in the UI
function renderTodos() {
    todoListContainer.innerHTML = '';

    todos.forEach((todo) => {
        const isCompleted = todo.completed;
        const statusClass = isCompleted ? 'completed' : 'incomplete';
        const statusLabel = isCompleted ? 'Completed' : 'Incomplete';

        const card = document.createElement('div');
        card.className = `todo-card ${statusClass}`;
        card.setAttribute('data-id', todo.id);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'todo-info';

        const titleRow = document.createElement('div');
        titleRow.className = 'title-row';

        const title = document.createElement('span');
        title.className = 'todo-title';
        title.textContent = todo.title;

        const badge = document.createElement('span');
        badge.className = `status-badge ${statusClass}`;
        badge.textContent = statusLabel;

        titleRow.appendChild(title);
        titleRow.appendChild(badge);

        const desc = document.createElement('div');
        desc.className = 'todo-desc';
        desc.textContent = todo.description;

        infoDiv.appendChild(titleRow);
        infoDiv.appendChild(desc);

        // Right group container
        const rightGroup = document.createElement('div');
        rightGroup.className = 'card-right-group';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
        });

        // Status Button
        const statusBtn = document.createElement('button');
        statusBtn.className = 'status-btn';
        statusBtn.title = 'Click to toggle status';

        if (isCompleted) {
            statusBtn.classList.add('checked');
            statusBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else {
            statusBtn.innerHTML = '';
        }

        statusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTodoStatus(todo);
        });

        rightGroup.appendChild(deleteBtn);
        rightGroup.appendChild(statusBtn);

        card.appendChild(infoDiv);
        card.appendChild(rightGroup);

        todoListContainer.appendChild(card);
    });

    // Add "+ Add New Task" card button
    const newTaskCard = document.createElement('div');
    newTaskCard.className = 'todo-card new-task-card';

    const newContent = document.createElement('div');
    newContent.className = 'new-task-content';

    const plusBadge = document.createElement('div');
    plusBadge.className = 'plus-icon-badge';
    plusBadge.textContent = '+';

    const newLabel = document.createElement('span');
    newLabel.textContent = 'Add New Task';

    newContent.appendChild(plusBadge);
    newContent.appendChild(newLabel);

    newTaskCard.appendChild(newContent);
    newTaskCard.addEventListener('click', openModal);

    todoListContainer.appendChild(newTaskCard);
}

// Toggle status via backend API
async function toggleTodoStatus(todo) {
    try {
        const response = await fetch(`${API_URL}/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: todo.title,
                description: todo.description,
                completed: !todo.completed
            })
        });
        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error("Failed to update todo status:", error);
    }
}

// Add new todo via backend API
async function addTodo(title, description) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                completed: false
            })
        });
        if (response.ok) {
            fetchTodos();
            closeModal();
        }
    } catch (error) {
        console.error("Failed to add todo:", error);
    }
}

// Delete todo via backend API
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error("Failed to delete todo:", error);
    }
}

// Modal Handlers
function openModal() {
    addModal.classList.remove('hidden');
    taskTitleInput.focus();
}

function closeModal() {
    addModal.classList.add('hidden');
    addTaskForm.reset();
}

// Event Listeners
cancelModalBtn.addEventListener('click', closeModal);
closeModalX.addEventListener('click', closeModal);

addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeModal();
});

addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = taskTitleInput.value.trim();
    const descVal = taskDescInput.value.trim();

    if (titleVal && descVal) {
        addTodo(titleVal, descVal);
    }
});

// Initial Fetch on application load
fetchTodos();



