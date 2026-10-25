Functional Specification

# SauceDemo Application - Feature Requirements

**Application URL**: https:/www.saucedemo.com/
**Type**: E-commerce demo application for testing automation

## Core features to  test 

### 1. User Authentication 
- Login with different user types (standard_user, locked_out_user, problem_user, etc.)
- Logout functionality 
- Invalid login attempts

### 2. Product catalog
- View all products on inventory page
- Product sorting (name A-Z, Z-A, price low-high, high-low)
- Individual product details pages
- Product information display (name, price, description, image)

### 3. Shopping Cart
- Add products to cart from inventory page
- Add product to cart from product details page
- Remove items from cart
- View cart contents and totals
- Continue shopping from cart

### 4. Checkout Process
- Enter customer information(first name, last name, postal code)
- Review order summary with tax calculation
- Complete order and get confirmation
- Navigate back to products after checkout

### 5. Navigation & UI
- Main menu navigation
- Cart badge counter updates
- Responsive layout across different screen sizes
- Error handling for invalid actions

## Business Rules
- All form fields in checkout are required
- Tax is automatically calculated at 8%
- Cart persists during sessions
- Only authenticated users can access inventory and cart
- Each product can only have quantity of 1 in cart