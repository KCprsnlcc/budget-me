// BudgetMe Authentication JavaScript
// Handles testimonials rotation and form interactions

// Testimonials data organized by page type
const testimonialsData = {
    login: [
        {
            name: "Marcus Alexander Roldan",
            username: "@marcus.alexander",
            image: "../../profile/marcus.alexander.jpg",
            content: "BudgetMe helped me save enough for a down payment on my house in just 18 months. The goal tracking feature is fantastic!"
        },
        {
            name: "Edward Baulita",
            username: "@edward.bau",
            image: "../../profile/edward.bau.jpg",
            content: "As a freelancer with irregular income, BudgetMe has been a game-changer. The visualization tools help me see months ahead."
        },
        {
            name: "Kenneth Buela",
            username: "@kenneth.b",
            image: "../../profile/kenneth.b.jpg",
            content: "The AI-powered insights have completely changed how I think about my spending habits. It predicted patterns I hadn't noticed."
        }
    ],
    register: [
        {
            name: "Adonis Vincent Villanueva",
            username: "@adonis.vincent",
            image: "../../profile/adonis.vincent.jpg",
            content: "The interface is so clean and premium. It doesn't feel like a chore to manage my finances anymore. Truly a modern web experience."
        },
        {
            name: "Jamil Amilhamja",
            username: "@jamil.amil",
            image: "../../profile/jamil.amil.jpg",
            content: "I love the joint account feature. Managing household expenses with my partner has never been this transparent and stress-free."
        },
        {
            name: "Sire Enopia",
            username: "@sire.enopia",
            image: "../../profile/sire.enopia.jpg",
            content: "The AI reminders for upcoming bills have saved me from late fees multiple times. It's like having a personal assistant in my pocket."
        }
    ],
    forgot: [
        {
            name: "Abduradzmi Amdal",
            username: "@abdu.amdal",
            image: "../../profile/abdu.amdal.jpg",
            content: "The expense categorization is spot on. I finally know where my money goes every month. It's so much easier than my old spreadsheet!"
        },
        {
            name: "Saeed Nasre Shaidali",
            username: "@saeed.nasre",
            image: "../../profile/saeed.nasre.jpg",
            content: "BudgetMe's debt payoff tracker is incredible. Seeing the progress bars move actually keeps me motivated to stay out of debt."
        },
        {
            name: "Khadz Akil",
            username: "@khadz.akil",
            image: "../../profile/khadz.akil.jpg",
            content: "Highly recommended for students! The templates helped me manage my allowance and even save for a new laptop effortlessly."
        }
    ]
};

// Get random testimonial for page type
function getRandomTestimonial(pageType) {
    const testimonials = testimonialsData[pageType] || testimonialsData.login;
    const randomIndex = Math.floor(Math.random() * testimonials.length);
    return testimonials[randomIndex];
}

// Update testimonial content
function updateTestimonial(pageType) {
    const testimonial = getRandomTestimonial(pageType);

    // Update avatar
    const avatarElement = document.getElementById('testimonial-avatar');
    if (avatarElement) {
        // Clear existing content
        avatarElement.textContent = '';

        // Remove background colors and add white background
        avatarElement.className = 'h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm flex items-center justify-center bg-white';

        // Create or update img element
        let img = avatarElement.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.className = 'h-full w-full object-cover';
            avatarElement.appendChild(img);
        }
        img.src = testimonial.image;
        img.alt = testimonial.name;
    }

    // Update name
    const nameElement = document.getElementById('testimonial-name');
    if (nameElement) {
        nameElement.textContent = testimonial.name;
    }

    // Update username
    const usernameElement = document.getElementById('testimonial-username');
    if (usernameElement) {
        usernameElement.textContent = testimonial.username;
    }

    // Update content
    const contentElement = document.getElementById('testimonial-content');
    if (contentElement) {
        contentElement.textContent = testimonial.content;
    }
}

// Password visibility toggle
function togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }

    // Re-create lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Auto-scroll to field function
function scrollToField(field) {
    if (!field) return;
    
    // Find the scrollable container
    const scrollContainer = field.closest('.overflow-y-auto');
    if (!scrollContainer) return;
    
    // Calculate scroll position with offset for better visibility
    const fieldRect = field.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    
    // Calculate target position (field position relative to container + current scroll - offset)
    const offset = 80; // 80px offset to show field with some space above
    const targetScrollTop = scrollTop + fieldRect.top - containerRect.top - offset;
    
    // Smooth scroll to the field
    scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
    });
}

