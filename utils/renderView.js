// Utility function to render views with layout
const renderWithLayout = (res, viewPath, data = {}) => {
  // Set default title if not provided
  if (!data.title) {
    data.title = 'Ecommerce';
  }
  res.render(viewPath, data);
};

module.exports = renderWithLayout;





