package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.dto.ApiResponse;
import com.example.Shopping.Cart.dto.CartItemRequest;
import com.example.Shopping.Cart.model.Cart;
import com.example.Shopping.Cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Get cart by user ID
     * GET /api/cart/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            System.out.println("=== GET CART REQUEST ===");
            System.out.println("User ID: " + userId);

            Cart cart = cartService.getCartByUserId(userId);

            System.out.println("Cart retrieved successfully");
            System.out.println("Cart ID: " + cart.getId());
            System.out.println("Number of items: " + cart.getItems().size());

            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            System.err.println("=== ERROR IN GET CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get cart: " + e.getMessage()));
        }
    }

    /**
     * Add item to cart
     * POST /api/cart/{userId}/add
     */
    @PostMapping("/{userId}/add")
    public ResponseEntity<?> addToCart(
            @PathVariable Long userId,
            @RequestBody CartItemRequest request) {
        try {
            System.out.println("=== ADD TO CART REQUEST ===");
            System.out.println("User ID: " + userId);
            System.out.println("Product ID: " + request.getProductId());
            System.out.println("Quantity: " + request.getQuantity());

            // Validate input
            if (request.getProductId() == null) {
                System.err.println("ERROR: Product ID is null");
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Product ID is required"));
            }

            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                System.err.println("ERROR: Invalid quantity: " + request.getQuantity());
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Valid quantity is required"));
            }

            Cart cart = cartService.addToCart(userId, request.getProductId(), request.getQuantity());

            System.out.println("Item added successfully");
            System.out.println("Cart now has " + cart.getItems().size() + " items");

            return ResponseEntity.ok(new ApiResponse(true, "Item added to cart", cart));

        } catch (RuntimeException e) {
            System.err.println("=== ERROR IN ADD TO CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));

        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR IN ADD TO CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to add to cart: " + e.getMessage()));
        }
    }

    /**
     * Update cart item quantity
     * PUT /api/cart/{userId}/update
     */
    @PutMapping("/{userId}/update")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long userId,
            @RequestBody CartItemRequest request) {
        try {
            System.out.println("=== UPDATE CART ITEM REQUEST ===");
            System.out.println("User ID: " + userId);
            System.out.println("Product ID: " + request.getProductId());
            System.out.println("New Quantity: " + request.getQuantity());

            // Validate input
            if (request.getProductId() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Product ID is required"));
            }

            if (request.getQuantity() == null || request.getQuantity() < 0) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Valid quantity is required"));
            }

            Cart cart = cartService.updateCartItem(userId, request.getProductId(), request.getQuantity());

            System.out.println("Cart item updated successfully");

            return ResponseEntity.ok(new ApiResponse(true, "Cart updated", cart));

        } catch (RuntimeException e) {
            System.err.println("=== ERROR IN UPDATE CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));

        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR IN UPDATE CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update cart: " + e.getMessage()));
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/{userId}/item/{itemId}
     */
    @DeleteMapping("/{userId}/item/{itemId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long itemId) {
        try {
            System.out.println("=== REMOVE FROM CART REQUEST ===");
            System.out.println("User ID: " + userId);
            System.out.println("Item ID: " + itemId);

            Cart cart = cartService.removeFromCart(userId, itemId);

            System.out.println("Item removed successfully");
            System.out.println("Cart now has " + cart.getItems().size() + " items");

            return ResponseEntity.ok(new ApiResponse(true, "Item removed from cart", cart));

        } catch (RuntimeException e) {
            System.err.println("=== ERROR IN REMOVE FROM CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));

        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR IN REMOVE FROM CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to remove item: " + e.getMessage()));
        }
    }

    /**
     * Clear all items from cart
     * DELETE /api/cart/{userId}/clear
     */
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            System.out.println("=== CLEAR CART REQUEST ===");
            System.out.println("User ID: " + userId);

            cartService.clearCart(userId);

            System.out.println("Cart cleared successfully");

            return ResponseEntity.ok(new ApiResponse(true, "Cart cleared"));

        } catch (RuntimeException e) {
            System.err.println("=== ERROR IN CLEAR CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));

        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR IN CLEAR CART ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to clear cart: " + e.getMessage()));
        }
    }
}