// Focus field with auto-scroll
function focusField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.focus();
        scrollToField(field);
    }
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field) {
        field.classList.add('border-red-500', 'bg-red-50');
        field.classList.remove('border-slate-200', 'bg-slate-50', 'bg-slate-50/50');
        
        // Auto-scroll to the field with error
        scrollToField(field);
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field) {
        field.classList.remove('border-red-500', 'bg-red-50');
        field.classList.add('border-slate-200', 'bg-slate-50/50');
    }

    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// Initialize auth page
function initAuthPage(pageType) {
    // Update testimonial
    updateTestimonial(pageType);

    // Initialize lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Add form event listeners
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Add input validation listeners with auto-scroll
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => validateEmailField(input.id));
        input.addEventListener('focus', () => {
            clearError(input.id);
            scrollToField(input); // Scroll to field on focus
        });
    });

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', () => validatePasswordField(input.id));
        input.addEventListener('focus', () => {
            clearError(input.id);
            scrollToField(input); // Scroll to field on focus
        });
    });

    // Add focus listeners to all text inputs
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('focus', () => {
            scrollToField(input); // Scroll to field on focus
        });
    });

    // Add focus listener to checkbox
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('focus', () => {
            scrollToField(termsCheckbox);
        });
    }
}

function validateEmailField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field && field.value && !validateEmail(field.value)) {
        showError(fieldId, 'Please enter a valid email address');
        return false;
    }
    return true;
}

function validatePasswordField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field && field.value && !validatePassword(field.value)) {
        showError(fieldId, 'Password must be at least 8 characters long');
        return false;
    }
    return true;
}

// Enhanced form validation with auto-scroll to first error
function validateAndScrollToFirstError(form) {
    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="password"]');
    let firstInvalidField = null;
    
    // Check each field for validation
    inputs.forEach(input => {
        const fieldId = input.id;
        clearError(fieldId); // Clear previous errors first
        
        // Validate based on input type and requirements
        if (input.hasAttribute('required') && !input.value.trim()) {
            firstInvalidField = input;
            if (input.type === 'email') {
                showError(fieldId, 'Email is required');
            } else if (input.type === 'password') {
                showError(fieldId, 'Password is required');
            } else {
                showError(fieldId, 'This field is required');
            }
        } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
            firstInvalidField = firstInvalidField || input;
            showError(fieldId, 'Please enter a valid email address');
        } else if (input.type === 'password' && input.value && !validatePassword(input.value)) {
            firstInvalidField = firstInvalidField || input;
            showError(fieldId, 'Password must be at least 8 characters long');
        }
    });
    
    // Scroll to first invalid field
    if (firstInvalidField) {
        focusField(firstInvalidField.id);
        return false;
    }
    
    return true;
}

function handleFormSubmit(event) {
    event.preventDefault();

    // Clear all errors
    document.querySelectorAll('[id$="-error"]').forEach(error => {
        error.classList.add('hidden');
    });

    // Validate form
    let isValid = true;
    const form = event.target;

    // Validate email
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        if (!emailInput.value) {
            showError(emailInput.id, 'Email is required');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput.id, 'Please enter a valid email address');
            isValid = false;
        }
    }

    // Validate password
    const passwordInput = form.querySelector('input[type="password"]');
    if (passwordInput) {
        if (!passwordInput.value) {
            showError(passwordInput.id, 'Password is required');
            isValid = false;
        } else if (!validatePassword(passwordInput.value)) {
            showError(passwordInput.id, 'Password must be at least 8 characters long');
            isValid = false;
        }
    }

    if (isValid) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="text-white">Processing...</span>';
        }

        // Simulate API call
        setTimeout(() => {
            // Reset button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.textContent.replace('Processing...', '').trim();
            }

            // Redirect to dashboard
            window.location.href = '../../dashboard.html#dashboard';
        }, 2000);
    }
}

// Export functions for global access
window.authUtils = {
    togglePassword,
    validateEmail,
    validatePassword,
    getRandomTestimonial,
    updateTestimonial,
    focusField,
    scrollToField
};
