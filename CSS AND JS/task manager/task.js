        // Cursor Animation
        const cursor = document.getElementById('cursor');
        const trail = document.getElementById('trail');
        let lastX = 0, lastY = 0;
        
        function updateCursor(e) {
            const x = e.clientX;
            const y = e.clientY;
            
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            
            const trailX = lastX + (x - lastX) * 0.5;
            const trailY = lastY + (y - lastY) * 0.5;
            trail.style.left = `${trailX}px`;
            trail.style.top = `${trailY}px`;
            
            lastX = trailX;
            lastY = trailY;
        }
        
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => updateCursor(e));
        });
        
        document.querySelectorAll('a, button, .project-item, .task-item').forEach(element => {
            element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
        
        // Theme Toggle (Sun/Moon)
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
        
        // Load Theme Preference on Page Load
        window.addEventListener('load', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            handleScroll();
        });
        
        // Task Manager Functionality
        const taskForm = document.getElementById('taskForm');
        const taskList = document.getElementById('taskList');
        
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const projectName = document.getElementById('projectInput').value;
            const taskText = document.getElementById('taskInput').value;
            if (projectName.trim() && taskText.trim()) {
                addProject(projectName, taskText);
                document.getElementById('projectInput').value = '';
                document.getElementById('taskInput').value = '';
            }
        });
        
        function addProject(projectName, initialTask) {
            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item');
            projectItem.innerHTML = `
                <h3>${projectName}</h3>
                <div class="tasks-container"></div>
                <button class="delete-project-btn">Delete Project</button>
            `;
            taskList.insertBefore(projectItem, taskList.firstChild);
            
            // Animate in
            setTimeout(() => projectItem.classList.add('visible'), 10);
        
            // Add initial task
            addTask(projectItem.querySelector('.tasks-container'), initialTask);
        
            // Delete Project with Animation
            projectItem.querySelector('.delete-project-btn').addEventListener('click', () => {
                projectItem.style.transform = 'scale(0.9)';
                projectItem.style.opacity = '0';
                setTimeout(() => projectItem.remove(), 500);
            });
        }
        
        function addTask(container, text) {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.innerHTML = `
                <span>${text}</span>
                <div>
                    <button class="complete-btn">Complete</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            container.appendChild(taskItem);
            
            // Animate in
            setTimeout(() => taskItem.classList.add('visible'), 10);
        
            // Complete Task
            taskItem.querySelector('.complete-btn').addEventListener('click', () => {
                taskItem.classList.toggle('completed');
            });
        
            // Delete Task with Animation
            taskItem.querySelector('.delete-btn').addEventListener('click', () => {
                taskItem.style.transform = 'scale(0.9)';
                taskItem.style.opacity = '0';
                setTimeout(() => taskItem.remove(), 500);
            });
        }
        
        // Fix Navbar Links (Redirect to Other Pages)
        document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                window.location.href = href; // Simply redirect to the linked page
            });
        });
        
        // Scroll Animations
        function handleScroll() {
            const elements = document.querySelectorAll('.hero, .task-form, .project-item, .footer-links, .social-links');
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (rect.top <= windowHeight * 0.8) {
                    element.classList.add('visible');
                }
            });
        }
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('load', handleScroll);
        
        //------------------------------------------------------------------------------------------------------------------------------------------------------
        document.addEventListener('DOMContentLoaded', function() {
            const taskForm = document.getElementById('taskForm');
            const taskList = document.getElementById('taskList');
            
            // Add new task
            taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const taskName = document.getElementById('taskName').value;
                const taskDescription = document.getElementById('taskDescription').value;
                const dueDate = document.getElementById('dueDate').value;
                const priority = document.getElementById('priority').value;
                
                if (taskName.trim()) {
                    addTask({
                        title: taskName,
                        description: taskDescription,
                        due_date: dueDate,
                        priority: priority
                    });
                    taskForm.reset();
                }
            });
            
            function addTask(taskData) {
                fetch('backend/tasks/tasks.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData),
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadTasks(); // Refresh the task list
                    }
                });
            }
            
            // Load existing tasks
            function loadTasks() {
                fetch('backend/tasks/tasks.php', {
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        taskList.innerHTML = '';
                        data.tasks.forEach(task => {
                            const taskItem = document.createElement('div');
                            taskItem.classList.add('task-item');
                            taskItem.dataset.id = task.id;
                            
                            // Determine priority class
                            let priorityClass = '';
                            if (task.priority === 'high') priorityClass = 'priority-high';
                            else if (task.priority === 'low') priorityClass = 'priority-low';
                            
                            // Determine status class
                            let statusClass = '';
                            if (task.status === 'completed') statusClass = 'completed';
                            else if (task.status === 'in_progress') statusClass = 'in-progress';
                            
                            taskItem.innerHTML = `
                                <div class="task-header">
                                    <h3 class="${priorityClass}">${task.title}</h3>
                                    <span class="task-status ${statusClass}">${formatStatus(task.status)}</span>
                                </div>
                                ${task.description ? `<p>${task.description}</p>` : ''}
                                ${task.due_date ? `<p class="due-date">Due: ${formatDate(task.due_date)}</p>` : ''}
                                <div class="task-actions">
                                    <select class="status-select" data-id="${task.id}">
                                        <option value="not_started" ${task.status === 'not_started' ? 'selected' : ''}>Not Started</option>
                                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                    <button class="edit-btn">Edit</button>
                                    <button class="delete-btn">Delete</button>
                                </div>
                            `;
                            taskList.appendChild(taskItem);
                            
                            // Status change
                            taskItem.querySelector('.status-select').addEventListener('change', function() {
                                updateTaskStatus(task.id, this.value);
                            });
                            
                            // Delete task
                            taskItem.querySelector('.delete-btn').addEventListener('click', function() {
                                deleteTask(task.id);
                            });
                            
                            // Edit task (you would implement this)
                            taskItem.querySelector('.edit-btn').addEventListener('click', function() {
                                // Implement edit functionality
                            });
                        });
                    } else {
                        window.location.href = 'login.html';
                    }
                });
            }
            
            function updateTaskStatus(taskId, status) {
                fetch('backend/tasks/tasks.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: taskId,
                        status: status
                    }),
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadTasks(); // Refresh the list
                    }
                });
            }
            
            function deleteTask(taskId) {
                if (confirm('Are you sure you want to delete this task?')) {
                    fetch('backend/tasks/tasks.php', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: taskId }),
                        credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            loadTasks(); // Refresh the list
                        }
                    });
                }
            }
            
            function formatStatus(status) {
                const statusMap = {
                    'not_started': 'Not Started',
                    'in_progress': 'In Progress',
                    'completed': 'Completed'
                };
                return statusMap[status] || status;
            }
            
            function formatDate(dateString) {
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString(undefined, options);
            }
            
            // Initial load
            loadTasks();
        });