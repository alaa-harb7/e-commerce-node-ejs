// Main JavaScript file

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    // Add logout behavior for all .logout-link
    document.querySelectorAll('.logout-link').forEach(function(el) {
        el.addEventListener('click', function(e) {
            // Optionally prevent default if using frontend logout only:
            // e.preventDefault();
            localStorage.removeItem('token');
            // Remove other login info if you store it
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 50);
        });
    });
});

// Confirm delete actions
function confirmDelete(message) {
    return confirm(message || 'Are you sure you want to delete this item?');
}

// Image preview
function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

