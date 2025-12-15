/**
 * Admin Actions Helper Script
 * Handles authenticated requests (forms and actions) using the JWT from localStorage.
 */

// Handle Form Submission (Create/Update)
async function submitAdminForm(event, formId, apiPath, redirectUrl, method = 'POST') {
    event.preventDefault();
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const token = localStorage.getItem('token');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    if (!token) {
        alert('You are not logged in! Please login to perform this action.');
        window.location.href = '/auth/login';
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const response = await fetch(apiPath, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Content-Type is set automatically for FormData
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Success
             if (typeof Swal !== 'undefined') {
                 Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Action completed successfully.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = redirectUrl;
                });
             } else {
                 alert('Success!');
                 window.location.href = redirectUrl;
             }
        } else {
            // Error
            const message = data.message || data.errors?.[0]?.msg || 'Something went wrong';
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
            } else {
                 alert(message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Handle Delete Action
async function deleteAdminItem(event, apiPath, redirectUrl = window.location.href) {
    event.preventDefault(); // Prevent link navigation
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in! Please login to perform this action.');
        window.location.href = '/auth/login';
        return;
    }

    const confirmAction = typeof Swal !== 'undefined' 
        ? await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => result.isConfirmed)
        : confirm('Are you sure you want to delete this item?');

    if (!confirmAction) return;

    try {
        const response = await fetch(apiPath, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204 || response.ok) {
            if (typeof Swal !== 'undefined') {
                await Swal.fire(
                    'Deleted!',
                    'Item has been deleted.',
                    'success'
                );
            } else {
                alert('Item deleted successfully');
            }
            window.location.href = redirectUrl;
        } else {
             const data = await response.json();
             const message = data.message || 'Failed to delete item';
             if (typeof Swal !== 'undefined') {
                Swal.fire('Error', message, 'error');
             } else {
                 alert(message);
             }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}
