<script setup>
import { useCategoryStore } from "@/stores/categoryProductStore";
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
// import PaystackPop from '@paystack/inline-js';

// Component Imports
import Header from "@/components/Header.vue";

const categoryStore = useCategoryStore();
const products = ref([]); // Holds the product data
const isLoading = ref(true); // Tracks the loading state
const isError = ref(false); // Tracks if there was an error
const isInputValid = ref(false);

const recipientName = ref("");
const recipientEmail = ref("");
const recipientPhone = ref("");
const recipientAddress = ref("");
const recipientArea = ref("");
const recipientValidationErrors = ref([]);

// List of areas in Lagos
const lagosAreasDeliveryPrices = [
    { area: "Ikeja", price: 5000 },
    { area: "Victoria Island", price: 5700 },
    { area: "Lekki", price: 6100 },
    { area: "Surulere", price: 5400 },
    { area: "Yaba", price: 5400 },
    { area: "Ikoyi", price: 5900 },
    { area: "Ajah", price: 6500 },
    { area: "Epe", price: 8700 },
    { area: "Ikorodu", price: 7900 },
    { area: "Badagry", price: 10000 },
    { area: "Oshodi", price: 5000 },
    { area: "Mushin", price: 5100 },
    { area: "Maryland", price: 5100 },
    { area: "Iyana Ipaja", price: 6100 },
    { area: "Festac Town", price: 6500 },
    { area: "Agege", price: 5400 },
    { area: "Ogba", price: 5300 },
    { area: "Apapa", price: 6800 },
    { area: "Ojo", price: 7200 },
    { area: "Egbeda", price: 6100 },
    { area: "Shomolu", price: 5300 },
    { area: "Magodo", price: 5700 },
    { area: "Ketu", price: 5100 },
    { area: "Alimosho", price: 6500 },
    { area: "Bariga", price: 5400 },
    { area: "Ogudu", price: 5200 },
    { area: "Gbagada", price: 5300 },
    { area: "Isolo", price: 6100 },
    { area: "Agbado", price: 6800 },
];

const checkInputValidity = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Direct validation checks
    const nameValid = recipientName.value && recipientName.value.trim() !== "";
    const emailValid = emailRegex.test(recipientEmail.value);
    const phoneValid =
        recipientPhone.value && recipientPhone.value.trim() !== "";
    const addressValid =
        recipientAddress.value && recipientAddress.value.trim() !== "";
    const areaValid = recipientArea.value && recipientArea.value.trim() !== "";

    // Assign delivery fee
    deliveryFee.value = lagosAreasDeliveryPrices.find(
        (item) => item.area === recipientArea.value
    )?.price;

    if (nameValid && emailValid && phoneValid && addressValid && areaValid) {
        categoryStore.setDeliveryDetails({
            recipientName: recipientName.value,
            recipientEmail: recipientEmail.value,
            recipientPhone: recipientPhone.value,
            recipientAddress: recipientAddress.value,
            recipientArea: recipientArea.value,
            deliveryFee: deliveryFee.value,
            orderTotal: total.value,
            orderNumber: "ORD-" + Date.now(), // Generate order number
        });

        console.log(categoryStore.deliveryDetails)
        isInputValid.value = true;
    } else {
        isInputValid.value = false;

        if (!nameValid) {
            recipientValidationErrors.value.push("Please Input your name");
        } else if (!emailValid) {
            recipientValidationErrors.value.push(
                "Please ensure you entered a working email address"
            );
        } else if (!phoneValid) {
            recipientValidationErrors.value.push("Please input a phone number");
        } else if (!addressValid) {
            recipientValidationErrors.value.push(
                "Please input your house address"
            );
        } else if (!areaValid) {
            recipientValidationErrors.value.push("Please select an area");
        } else {
            recipientValidationErrors.value.push(
                "Please ensure all fields have been filled"
            );
        }
    }
};

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
        const priceStr = item.product?.price || "0";
        const price = parseFloat(priceStr.replace(/,/g, "")) || 0;
        const quantity = parseInt(item.quantity, 10) || 0;

        if (!price || !quantity) {
            return accumulator;
        }

        return accumulator + price * quantity;
    }, 0);
});

// Delivery Fee (Example: flat rate)
const deliveryFee = ref(0); // Adjust as needed

// Calculate Total
const total = computed(() => {
    return subtotal.value + deliveryFee.value;
});

