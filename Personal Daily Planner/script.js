document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentDateEl = document.getElementById('current-date');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const timeInput = document.getElementById('time-input');
    const taskList = document.getElementById('task-list');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- FUNCTIONS ---

    // Display current date
    const displayCurrentDate = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    };

    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Render tasks to the DOM
    const renderTasks = () => {
        // Clear current task list
        taskList.innerHTML = '';

        // Sort tasks by time
        tasks.sort((a, b) => a.time.localeCompare(b.time));

        if (tasks.length === 0) {
            taskList.innerHTML = '<p>No tasks for today. Add one above! 🎉</p>';
            return;
        }

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;

            // Add 'done' class if task is completed
            if (task.done) {
                taskItem.classList.add('done');
            }

            // Determine time-based class (past, present, future)
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            if (task.time < currentTime) {
                taskItem.classList.add('past');
            } else {
                // For simplicity, we'll mark anything not in the past as "future"
                // A more complex logic could define a narrow "present" window
                taskItem.classList.add('future');
            }

            taskItem.innerHTML = `
                <div class="task-details">
                    <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}>
                    <div>
                        <p>${task.text}</p>
                        <span class="time-slot">${task.time}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    };

    // Add a new task
    const addTask = (e) => {
        e.preventDefault();
        
        const taskText = taskInput.value.trim();
        const taskTime = timeInput.value;

        if (taskText === '' || taskTime === '') {
            alert('Please fill in both the task and the time!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            time: taskTime,
            done: false,
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskForm.reset();
        taskInput.focus();
    };

    // Handle clicks on task list (for checkbox and delete)
    const handleTaskListClick = (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = Number(taskItem.dataset.id);

        // Toggle task completion
        if (target.classList.contains('task-checkbox')) {
            const task = tasks.find(t => t.id === taskId);
            task.done = !task.done;
            saveTasks();
            renderTasks();
        }

        // Delete task
        if (target.closest('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    };


    // --- EVENT LISTENERS ---
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskListClick);


    // --- INITIALIZATION ---
    displayCurrentDate();
    renderTasks();
    // Re-render every minute to update time-based styling (e.g., present -> past)
    setInterval(() => {
        renderTasks();
    }, 60000); 
});