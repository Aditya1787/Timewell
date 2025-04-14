// Custom Cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
});

document.querySelectorAll('a, button, .goal-card').forEach(element => {
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

// Goal Form Submission
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('goalName').value;
    const description = document.getElementById('goalDescription').value;
    const target_date = document.getElementById('goalDeadline').value;

    fetch('goal.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            description: description,
            target_date: target_date
        }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadGoals(); // Refresh the goal list
            this.reset(); // Clear form
            showNotification('Goal created successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to create goal', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while creating the goal', 'error');
    });
});

// Load and display goals
function loadGoals() {
    fetch('goal.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const grid = document.getElementById('goalsGrid');
            grid.innerHTML = '';
            
            if (data.goals.length === 0) {
                grid.innerHTML = '<p style="grid-column:1/-1;color:#B0C4DE;">No goals found. Add your first goal above!</p>';
                return;
            }
            
            data.goals.forEach(goal => {
                const goalCard = document.createElement('div');
                goalCard.classList.add('goal-card');
                if (goal.is_completed) goalCard.classList.add('completed');
                goalCard.dataset.id = goal.id;
                goalCard.innerHTML = `
                    <h3>${goal.title}</h3>
                    ${goal.description ? `<p>${goal.description}</p>` : ''}
                    ${goal.target_date ? `<span class="deadline">Target: ${formatDate(goal.target_date)}</span>` : ''}
                    <button class="delete-btn">X</button>
                    <button class="complete-btn">${goal.is_completed ? '✓ Completed' : 'Mark Complete'}</button>
                `;
                
                grid.appendChild(goalCard);
                
                // Add delete functionality
                goalCard.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteGoal(goal.id);
                });
                
                // Add complete functionality
                goalCard.querySelector('.complete-btn').addEventListener('click', () => {
                    updateGoalStatus(goal.id, !goal.is_completed);
                });
                
                // Trigger animation
                setTimeout(() => goalCard.classList.add('visible'), 10);
            });
        } else if (data.message === "Not authenticated") {
            window.location.href = 'login.html';
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateGoalStatus(goalId, isCompleted) {
    fetch('goal.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: goalId,
            is_completed: isCompleted
        }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadGoals();
            showNotification('Goal updated successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to update goal', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while updating the goal', 'error');
    });
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        fetch('goal.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: goalId }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadGoals();
                showNotification('Goal deleted successfully!', 'success');
            } else {
                showNotification(data.message || 'Failed to delete goal', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred while deleting the goal', 'error');
        });
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}

// Fix Navbar Links (Redirect to Other Pages)
document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        window.location.href = href;
    });
});

// Scroll Animations
function handleScroll() {
    const elements = document.querySelectorAll('.hero, .goal-input h2, #goalForm, .goal-list h2, .goal-card, .footer-links, .newsletter');
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top <= windowHeight * 0.8) {
            element.classList.add('visible');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadGoals();
});

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    .notification.show {
        transform: translateX(0);
    }
    .notification.success {
        background: #51cf66;
    }
    .notification.error {
        background: #ff6b6b;
    }
`;
document.head.appendChild(style);