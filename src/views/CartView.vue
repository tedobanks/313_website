<script setup>
import { useCategoryStore } from "@/stores/categoryProductStore";
import { ref, onMounted, watch, computed } from "vue";

// Component Imports
import Header from "@/components/Header.vue";

const categoryStore = useCategoryStore();
const products = ref([]); // Holds the product data
const isLoading = ref(true); // Tracks the loading state
const isError = ref(false); // Tracks if there was an error

// Function to load products from the shopping bag
const loadProducts = () => {
  products.value = [...categoryStore.shoppingBag];
  if (!products.value.length) {
    isError.value = true; // Mark error if the shopping bag is empty
    console.error("Shopping bag is empty.");
  } else {
    isError.value = false;
  }
};

onMounted(() => {
  try {
    loadProducts();
  } catch (error) {
    console.error("Error fetching product data:", error);
    isError.value = true;
  } finally {
    isLoading.value = false; // Stop loading
  }
});

// Watch for changes in the shopping bag to update products
watch(
  () => categoryStore.shoppingBag,
  () => {
    loadProducts();
  },
  { deep: true }
);

// Increase quantity
const increaseQuantity = (productItem) => {
  categoryStore.addToShoppingBag(
    productItem.product,
    productItem.color,
    productItem.size,
    1
  );
};

// Decrease quantity
const decreaseQuantity = (productItem) => {
  categoryStore.removeFromShoppingBag(
    productItem.product,
    productItem.color,
    productItem.size,
    1
  );
};

// Remove item from shopping bag
const removeItem = (productItem) => {
  categoryStore.removeFromShoppingBag(
    productItem.product,
    productItem.color,
    productItem.size,
    productItem.quantity // Remove all quantities
  );
};

// Calculate Subtotal
// Calculate Subtotal
const subtotal = computed(() => {
  return products.value.reduce((accumulator, item) => {
    const priceStr = item.product?.price || '0';
    const price = parseFloat(priceStr.replace(/,/g, '')) || 0;
    const quantity = parseInt(item.quantity, 10) || 0;

    if (!price || !quantity) {
      return accumulator;
    }

    return accumulator + price * quantity;
  }, 0);
});


// Delivery Fee (Example: flat rate)
const deliveryFee = ref(7000); // Adjust as needed

// Calculate Total
const total = computed(() => {
  return subtotal.value + deliveryFee.value;
});
</script>

<template>
  <div class="cart-wrapper">
    <Header />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <img src="/images/313-loader.png" class="logo-loader" alt="Loading" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="error-message">
      <p>Your shopping bag is empty. Please add some products.</p>
    </div>

    <!-- Shopping Bag Contents -->
    <div v-else class="cart-container">
      <section class="items-container">
        <h2 class="page-title lato-700">Your shopping bag</h2>
        <div class="items">
          <div
            v-for="(productItem, index) in products"
            :key="index"
            class="item"
          >
            <div
              class="item-img"
              :style="{
                backgroundImage: `url(${productItem.product.imageUrls[0]})`,
              }"
            ></div>
            <div class="item-info">
              <h3 class="product-name lato-700">
                {{ productItem.product.name }}
              </h3>
              <p class="product-color lato-400">
                Color: {{ productItem.color }}
              </p>
              <h3 class="product-price lato-700">
                ₦{{ productItem.product.price }}
              </h3>
              <div class="size-qty-container">
                <div class="sqc-item">
                  <p class="sqc-title lato-400">Size</p>
                  <div class="sqc-value lato-400">
                    {{ productItem.size }}
                  </div>
                </div>
                <div class="sqc-item">
                  <p class="sqc-title lato-400">Qty</p>
                  <div class="quantity-controls">
                    <button
                      @click="decreaseQuantity(productItem)"
                      class="quantity-button"
                    >
                      -
                    </button>
                    <span class="quantity-display">
                      {{ productItem.quantity }}
                    </span>
                    <button
                      @click="increaseQuantity(productItem)"
                      class="quantity-button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                @click="removeItem(productItem)"
                class="remove-button lato-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>
      <!-- Order Summary -->
      <section class="order-summary-container">
        <div class="order-summary-item">
          <p class="order-summary-text lato-700">Order summary</p>
          <!-- Promo code -->
          <div class="promo-container">
            <p class="promo-code-text lato-400">Promo code?</p>
            <div class="promo-code-field-container">
              <input
                type="text"
                class="promo-code-field lato-400"
                placeholder="Enter promo code"
              />
              <button class="promo-code-redeem-button lato-400">
                Redeem
              </button>
            </div>
          </div>
          <!-- Subtotal -->
          <div class="subtotal-container">
            <p class="subtotal-text lato-400">Subtotal</p>
            <p class="subtotal-amount lato-400">
              ₦{{ subtotal ? subtotal.toLocaleString() : '0' }}
            </p>
          </div>
          <!-- Delivery -->
          <div class="delivery-container">
            <p class="delivery-text lato-400">Delivery</p>
            <p class="delivery-amount lato-400">
              ₦{{ deliveryFee ? deliveryFee.toLocaleString() : '0' }}
            </p>
          </div>
          <!-- Divider -->
          <hr class="section-hr" />
          <!-- Total -->
          <div class="total-container">
            <p class="total-text lato-400">Total</p>
            <p class="total-amount lato-700">
              ₦{{ total ? total.toLocaleString() : '0' }}
            </p>
          </div>
          <!-- Checkout Button -->
          <button class="checkout lato-400">Checkout</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cart-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.cart-container {
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: start;
  padding-block: 2.5rem;
}