const handlePaystackPayment = async () => {
    try {
        // Step 1: Initialize transaction with Paystack API
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                amount: total.value * 100, // Amount in kobo
                email: recipientEmail.value, // Customer's email
                callback_url: `http://localhost:5174/reference`, // Temporary URL; append the reference after initialization
                subaccount: "ACCT_fd13om1i3eyx63i", // Replace with your subaccount code
                bearer: "account", // Indicates that the subaccount bears the transaction fees
            },
            {
                headers: {
                    Authorization: `Bearer ${
                        import.meta.env.VITE_PAYSTACK_SECRET_KEY
                    }`, // Your Paystack secret key
                    "Content-Type": "application/json",
                },
            }
        );

        // Step 2: Extract the reference and authorization URL from the response
        const { reference, authorization_url: authorizationUrl } =
            response.data.data;

        console.log("Transaction Reference:", reference); // Debugging

        // Step 3: Update the callback URL dynamically if needed
        const callbackUrl = `http://localhost:5173/reference?reference=${reference}`;
        console.log("Callback URL:", callbackUrl); // Debugging

        // Step 4: Open Paystack checkout in a new window
        const newWindow = window.open(authorizationUrl, "_blank");
        if (newWindow) {
            newWindow.moveTo(0, 0);
            newWindow.resizeTo(screen.width, screen.height);
        }
    } catch (error) {
        console.error("Payment initialization failed", error);
        // Handle error (show message to user, etc.)
    }
};
</script>

