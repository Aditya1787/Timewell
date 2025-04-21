// // Custom Cursor
// const cursor = document.getElementById('cursor');
// document.addEventListener('mousemove', (e) => {
//     requestAnimationFrame(() => {
//         cursor.style.left = `${e.clientX}px`;
//         cursor.style.top = `${e.clientY}px`;
//     });
// });

// document.querySelectorAll('a, button, .activity-card').forEach(element => {
//     element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
//     element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
// });

// // Theme Toggle (Sun/Moon)
// const themeToggle = document.getElementById('theme-toggle');
// themeToggle.addEventListener('click', () => {
//     document.body.classList.toggle('dark-mode');
//     const isDarkMode = document.body.classList.contains('dark-mode');
//     themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
//     localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
// });

// // Load Theme Preference on Page Load
// window.addEventListener('load', () => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//         document.body.classList.add('dark-mode');
//         themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
//     } else {
//         themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
//     }
//     handleScroll();
// });

// // Time Tracker Functionality
// document.getElementById('trackerForm').addEventListener('submit', function(e) {
//     e.preventDefault();

//     const activityName = document.getElementById('activityName').value;
//     const startBtn = this.querySelector('.start-btn');
//     const isTracking = startBtn.classList.contains('active');

//     if (!isTracking) {
//         const activityCard = document.createElement('div');
//         activityCard.classList.add('activity-card');
//         activityCard.innerHTML = `
//             <h3>${activityName}</h3>
//             <span class="timer">00:00:00</span>
//             <button class="stop-btn">X</button>
//         `;

//         const grid = document.getElementById('activitiesGrid');
//         grid.insertBefore(activityCard, grid.firstChild);

//         setTimeout(() => activityCard.classList.add('visible'), 10);

//         let seconds = 0;
//         const timerElement = activityCard.querySelector('.timer');
//         const interval = setInterval(() => {
//             seconds++;
//             const hours = Math.floor(seconds / 3600);
//             const minutes = Math.floor((seconds % 3600) / 60);
//             const secs = seconds % 60;
//             timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
//         }, 1000);

//         activityCard.querySelector('.stop-btn').addEventListener('click', () => {
//             clearInterval(interval);
//             activityCard.classList.remove('visible');
//             setTimeout(() => activityCard.remove(), 300);
//             startBtn.classList.remove('active');
//             startBtn.textContent = 'Start';
//             document.getElementById('activityName').disabled = false;
//         });

//         startBtn.classList.add('active');
//         startBtn.textContent = 'Tracking...';
//         document.getElementById('activityName').disabled = true;
//     }
// });

// // Fix Navbar Links (Redirect to Other Pages)
// document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
//     link.addEventListener('click', function(e) {
//         e.preventDefault();
//         const href = this.getAttribute('href');
//         window.location.href = href; // Simply redirect to the linked page
//     });
// });

// // Scroll Animations
// function handleScroll() {
//     const elements = document.querySelectorAll('.hero, .tracker-input h2, #trackerForm, .tracker-list h2, .activity-card, .footer-links, .newsletter');
//     elements.forEach(element => {
//         const rect = element.getBoundingClientRect();
//         const windowHeight = window.innerHeight;
//         if (rect.top <= windowHeight * 0.8) {
//             element.classList.add('visible');
//         }
//     });
// }

// window.addEventListener('scroll', handleScroll);
// window.addEventListener('load', handleScroll);

// //---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// document.addEventListener('DOMContentLoaded', function() {
//     const trackerForm = document.getElementById('trackerForm');
//     const activitiesGrid = document.getElementById('activitiesGrid');
//     let currentActivityId = null;
//     let activityInterval = null;
    
//     // Start new activity
//     trackerForm.addEventListener('submit', function(e) {
//         e.preventDefault();
//         const activityName = document.getElementById('activityName').value;
        
//         if (activityName.trim() && !currentActivityId) {
//             startActivity(activityName);
//         }
//     });
    