.items-container {
  width: 55%;
  padding-left: 2.5rem;
  padding-right: 1.25rem;
}

.items {
  width: 100%;
}

.item {
  width: 100%;
  height: 16.25rem;
  display: flex;
  background-color: #f8f8f8;
  margin-bottom: 1.25rem;
}

.item-img {
  height: 100%;
  aspect-ratio: 1;
  margin-right: 1.25rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.item-info {
  height: 100%;
  width: calc(100% - 20px - 221px);
  display: flex;
  flex-direction: column;
  align-items: start;
}

.product-name-wrapper {
  width: 100%;
  height: fit-content;
  overflow: hidden;
}

.product-name,
.product-color,
.product-price {
  color: black;
  padding-top: 0.975rem;
  line-height: 1;
}

.product-name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.5rem;
}

.product-color {
  font-size: 1.125rem;
}

.product-price {
  font-size: 1.75rem;
}

.size-qty-container {
  width: 100%;
  display: flex;
  padding-top: 0.625rem;
  gap: 1.25rem;
}

.sqc-item {
  display: flex;
  flex-direction: column;
  align-items: start;
}

.sqc-title {
  font-size: 1.125rem;
  color: black;
  padding-bottom: 0.3125rem;
}

.sqc-value {
  width: 5.9375rem;
  height: 2.5rem;
  border: 1px solid #ece7e3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: black;
  font-size: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-button {
  width: 30px;
  height: 30px;
  background-color: black;
  color: white;
  border: none;
  cursor: pointer;
}

.quantity-display {
  margin: 0 10px;
  font-size: 1rem;
}

.remove-button {
  margin-top: 10px;
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1rem;
}

.order-summary-container {
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-summary-item {
  width: 80%;
  border: 2px solid black;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
}

.order-summary-text {
  font-size: 1.75rem;
  color: black;
}

.promo-container {
  width: 100%;
  margin-block: 0.9375rem;
}

.promo-code-text,
.subtotal-text,
.subtotal-amount,
.delivery-text,
.delivery-amount,
.total-text,
.total-amount {
  font-size: 1.125rem;
  color: black;
}

.promo-code-field-container {
  width: 100%;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.625rem;
}

.promo-code-field {
  height: 100%;
  width: 75%;
  border: 1px solid #ece7e3;
  padding-inline: 1rem;
}

.promo-code-field::placeholder {
  color: #ece7e3;
}

.promo-code-redeem-button {
  height: 100%;
  width: 25%;
  border: none;
  background-color: black;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.subtotal-container {
  margin-top: 0.625rem;
}

.subtotal-container,
.delivery-container,
.total-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.section-hr {
  border: 1px solid #ece7e3;
  width: 100%;
  margin-block: 1.25rem;
}

.checkout {
  width: 100%;
  height: 3.5rem;
  background-color: black;
  color: white;
  margin-top: 1.25rem;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
}

.page-title {
  font-size: 1.875rem;
  color: black;
  margin-bottom: 1.25rem;
}

/* Loading and error message styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.logo-loader {
  width: 10%;
  aspect-ratio: 1;
  animation: spinning 2s linear infinite;
}

@keyframes spinning {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 70px); /* Adjust based on your header height */
  font-size: 18px;
  color: red;
}
</style>
