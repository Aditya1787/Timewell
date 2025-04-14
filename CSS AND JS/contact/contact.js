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

    document.querySelectorAll('a, button, .contact-item').forEach(element => {
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

    // Contact List Functionality
    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.getElementById('contactForm');
        const contactList = document.getElementById('contactList');

        if (!contactForm) {
            console.error('Contact form not found!');
            return;
        }

        // Handle form submission (Add or Update)
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const phone = document.getElementById('contactPhone').value;
            const notes = document.getElementById('contactNotes').value;
            const mode = contactForm.dataset.mode || 'add';
            const contactId = contactForm.dataset.id;

            console.log('Form data:', { name, email, phone, notes, mode, contactId });

            if (!name.trim()) {
                alert('Please enter a name.');
                return;
            }

            const contactData = { name, email, phone, notes };
            const method = mode === 'update' ? 'PUT' : 'POST';
            const url = 'backend/contacts/contacts.php';

            console.log('Sending fetch request:', { method, url, data: contactData });

            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mode === 'update' ? { ...contactData, id: contactId } : contactData),
                credentials: 'include'
            })
            .then(response => {
                console.log('Fetch response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Fetch response data:', data);
                if (data.success) {
                    loadContacts(); // Refresh the list
                    contactForm.reset();
                    delete contactForm.dataset.mode;
                    delete contactForm.dataset.id;
                    document.querySelector('.contact-form h2').textContent = 'Add a New Contact';
                    document.querySelector('.cta').textContent = 'Add Contact';
                    alert('Contact saved successfully!');
                } else {
                    alert(data.message || 'Operation failed');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                alert('An error occurred. Check the console for details.');
            });
        });

        // Load existing contacts
        function loadContacts() {
            fetch('backend/contacts/contacts.php', {
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    contactList.innerHTML = '';
                    data.contacts.forEach(contact => {
                        const contactItem = document.createElement('div');
                        contactItem.classList.add('contact-item');
                        contactItem.dataset.id = contact.id;
                        contactItem.innerHTML = `
                            <div class="contact-details">
                                <p><strong>Name:</strong> ${contact.name}</p>
                                ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
                                ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
                                ${contact.notes ? `<p><strong>Notes:</strong> ${contact.notes}</p>` : ''}
                            </div>
                            <div>
                                <button class="edit-btn">Edit</button>
                                <button class="delete-btn">Delete</button>
                            </div>
                        `;
                        contactList.appendChild(contactItem);

                        // Animate in
                        setTimeout(() => contactItem.classList.add('visible'), 10);

                        // Delete contact
                        contactItem.querySelector('.delete-btn').addEventListener('click', () => {
                            if (confirm('Are you sure you want to delete this contact?')) {
                                deleteContact(contact.id);
                            }
                        });

                        // Edit contact
                        contactItem.querySelector('.edit-btn').addEventListener('click', () => {
                            document.getElementById('contactName').value = contact.name || '';
                            document.getElementById('contactEmail').value = contact.email || '';
                            document.getElementById('contactPhone').value = contact.phone || '';
                            document.getElementById('contactNotes').value = contact.notes || '';
                            contactForm.dataset.mode = 'update';
                            contactForm.dataset.id = contact.id;
                            document.querySelector('.contact-form h2').textContent = 'Update Contact';
                            document.querySelector('.cta').textContent = 'Update';
                        });
                    });
                } else {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => console.error('Error loading contacts:', error));
        }

        function deleteContact(contactId) {
            fetch('backend/contacts/contacts.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: contactId }),
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadContacts(); // Refresh the list
                } else {
                    alert(data.message || 'Delete failed');
                }
            })
            .catch(error => console.error('Error deleting contact:', error));
        }

        // Initial load
        loadContacts();
    });

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
        const elements = document.querySelectorAll('.hero, .contact-form, .contact-item, .footer-links, .social-links');
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