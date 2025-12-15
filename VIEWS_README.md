# EJS Views Structure

This document describes the views folder structure and how to use the EJS templates.

## Folder Structure

```
views/
├── layouts/
│   ├── main.ejs          # Main layout template
│   └── mainWithContent.ejs # Alternative layout for complex views
├── partials/
│   ├── header.ejs        # Navigation header
│   └── footer.ejs        # Footer
├── auth/
│   ├── login.ejs
│   ├── signup.ejs
│   ├── forgotPassword.ejs
│   ├── verifyResetCode.ejs
│   └── resetPassword.ejs
├── users/
│   ├── list.ejs
│   ├── profile.ejs
│   ├── create.ejs
│   └── edit.ejs
├── products/
│   ├── list.ejs
│   ├── detail.ejs
│   ├── create.ejs
│   └── edit.ejs
├── categories/
│   ├── list.ejs
│   ├── create.ejs
│   └── edit.ejs
├── brands/
│   ├── list.ejs
│   ├── create.ejs
│   └── edit.ejs
├── index.ejs             # Home page
└── error.ejs            # Error page
```

## Usage

### View Routes

View routes are defined in `routes/viewRoutes.js`. These routes render EJS templates instead of returning JSON.

### Layout System

The main layout (`layouts/main.ejs`) includes:
- Header navigation
- Main content area
- Footer
- Bootstrap 5 CSS/JS
- Font Awesome icons
- Custom CSS/JS

### View Pattern

Most views use this pattern:
```ejs
<% var content = `
<!-- HTML content here -->
`; %>
<%- include('../layouts/main', { title: 'Page Title', content: content }) %>
```

### Views with EJS Code

For views that need to use EJS code (like loops, conditionals), you have two options:

1. **Use the alternative layout** (`mainWithContent.ejs`) and build HTML as a string
2. **Include layout parts directly** in your view file

Example for complex views:
```ejs
<%- include('../layouts/mainWithContent', { 
    title: 'Page Title',
    content: (function() {
        let html = '';
        // Build HTML string with JavaScript
        if (data) {
            html += '<div>' + data.name + '</div>';
        }
        return html;
    })()
}) %>
```

## Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail
- `/categories` - Category listing
- `/brands` - Brand listing
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/forgotPassword` - Forgot password
- `/auth/verifyResetCode` - Verify reset code
- `/auth/resetPassword` - Reset password

### Protected Routes (require authentication)
- `/users/me` - User profile
- `/users` - User list (admin only)
- `/users/create` - Create user (admin only)
- `/users/:id/edit` - Edit user (admin only)
- `/products/create` - Create product (admin only)
- `/products/:id/edit` - Edit product (admin only)
- `/categories/create` - Create category (admin only)
- `/categories/:id/edit` - Edit category (admin only)
- `/brands/create` - Create brand (admin only)
- `/brands/:id/edit` - Edit brand (admin only)

## Static Assets

Static assets are served from the `public/` folder:
- CSS: `/css/style.css`
- JavaScript: `/js/main.js`
- Images: Served from `uploads/` folder

## Notes

- Views receive `user` object if user is logged in
- Views can access all data passed from controllers
- Bootstrap 5 and Font Awesome are included via CDN
- Forms submit to API endpoints and use JavaScript for handling responses
- Authentication tokens are stored in localStorage

## Next Steps

1. Test all view routes
2. Customize styling in `public/css/style.css`
3. Add more interactive features in `public/js/main.js`
4. Update views as needed for your specific requirements





