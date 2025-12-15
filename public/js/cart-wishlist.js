async function addToCart(productId, color) {
    try {
        const body = { productId };
        if (color) {
            body.color = color;
        }

        const response = await fetch('/api/v1/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if(response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Product added to cart!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Optional: Update cart count in header dynamically instead of reload
                location.reload(); 
            });
        } else {
            Swal.fire('Error', data.message || 'Error adding to cart', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Something went wrong', 'error');
    }
}

async function toggleWishlist(productId) {
    try {
        const response = await fetch('/api/v1/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        const data = await response.json();
         if(response.ok) {
            Swal.fire({
                title: 'Success',
                text: data.message,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
             Swal.fire('Error', data.message, 'error');
        }
    } catch (err) {
          console.error(err);
    }
}
