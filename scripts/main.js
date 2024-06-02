document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    const days = document.getElementById('days');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        tasksContainer.innerHTML = '';
        const currentDay = document.querySelector('aside ul li.selected')?.getAttribute('data-day') || 'Monday';
        (tasks[currentDay] || []).forEach((task, index) => {
            const taskElem = document.createElement('div');
            taskElem.className = `task ${task.completed ? 'completed' : ''} animate__animated`;
            taskElem.draggable = true;
            taskElem.innerHTML = `
                <span>${task.name}</span>
                <div>
                    <button class="completeBtn">${task.completed ? 'Desmarcar' : 'Completar'}</button>
                    <button class="editBtn">Editar</button>
                    <button class="deleteBtn">Excluir</button>
                </div>
            `;

            taskElem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ day: currentDay, index }));
                taskElem.classList.add('animate__bounceOut');
            });

            taskElem.addEventListener('dragend', (e) => {
                taskElem.classList.remove('animate__bounceOut');
                taskElem.classList.add('animate__bounceIn');
            });

            tasksContainer.appendChild(taskElem);

            taskElem.querySelector('.completeBtn').addEventListener('click', () => {
                tasks[currentDay][index].completed = !tasks[currentDay][index].completed;
                saveTasks();
                renderTasks();
            });

            taskElem.querySelector('.editBtn').addEventListener('click', () => {
                const newName = prompt('Editar tarefa:', tasks[currentDay][index].name);
                if (newName) {
                    tasks[currentDay][index].name = newName;
                    saveTasks();
                    renderTasks();
                }
            });

            taskElem.querySelector('.deleteBtn').addEventListener('click', () => {
                tasks[currentDay].splice(index, 1);
                saveTasks();
                renderTasks();
            });
        });
        updateTaskCounts();
    };

    const updateTaskCounts = () => {
        const days = document.querySelectorAll('#days li');
        days.forEach(dayElem => {
            const day = dayElem.getAttribute('data-day');
            const pendingTasks = (tasks[day] || []).filter(task => !task.completed).length;
            let taskCountElem = dayElem.querySelector('.task-count');
            if (!taskCountElem) {
                taskCountElem = document.createElement('span');
                taskCountElem.className = 'task-count';
                dayElem.appendChild(taskCountElem);
            }
            taskCountElem.textContent = pendingTasks;
            taskCountElem.style.display = pendingTasks > 0 ? 'inline' : 'none';
        });
    };

    addTaskBtn.addEventListener('click', () => {
        const taskName = taskInput.value.trim();
        if (taskName) {
            const currentDay = document.querySelector('aside ul li.selected')?.getAttribute('data-day') || 'Monday';
            tasks[currentDay] = tasks[currentDay] || [];
            tasks[currentDay].push({ name: taskName, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        } else {
            alert('Por favor, insira uma tarefa.');
        }
    });

    days.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            document.querySelectorAll('aside ul li').forEach(li => li.classList.remove('selected'));
            e.target.classList.add('selected');
            renderTasks();
        }
    });

    days.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'LI') {
            e.target.classList.add('dragover');
        }
    });

    days.addEventListener('dragleave', (e) => {
        if (e.target.tagName === 'LI') {
            e.target.classList.remove('dragover');
        }
    });

    days.addEventListener('drop', (e) => {
        if (e.target.tagName === 'LI') {
            e.preventDefault();
            e.target.classList.remove('dragover');
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const targetDay = e.target.getAttribute('data-day');
            if (targetDay !== data.day) {
                const task = tasks[data.day].splice(data.index, 1)[0];
                tasks[targetDay] = tasks[targetDay] || [];
                tasks[targetDay].push(task);
                saveTasks();
                renderTasks();
            }
        }
    });

    renderTasks();
});
