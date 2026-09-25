// Default initial todos for the app
const defaultTodos = [
    {
        id: 1,
        title: "ITEM 1",
        description: "this is an example description",
        status: "incomplete" // Options: 'incomplete', 'completed', 'pending'
    },
    {
        id: 2,
        title: "ITEM 2",
        description: "this item is completed",
        status: "completed"
    },
    {
        id: 3,
        title: "ITEM 3",
        description: "this is an example description",
        status: "pending"
    }
];

// Initialize State from LocalStorage or defaults
let todos = JSON.parse(localStorage.getItem('my_todos')) || defaultTodos;

// Save state helper
function saveTodos() {
    localStorage.setItem('my_todos', JSON.stringify(todos));
}

// DOM Elements
const todoListContainer = document.getElementById('todo-list');
const addModal = document.getElementById('add-modal');
const addTaskForm = document.getElementById('add-task-form');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const closeModalX = document.getElementById('close-modal-x');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');

// Render Function
function renderTodos() {
    todoListContainer.innerHTML = '';

    // Render regular todo cards
    todos.forEach((todo) => {
        const card = document.createElement('div');
        card.className = `todo-card ${todo.status}`;
        card.setAttribute('data-id', todo.id);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'todo-info';

        const titleRow = document.createElement('div');
        titleRow.className = 'title-row';

        const title = document.createElement('span');
        title.className = 'todo-title';
        title.textContent = todo.title;

        const badge = document.createElement('span');
        badge.className = `status-badge ${todo.status}`;
        badge.textContent = todo.status;

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

        // Delete button (SVG Trash)
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

        if (todo.status === 'completed') {
            statusBtn.classList.add('checked');
            statusBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (todo.status === 'pending') {
            statusBtn.classList.add('pending-icon');
            statusBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        } else {
            statusBtn.innerHTML = '';
        }

        statusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTodoStatus(todo.id);
        });

        rightGroup.appendChild(deleteBtn);
        rightGroup.appendChild(statusBtn);

        card.appendChild(infoDiv);
        card.appendChild(rightGroup);

        todoListContainer.appendChild(card);
    });

    // Render the fixed "+ Add New Task" card at the bottom
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

// Cycle status: incomplete -> completed -> pending -> incomplete
function toggleTodoStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            let nextStatus = 'completed';
            if (todo.status === 'incomplete') nextStatus = 'completed';
            else if (todo.status === 'completed') nextStatus = 'pending';
            else nextStatus = 'incomplete';
            return { ...todo, status: nextStatus };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
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
        const newTodo = {
            id: Date.now(),
            title: titleVal,
            description: descVal,
            status: 'incomplete'
        };
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        closeModal();
    }
});

// Initial Render
renderTodos();


