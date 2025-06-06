    // Custom Cursor with Glow
    const cursor = document.getElementById('cursor');
    const cursorGlow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            const x = e.clientX;
            const y = e.clientY;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            cursorGlow.style.left = `${x}px`;
            cursorGlow.style.top = `${y}px`;
        });
    });
    
    document.querySelectorAll('a, button, input, .data-item').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorGlow.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorGlow.style.opacity = '0.7';
        });
    });
    
    // Theme Toggle (Sun/Moon)
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
    
    // Load Theme Preference and Profile Data on Page Load
    window.addEventListener('load', () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        fetchProfileData();
    });
    
    // Fetch Profile Data
    function fetchProfileData() {
        fetch('backend/profile.php', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            const usernameSpan = document.getElementById('username');
            const emailSpan = document.getElementById('email');
            const logoutBtn = document.getElementById('logout-btn');
            const profileImg = document.getElementById('profileImg');
    
            if (data.success) {
                usernameSpan.textContent = data.username;
                emailSpan.textContent = data.email;
                logoutBtn.style.display = 'inline';
                if (data.photo) profileImg.src = data.photo;
                updatePerformanceData(data.performance);
            } else {
                usernameSpan.textContent = 'Not logged in';
                emailSpan.textContent = 'Not logged in';
                logoutBtn.style.display = 'none';
                document.querySelector('.profile-info button').style.display = 'none';
                document.querySelector('.performance-data').style.display = 'none';
                profileImg.src = 'default-profile.png';
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    // Update Performance Data
    function updatePerformanceData(performance) {
        document.getElementById('todoCompleted').textContent = performance.todo.completed;
        document.getElementById('todoTotal').textContent = performance.todo.total;
        document.getElementById('taskCompleted').textContent = performance.tasks.completed;
        document.getElementById('taskTotal').textContent = performance.tasks.total;
        document.getElementById('goalCompleted').textContent = performance.goals.completed;
        document.getElementById('goalTotal').textContent = performance.goals.total;
        document.getElementById('contactTotal').textContent = performance.contacts.total;
        document.getElementById('focusTime').textContent = formatTime(performance.timeTracker.focusTime);
    }
    
    // Format Time (e.g., 3600s -> 1h 0m)
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    // Change Photo
    document.getElementById('changePhotoBtn').addEventListener('click', () => {
        document.getElementById('photoUpload').click();
    });
    
    document.getElementById('photoUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('photo', file);
    
            fetch('backend/profile.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('profileImg').src = data.photo;
                    alert('Photo updated successfully');
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });
    
    // Change Password Modal
    const passwordModal = document.getElementById('passwordModal');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    
    changePasswordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'flex';
        setTimeout(() => passwordModal.classList.add('show'), 10);
    });
    
    cancelPasswordBtn.addEventListener('click', () => {
        passwordModal.classList.remove('show');
        setTimeout(() => passwordModal.style.display = 'none', 300);
        document.getElementById('passwordForm').reset();
    });
    
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
    
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }
    
        fetch('backend/profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Password updated successfully');
                passwordModal.classList.remove('show');
                setTimeout(() => passwordModal.style.display = 'none', 300);
                document.getElementById('passwordForm').reset();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    // Logout Functionality
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        fetch('backend/logout.php', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    // -------------//------------------------------------------------------------------------------------------------------------------------------------
    
    document.addEventListener('DOMContentLoaded', function() {
        // Load profile data
        function loadProfileData() {
            fetch('backend/profile/profile.php', {
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('username').textContent = data.username;
                    document.getElementById('email').textContent = data.email;
                    
                    // Set profile photo
                    const profileImg = document.getElementById('profileImg');
                    if (data.photo) {
                        profileImg.src = 'backend/uploads/profile_photos/' + data.photo;
                    }
                    
                    // Set performance data
                    document.getElementById('todoCompleted').textContent = data.performance.todo.completed;
                    document.getElementById('todoTotal').textContent = data.performance.todo.total;
                    document.getElementById('taskCompleted').textContent = data.performance.tasks.completed;
                    document.getElementById('taskTotal').textContent = data.performance.tasks.total;
                    document.getElementById('goalCompleted').textContent = data.performance.goals.completed;
                    document.getElementById('goalTotal').textContent = data.performance.goals.total;
                    document.getElementById('contactTotal').textContent = data.performance.contacts.total;
                    
                    // Format time
                    const focusTime = data.performance.timeTracker.focusTime || 0;
                    const hours = Math.floor(focusTime / 3600);
                    const minutes = Math.floor((focusTime % 3600) / 60);
                    document.getElementById('focusTime').textContent = `${hours}h ${minutes}m`;
                } else {
                    window.location.href = 'login.html';
                }
            });
        }
        
        // Change photo
        document.getElementById('changePhotoBtn').addEventListener('click', function() {
            document.getElementById('photoUpload').click();
        });
        
        document.getElementById('photoUpload').addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const formData = new FormData();
                formData.append('photo', e.target.files[0]);
                
                fetch('backend/profile/update_photo.php', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('profileImg').src = 'backend/uploads/profile_photos/' + data.photo;
                        alert('Profile photo updated successfully!');
                    } else {
                        alert(data.message || 'Failed to update photo');
                    }
                });
            }
        });
        
        // Password change modal
        const passwordModal = document.getElementById('passwordModal');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
        
        changePasswordBtn.addEventListener('click', function() {
            passwordModal.style.display = 'flex';
        });
        
        cancelPasswordBtn.addEventListener('click', function() {
            passwordModal.style.display = 'none';
            document.getElementById('passwordForm').reset();
        });
        
        // Password form submission
        document.getElementById('passwordForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            fetch('backend/profile/profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Password changed successfully!');
                    passwordModal.style.display = 'none';
                    document.getElementById('passwordForm').reset();
                } else {
                    alert(data.message || 'Failed to change password');
                }
            });
        });
        
        // Initial load
        loadProfileData();
    });
    
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', async function(e) {
        e.preventDefault();
        const logoutBtn = this;
    
        try {
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            logoutBtn.disabled = true;
    
            const response = await fetch('backend/auth/logout.php', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
    
            if (!response.ok) {
                const text = await response.text(); // Only read text if error occurs
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${text.substring(0, 100)}`);
            }
    
            const data = await response.json();
            if (data.success) {
                window.location.href = 'login.html';
            } else {
                throw new Error(data.message || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert(`Logout failed: ${error.message}`);
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutBtn.disabled = false;
        }
    });