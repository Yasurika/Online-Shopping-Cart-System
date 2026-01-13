package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.model.Cart;
import com.example.Shopping.Cart.model.CartItem;
import com.example.Shopping.Cart.model.Product;
import com.example.Shopping.Cart.model.User;
import com.example.Shopping.Cart.repository.CartRepository;
import com.example.Shopping.Cart.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    /**
     * Get or create cart for user
     */
    public Cart getCartByUserId(Long userId) {
        try {
            System.out.println("Finding cart for user ID: " + userId);

            Optional<Cart> existingCart = cartRepository.findByUserId(userId);

            if (existingCart.isPresent()) {
                Cart cart = existingCart.get();
                System.out.println("Found existing cart with ID: " + cart.getId());
                System.out.println("Cart has " + cart.getItems().size() + " items");
                return cart;
            } else {
                System.out.println("No cart found, creating new cart");
                return createCartForUser(userId);
            }

        } catch (Exception e) {
            System.err.println("Error in getCartByUserId: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get cart: " + e.getMessage());
        }
    }

    /**
     * Create new cart for user
     */
    private Cart createCartForUser(Long userId) {
        try {
            System.out.println("Creating new cart for user ID: " + userId);

            User user = userService.getUserById(userId);
            System.out.println("User found: " + user.getUsername());

            Cart cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());

            Cart savedCart = cartRepository.save(cart);
            System.out.println("New cart created with ID: " + savedCart.getId());

            return savedCart;

        } catch (Exception e) {
            System.err.println("Error in createCartForUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create cart: " + e.getMessage());
        }
    }

    /**
     * Add item to cart
     */
    @Transactional
    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        try {
            System.out.println("=== START ADD TO CART ===");
            System.out.println("User ID: " + userId);
            System.out.println("Product ID: " + productId);
            System.out.println("Quantity: " + quantity);

            // Get or create cart
            Cart cart = getCartByUserId(userId);
            System.out.println("Cart ID: " + cart.getId());

            // Get product
            Product product = productService.getProductById(productId);
            System.out.println("Product found: " + product.getName());
            System.out.println("Product price: $" + product.getPrice());
            System.out.println("Stock available: " + product.getStockQuantity());

            // Check stock
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock. Only " + product.getStockQuantity() + " items available");
            }

            // Check if item already exists in cart
            Optional<CartItem> existingItem = cartItemRepository
                    .findByCartIdAndProductId(cart.getId(), productId);

            if (existingItem.isPresent()) {
                System.out.println("Item already in cart, updating quantity");
                CartItem item = existingItem.get();
                int newQuantity = item.getQuantity() + quantity;

                // Check stock for new quantity
                if (product.getStockQuantity() < newQuantity) {
                    throw new RuntimeException("Cannot add " + quantity + " more. Only " +
                            (product.getStockQuantity() - item.getQuantity()) + " more items available");
                }

                item.setQuantity(newQuantity);
                cartItemRepository.save(item);
                System.out.println("Updated quantity to: " + newQuantity);

            } else {
                System.out.println("Adding new item to cart");
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                newItem.setPrice(product.getPrice());

                CartItem savedItem = cartItemRepository.save(newItem);
                System.out.println("New cart item created with ID: " + savedItem.getId());
            }

            // Refresh cart from database
            Cart updatedCart = cartRepository.findById(cart.getId())
                    .orElseThrow(() -> new RuntimeException("Cart not found after update"));

            System.out.println("Cart now has " + updatedCart.getItems().size() + " items");
            System.out.println("=== END ADD TO CART ===");

            return updatedCart;

        } catch (RuntimeException e) {
            System.err.println("Business logic error in addToCart: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in addToCart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage());
        }
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public Cart updateCartItem(Long userId, Long productId, Integer quantity) {
        try {
            System.out.println("=== START UPDATE CART ITEM ===");
            System.out.println("User ID: " + userId);
            System.out.println("Product ID: " + productId);
            System.out.println("New Quantity: " + quantity);

            Cart cart = getCartByUserId(userId);

            CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                    .orElseThrow(() -> new RuntimeException("Item not found in cart"));

            System.out.println("Found cart item ID: " + item.getId());

            if (quantity <= 0) {
                System.out.println("Quantity is 0 or less, removing item");
                cartItemRepository.delete(item);
            } else {
                // Check stock
                Product product = item.getProduct();
                if (product.getStockQuantity() < quantity) {
                    throw new RuntimeException("Insufficient stock. Only " + product.getStockQuantity() + " items available");
                }

                System.out.println("Updating quantity from " + item.getQuantity() + " to " + quantity);
                item.setQuantity(quantity);
                cartItemRepository.save(item);
            }

            // Refresh cart
            Cart updatedCart = cartRepository.findById(cart.getId())
                    .orElseThrow(() -> new RuntimeException("Cart not found after update"));

            System.out.println("=== END UPDATE CART ITEM ===");

            return updatedCart;

        } catch (RuntimeException e) {
            System.err.println("Business logic error in updateCartItem: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in updateCartItem: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update cart item: " + e.getMessage());
        }
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public Cart removeFromCart(Long userId, Long itemId) {
        try {
            System.out.println("=== START REMOVE FROM CART ===");
            System.out.println("User ID: " + userId);
            System.out.println("Item ID: " + itemId);

            // Verify cart belongs to user
            Cart cart = getCartByUserId(userId);
            System.out.println("Cart ID: " + cart.getId());

            // Check if item exists and belongs to this cart
            CartItem item = cartItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Cart item not found"));

            if (!item.getCart().getId().equals(cart.getId())) {
                throw new RuntimeException("Item does not belong to this cart");
            }

            System.out.println("Deleting cart item");
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            cartRepository.save(cart);

            // Refresh cart from database
            Cart updatedCart = cartRepository.findById(cart.getId())
                    .orElseThrow(() -> new RuntimeException("Cart not found after removal"));

            System.out.println("Cart now has " + updatedCart.getItems().size() + " items");
            System.out.println("Item removed successfully");
            System.out.println("=== END REMOVE FROM CART ===");

            return updatedCart;

        } catch (RuntimeException e) {
            System.err.println("Business logic error in removeFromCart: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in removeFromCart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to remove item: " + e.getMessage());
        }
    }

    /**
     * Clear all items from cart
     */
    @Transactional
    public void clearCart(Long userId) {
        try {
            System.out.println("=== START CLEAR CART ===");
            System.out.println("User ID: " + userId);

            Cart cart = getCartByUserId(userId);
            System.out.println("Cart ID: " + cart.getId());
            System.out.println("Number of items to delete: " + cart.getItems().size());

            // Delete all items
            cartItemRepository.deleteAll(cart.getItems());

            System.out.println("All items deleted");
            System.out.println("=== END CLEAR CART ===");

        } catch (RuntimeException e) {
            System.err.println("Business logic error in clearCart: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in clearCart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to clear cart: " + e.getMessage());
        }
    }
}