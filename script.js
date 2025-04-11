// Firebase configuration - Replace with your actual config

const firebaseConfig = {
    apiKey: "AIzaSyDzdSl3VtiR6nzpj4kyto5mwbd9QgqbewY",
    authDomain: "aaradhya-c451d.firebaseapp.com",
    projectId: "aaradhya-c451d",
    storageBucket: "aaradhya-c451d.firebasestorage.app",
    messagingSenderId: "67052174189",
    appId: "1:67052174189:web:fa9da3518c721d8717f864",
    measurementId: "G-L3H0XL0PSN"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Cloudinary configuration
const cloudName = 'dzj2wcui1';
const uploadPreset = 'my_website_uploads'; 

// DOM elements
const loginModal = document.getElementById('login-modal');
const adminPanel = document.getElementById('admin-panel');
const publicGallery = document.getElementById('public-gallery');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = uploadProgress.querySelector('.progress');
const uploadResult = document.getElementById('upload-result');
const imageGallery = document.getElementById('image-gallery');
const adminGallery = document.getElementById('admin-gallery');
const fullscreenModal = document.getElementById('image-modal');
const fullscreenImage = document.getElementById('fullscreen-image');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const downloadBtn = document.getElementById('download-btn');
const imageIndexDisplay = document.getElementById('image-index');
const resetPasswordLink = document.getElementById('reset-password');

// Image storage and fullscreen navigation
let galleryImages = JSON.parse(localStorage.getItem('gallery_images')) || [];
let currentImageIndex = 0;

// Initialize the app
function initApp() {
    renderPublicGallery();
    
    // Add CSS animations to style tag
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(20px); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        @keyframes highlight {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
            50% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0.3); }
        }
        @keyframes fadeOutUp {
            to { opacity: 0; transform: translateY(-20px); }
        }
        .success-message, .error-message {
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.5s ease;
        }
        .success-message {
            background: rgba(0, 184, 148, 0.1);
            color: var(--success);
        }
        .error-message {
            background: rgba(214, 48, 49, 0.1);
            color: var(--danger);
        }
        .logout-notification {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--dark);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeInUp 0.5s ease;
            z-index: 1000;
        }
    `;
    document.head.appendChild(styleTag);
}

// Render public gallery with animations
function renderPublicGallery() {
    imageGallery.innerHTML = '';
    galleryImages.forEach((image, index) => {
        addImageToGallery(image, imageGallery, false, index);
    });
}

// Render admin gallery
function renderAdminGallery() {
    adminGallery.innerHTML = '';
    galleryImages.forEach((image, index) => {
        addImageToGallery(image, adminGallery, true, index);
    });
}

// Add image to gallery with animation
function addImageToGallery(imageUrl, container, isAdmin = false, index = null) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Gallery image';
    img.onclick = () => {
        currentImageIndex = index;
        openFullscreenImage(imageUrl);
    };
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    if (isAdmin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteImage(index);
        };
        actions.appendChild(deleteBtn);
    }
    
    item.appendChild(img);
    item.appendChild(actions);
    container.appendChild(item);
}

// Delete image with animation
function deleteImage(index) {
    const items = document.querySelectorAll('.gallery-item');
    if (items[index]) {
        items[index].style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => {
            galleryImages.splice(index, 1);
            saveImages();
            renderAdminGallery();
            renderPublicGallery();
        }, 400);
    }
}

// Save images to localStorage
function saveImages() {
    localStorage.setItem('gallery_images', JSON.stringify(galleryImages));
}

// Upload image to Cloudinary
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                progressBar.style.width = `${percentCompleted}%`;
            }
        }
    );
    
    return response.data.secure_url;
}

// Show admin panel
function showAdminPanel() {
    publicGallery.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    document.body.style.background = '#f9f9ff';
}

// Hide admin panel
function hideAdminPanel() {
    publicGallery.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    document.body.style.background = '';
}

// Fullscreen Image Viewer Functions
function openFullscreenImage(imageUrl) {
    fullscreenImage.src = imageUrl;
    updateImageIndexDisplay();
    fullscreenModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeFullscreenImage() {
    fullscreenModal.style.display = 'none';
    document.body.style.overflow = '';
}

function navigateImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    fullscreenImage.style.animation = 'fadeOut 0.3s ease forwards';
    
    setTimeout(() => {
        fullscreenImage.src = galleryImages[currentImageIndex];
        fullscreenImage.style.animation = 'fadeIn 0.3s ease forwards';
        updateImageIndexDisplay();
    }, 300);
}

function updateImageIndexDisplay() {
    imageIndexDisplay.textContent = `${currentImageIndex + 1}/${galleryImages.length}`;
}

function downloadCurrentImage() {
    const link = document.createElement('a');
    link.href = fullscreenImage.src;
    link.download = `image-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showAdminPanel();
        renderAdminGallery();
        
        // Show welcome notification
        uploadResult.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                Welcome back, ${user.email}!
            </div>
        `;
        setTimeout(() => uploadResult.innerHTML = '', 3000);
    } else {
        // User is signed out
        hideAdminPanel();
    }
});

// Event Listeners
adminLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    loginModal.style.display = 'none';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // Login successful - handled by onAuthStateChanged
        loginModal.style.display = 'none';
    } catch (error) {
        console.error('Login error:', error);
        
        // Shake animation for wrong credentials
        loginForm.style.animation = 'shake 0.5s';
        setTimeout(() => loginForm.style.animation = '', 500);
        
        let errorMessage;
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabled';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Account not found';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            default:
                errorMessage = 'Login failed. Please try again.';
        }
        
        uploadResult.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${errorMessage}
            </div>
        `;
    }
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        // Show logout notification
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logged out successfully';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOutUp 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }).catch((error) => {
        console.error('Logout error:', error);
    });
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
        // Show error animation
        const label = document.querySelector('.file-label');
        label.style.animation = 'shake 0.5s, highlight 1.5s';
        setTimeout(() => label.style.animation = '', 500);
        return;
    }
    
    try {
        uploadProgress.style.display = 'block';
        progressBar.style.width = '0%';
        
        const imageUrl = await uploadToCloudinary(file);
        galleryImages.unshift(imageUrl);
        saveImages();
        
        uploadResult.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                Image uploaded successfully!
            </div>
        `;
        
        renderPublicGallery();
        renderAdminGallery();
        fileInput.value = '';
    } catch (error) {
        console.error('Upload error:', error);
        uploadResult.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Upload failed: ${error.message}
            </div>
        `;
    } finally {
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 2000);
    }
});