//     function startActivity(activityName) {
//         fetch('backend/time/time.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ activity_name: activityName }),
//             credentials: 'include'
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 currentActivityId = data.id;
//                 document.getElementById('activityName').disabled = true;
//                 document.querySelector('.start-btn').textContent = 'Tracking...';
//                 document.querySelector('.start-btn').classList.add('active');
                
//                 // Create activity card
//                 const activityCard = document.createElement('div');
//                 activityCard.classList.add('activity-card');
//                 activityCard.dataset.id = data.id;
//                 activityCard.innerHTML = `
//                     <h3>${activityName}</h3>
//                     <div class="timer">00:00:00</div>
//                     <button class="stop-btn">Stop</button>
//                 `;
//                 activitiesGrid.insertBefore(activityCard, activitiesGrid.firstChild);
                
//                 // Start timer
//                 let seconds = 0;
//                 activityInterval = setInterval(() => {
//                     seconds++;
//                     const hours = Math.floor(seconds / 3600);
//                     const minutes = Math.floor((seconds % 3600) / 60);
//                     const secs = seconds % 60;
//                     activityCard.querySelector('.timer').textContent = 
//                         `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
//                 }, 1000);
                
//                 // Stop button
//                 activityCard.querySelector('.stop-btn').addEventListener('click', () => {
//                     stopActivity(data.id, activityCard);
//                 });
//             }
//         });
//     }
    
//     function stopActivity(activityId, activityCard) {
//         fetch('backend/time/time.php', {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ id: activityId }),
//             credentials: 'include'
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 clearInterval(activityInterval);
//                 currentActivityId = null;
//                 document.getElementById('activityName').disabled = false;
//                 document.querySelector('.start-btn').textContent = 'Start';
//                 document.querySelector('.start-btn').classList.remove('active');
                
//                 // Update card with final time
//                 activityCard.querySelector('.stop-btn').remove();
//                 activityCard.querySelector('.timer').textContent += ' (completed)';
//             }
//         });
//     }
    
//     // Load recent activities
//     function loadActivities() {
//         fetch('backend/time/time.php', {
//             credentials: 'include'
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 data.activities.forEach(activity => {
//                     const activityCard = document.createElement('div');
//                     activityCard.classList.add('activity-card');
//                     activityCard.innerHTML = `
//                         <h3>${activity.activity_name}</h3>
//                         <div class="timer">
//                             ${formatDuration(activity.duration_seconds)}
//                             ${activity.end_time ? '(completed)' : ''}
//                         </div>
//                         ${!activity.end_time ? '<button class="stop-btn">Stop</button>' : ''}
//                     `;
//                     activitiesGrid.appendChild(activityCard);
                    
//                     if (!activity.end_time) {
//                         // This activity is still running (shouldn't happen normally)
//                         activityCard.querySelector('.stop-btn').addEventListener('click', () => {
//                             stopActivity(activity.id, activityCard);
//                         });
//                     }
//                 });
//             } else {
//                 window.location.href = 'login.html';
//             }
//         });
//     }
    
//     function formatDuration(seconds) {
//         if (!seconds) return '00:00:00';
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
//     }
    
//     // Initial load
//     loadActivities();
// });



// Custom Cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
});