<template>
    <div class="cart-wrapper">
        <Header />
        <h2 class="page-title lato-700 mobile-only">Your shopping bag</h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-overlay">
            <img
                src="/images/313-loader.png"
                class="logo-loader"
                alt="Loading"
            />
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="error-message">
            <p>Your shopping bag is empty. Please add some products.</p>
        </div>

        <!-- Shopping Bag Contents -->
        <div v-else class="cart-container">
            <section class="items-container">
                <h2 class="page-title lato-700 desktop-only">
                    Your shopping bag
                </h2>
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
                                            @click="
                                                decreaseQuantity(productItem)
                                            "
                                            class="quantity-button"
                                        >
                                            -
                                        </button>
                                        <span class="quantity-display">
                                            {{ productItem.quantity }}
                                        </span>
                                        <button
                                            @click="
                                                increaseQuantity(productItem)
                                            "
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
            <section class="checkout-summary-container">
                <!-- Recipient Details -->
                <div v-if="isInputValid != true" class="checkout-summary-item">
                    <p class="checkout-summary-text lato-700">
                        Recipient Details
                    </p>
                    <!-- Fullname -->
                    <div class="textbox-container">
                        <p class="textbox-text lato-400">Name</p>
                        <div class="textbox-field-container">
                            <input
                                type="text"
                                class="textbox-field lato-400"
                                placeholder="Enter your name"
                                v-model="recipientName"
                            />
                        </div>
                    </div>
                    <!-- Contact Info -->
                    <div class="detail-inline-box">
                        <!-- Email -->
                        <div class="textbox-container">
                            <p class="textbox-text lato-400">Email</p>
                            <div class="textbox-field-container">
                                <input
                                    type="email"
                                    class="textbox-field lato-400"
                                    placeholder="example@example.com"
                                    v-model="recipientEmail"
                                />
                            </div>
                        </div>
                        <!-- Phone -->
                        <div class="textbox-container">
                            <p class="textbox-text lato-400">Phone</p>
                            <div class="textbox-field-container">
                                <input
                                    type="tel"
                                    class="textbox-field lato-400"
                                    placeholder="e.g., +234 701 234 5678"
                                    v-model="recipientPhone"
                                />
                            </div>
                        </div>
                    </div>
                    <!-- Delivery Info -->
                    <div class="detail-inline-box">
                        <!-- Address -->
                        <div class="textbox-container">
                            <p class="textbox-text lato-400">Address</p>
                            <div class="textbox-field-container">
                                <input
                                    type="text"
                                    class="textbox-field lato-400"
                                    placeholder="e.g., 123 Main St, Lagos, Nigeria"
                                    v-model="recipientAddress"
                                />
                            </div>
                        </div>
                        <!-- Area -->
                        <div class="textbox-container">
                            <p class="textbox-text lato-400">Area</p>
                            <div class="textbox-field-container">
                                <select
                                    class="textbox-field lato-400"
                                    v-model="recipientArea"
                                >
                                    <option value="" disabled selected>
                                        Select an area
                                    </option>
                                    <option
                                        v-for="area in lagosAreasDeliveryPrices"
                                        :key="area.area"
                                        :value="area.area"
                                    >
                                        {{ area.area }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="recipientValidationErrors != []"
                        class="validation-errors-container"
                    >
                        <p
                            v-for="(error, index) in recipientValidationErrors"
                            :key="index"
                            class="validation-error-text lato-400"
                        >
                            {{ error }}
                        </p>
                    </div>
                    <!-- Go to payment button -->
                    <button
                        class="checkout lato-400"
                        @click="checkInputValidity"
                    >
                        Pay now
                    </button>
                </div>
                <!-- Order Summary -->
                <div v-else class="checkout-summary-item">
                    <p class="checkout-summary-text lato-700">Order summary</p>
                    <!-- textbox code -->
                    <div class="textbox-container promo-code-container">
                        <p class="textbox-text lato-400">Promo code?</p>
                        <div
                            class="textbox-field-container promo-code-field-container"
                        >
                            <input
                                type="text"
                                class="textbox-field promo-code-field lato-400"
                                placeholder="Enter textbox code"
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
                            ₦{{ subtotal ? subtotal.toLocaleString() : "0" }}
                        </p>
                    </div>
                    <!-- Delivery -->
                    <div class="delivery-container">
                        <p class="delivery-text lato-400">Delivery</p>
                        <p class="delivery-amount lato-400">
                            ₦{{
                                deliveryFee ? deliveryFee.toLocaleString() : "0"
                            }}
                        </p>
                    </div>
                    <!-- Divider -->
                    <hr class="section-hr" />
                    <!-- Total -->
                    <div class="total-container">
                        <p class="total-text lato-400">Total</p>
                        <p class="total-amount lato-700">
                            ₦{{ total ? total.toLocaleString() : "0" }}
                        </p>
                    </div>
                    <!-- Checkout Button -->
                    <button
                        class="checkout lato-400"
                        @click="handlePaystackPayment"
                    >
                        Checkout
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.mobile-only {
    display: none;
}

.desktop-only {
    display: flex;
}
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

.checkout-summary-container {
    width: 45%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.checkout-summary-item {
    width: 80%;
    border: 2px solid black;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
}

.checkout-summary-text {
    font-size: 1.75rem;
    color: black;
}

.textbox-container {
    width: 100%;
    margin-block: 0.3125rem;
}

.promo-code-container {
    margin-block: 0.9375rem !important;
}

.textbox-text,
.subtotal-text,
.subtotal-amount,
.delivery-text,
.delivery-amount,
.total-text,
.total-amount {
    font-size: 1.125rem;
    color: black;
}

.textbox-field-container {
    width: 100%;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.3125rem;
}

.promo-code-field-container {
    margin-top: 0.625rem !important;
}

.textbox-field {
    height: 100%;
    width: 100%;
    border: 1px solid #ece7e3;
    padding-inline: 1rem;
}

.promo-code-field {
    width: 75% !important;
}

.textbox-field::placeholder {
    color: #ece7e3;
}

.detail-inline-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.detail-inline-box .textbox-container {
    width: 47%;
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

.validation-errors-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-content: start;
}

.validation-error-text {
    color: red;
    font-size: 0.8125rem;
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

.error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: calc(100vh - 70px); /* Adjust based on your header height */
    font-size: 18px;
    color: red;
}

@keyframes spinning {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@media only screen and (max-width: 768px) {
    .mobile-only {
        display: flex;
    }

    .desktop-only {
        display: none;
    }

    .cart-container {
        flex-direction: column-reverse;

        width: 100%;
        height: fit-content;
        display: flex;
        align-items: start;
        padding-top: 0rem;
        padding-bottom: 2.5rem;
    }

    .items-container {
        width: 100%;
        padding-inline: 0.625rem;
        margin-top: 1.5rem;
    }

    .checkout-summary-container {
        width: 100%;
        padding-inline: 0.625rem;
    }

    .checkout-summary-item {
        width: 100%;
    }

    .item {
        width: 100%;
        height: 9.375rem;
        background-color: #f8f8f8;
        margin-bottom: 1.25rem;
    }

    .item-img {
        margin-right: 0.3125rem;
        background-size: cover;
    }

    .item-info {
        height: 100%;
        width: calc(100% - 5px - 150px);
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .page-title {
        margin-left: 0.625rem;
        margin-top: 2.5rem;
    }

    .product-name,
    .product-color,
    .product-price {
        padding-top: 0.625rem;
    }

    .product-name {
        font-size: 0.8125rem;
    }

    .product-color {
        font-size: 0.75rem;
    }

    .product-price {
        font-size: 0.8125rem;
    }

    .size-qty-container {
        width: 100%;
        display: flex;
        padding-top: 0.625rem;
        gap: 1.25rem;
    }

    .sqc-title {
        font-size: 0.75rem;
        padding-bottom: 0.3125rem;
    }

    .sqc-value {
        width: 5.9375rem;
        height: 1.25rem;
        font-size: 0.8125rem;
    }

    .quantity-button {
        width: 20px;
        height: 20px;
    }

    .quantity-display {
        font-size: 0.75rem;
    }

    .remove-button {
        margin-top: 5px;
        font-size: 0.8125rem;
    }
}
</style>