// Password reset handler
resetPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value;
    
    if (!email) {
        alert('Please enter your email address first');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            uploadResult.innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    Password reset email sent!
                </div>
            `;
        })
        .catch((error) => {
            console.error('Reset error:', error);
            uploadResult.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    Error sending reset email: ${error.message}
                </div>
            `;
        });
});

// Fullscreen navigation
prevBtn.addEventListener('click', () => navigateImage(-1));
nextBtn.addEventListener('click', () => navigateImage(1));
downloadBtn.addEventListener('click', downloadCurrentImage);

document.querySelector('.close-fullscreen').addEventListener('click', closeFullscreenImage);

// Keyboard navigation for fullscreen viewer
document.addEventListener('keydown', (e) => {
    if (fullscreenModal.style.display === 'block') {
        if (e.key === 'Escape') closeFullscreenImage();
        if (e.key === 'ArrowLeft') navigateImage(-1);
        if (e.key === 'ArrowRight') navigateImage(1);
    }
    
    if (e.key === 'Escape' && loginModal.style.display === 'block') {
        loginModal.style.display = 'none';
    }
});

// Drag and drop upload
const uploadBox = document.querySelector('.upload-box');

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--primary)';
    uploadBox.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = 'var(--secondary)';
    uploadBox.style.backgroundColor = '';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--secondary)';
    uploadBox.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        
        // Visual feedback
        const label = document.querySelector('.file-label');
        label.innerHTML = `<span class="browse-btn">${e.dataTransfer.files[0].name}</span>`;
        label.style.color = 'var(--success)';
        setTimeout(() => label.style.color = '', 2000);
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === fullscreenModal) closeFullscreenImage();
});