document.querySelectorAll('a, button, .activity-card').forEach(element => {
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

// Scroll Animations
function handleScroll() {
    const elements = document.querySelectorAll('.hero, .tracker-input h2, #trackerForm, .tracker-list h2, .activity-card, .footer-links, .newsletter');
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

// Time Tracker Functionality
document.addEventListener('DOMContentLoaded', function() {
    const trackerForm = document.getElementById('trackerForm');
    const activitiesGrid = document.getElementById('activitiesGrid');
    let currentActivityId = null;
    let activityInterval = null;

    // Start new activity
    trackerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const activityName = document.getElementById('activityName').value;

        if (activityName.trim() && !currentActivityId) {
            startActivity(activityName);
        }
    });

    function startActivity(activityName) {
        fetch('backend/time/time.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activity_name: activityName }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.id) {
                currentActivityId = data.id;
                document.getElementById('activityName').disabled = true;
                const startBtn = document.querySelector('.start-btn');
                startBtn.textContent = 'Tracking...';
                startBtn.classList.add('active');

                // Create activity card
                const activityCard = document.createElement('div');
                activityCard.classList.add('activity-card');
                activityCard.dataset.id = data.id;
                activityCard.innerHTML = `
                    <h3>${activityName}</h3>
                    <div class="timer">00:00:00</div>
                    <button class="stop-btn">Stop</button>
                `;
                activitiesGrid.insertBefore(activityCard, activitiesGrid.firstChild);
                setTimeout(() => activityCard.classList.add('visible'), 10);

                // Start timer
                let seconds = 0;
                const timerElement = activityCard.querySelector('.timer');
                activityInterval = setInterval(() => {
                    seconds++;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    timerElement.textContent = 
                        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }, 1000);

                // Stop button
                activityCard.querySelector('.stop-btn').addEventListener('click', () => {
                    stopActivity(data.id, activityCard);
                });
            } else {
                console.error('Failed to start activity:', data.message || 'Unknown error');
                alert('Failed to start activity. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error starting activity:', error);
            alert('An error occurred while starting the activity.');
        });
    }

    function stopActivity(activityId, activityCard) {
        fetch('backend/time/time.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: activityId }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                clearInterval(activityInterval);
                activityInterval = null;
                currentActivityId = null;
                document.getElementById('activityName').disabled = false;
                const startBtn = document.querySelector('.start-btn');
                startBtn.textContent = 'Start';
                startBtn.classList.remove('active');

                // Update card with final time
                activityCard.querySelector('.stop-btn').remove();
                activityCard.querySelector('.timer').textContent += ' (completed)';
            } else {
                console.error('Failed to stop activity:', data.message || 'Unknown error');
                alert('Failed to stop activity. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error stopping activity:', error);
            alert('An error occurred while stopping the activity.');
        });
    }

    // Load recent activities
    function loadActivities() {
        fetch('backend/time/time.php', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.activities)) {
                activitiesGrid.innerHTML = ''; // Clear existing cards to prevent duplicates
                data.activities.forEach(activity => {
                    const activityCard = document.createElement('div');
                    activityCard.classList.add('activity-card');
                    activityCard.dataset.id = activity.id;
                    activityCard.innerHTML = `
                        <h3>${activity.activity_name}</h3>
                        <div class="timer">
                            ${formatDuration(activity.duration_seconds)}
                            ${activity.end_time ? ' (completed)' : ''}
                        </div>
                        ${!activity.end_time ? '<button class="stop-btn">Stop</button>' : ''}
                    `;
                    activitiesGrid.appendChild(activityCard);
                    setTimeout(() => activityCard.classList.add('visible'), 10);

                    if (!activity.end_time) {
                        currentActivityId = activity.id;
                        document.getElementById('activityName').disabled = true;
                        const startBtn = document.querySelector('.start-btn');
                        startBtn.textContent = 'Tracking...';
                        startBtn.classList.add('active');

                        // Start timer for ongoing activity
                        let seconds = activity.duration_seconds || 0;
                        const timerElement = activityCard.querySelector('.timer');
                        activityInterval = setInterval(() => {
                            seconds++;
                            const hours = Math.floor(seconds / 3600);
                            const minutes = Math.floor((seconds % 3600) / 60);
                            const secs = seconds % 60;
                            timerElement.textContent = 
                                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                        }, 1000);

                        activityCard.querySelector('.stop-btn').addEventListener('click', () => {
                            stopActivity(activity.id, activityCard);
                        });
                    }
                });
            } else {
                console.error('Failed to load activities:', data.message || 'Invalid response');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error loading activities:', error);
            alert('An error occurred while loading activities.');
        });
    }

    function formatDuration(seconds) {
        if (!seconds && seconds !== 0) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Initial load
    loadActivities();
});