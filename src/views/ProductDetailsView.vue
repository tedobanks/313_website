<script setup>
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";
import { ref, onMounted, computed } from "vue";

// Component Imports
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();

const productId = route.params.id; // Get product ID from route
const product = ref(null); // Holds the product data
const isLoading = ref(true); // Tracks the loading state
const isError = ref(false); // Tracks if there was an error
const selectedColor = ref("");
const selectedSize = ref("");

const goToShoppingBag = () => {
    router.push("/cart");
};

// Function to handle option selection
const selectColor = (color) => {
    selectedColor.value = color;
};

const selectSize = (size) => {
    selectedSize.value = size;
};

const getSelectedColor = computed(() => {
    // If no color is selected, return the first color from the product's colors array
    return selectedColor.value || (product.value?.colors?.[0] ?? "");
});
const getSelectedSize = computed(() => {
    // If no color is selected, return the first color from the product's colors array
    return selectedSize.value || (product.value?.sizes?.[0] ?? "");
});

// const quantityInBag = computed(() => {
//     if (product.value && getSelectedColor.value && getSelectedSize.value) {
//         return categoryStore.getProductQuantityInBag(
//             product.value,
//             getSelectedColor.value,
//             getSelectedSize.value
//         );
//     }
//     return 0;
// });

const selectedProduct = computed(() => ({
    product: product.value,
    color: getSelectedColor.value,
    size: getSelectedSize.value,
}));

// const goToBag = () => {
//     const resolvedProduct = selectedProduct.value; // Extract resolved value
//     categoryStore.addToShoppingBag(resolvedProduct); // Add to shopping bag
// };

const quantityInBag = computed(() => {
    if (
        product.value &&
        product.value.id &&
        getSelectedColor.value &&
        getSelectedSize.value
    ) {
        return categoryStore.getProductQuantityInBag(
            product.value,
            getSelectedColor.value,
            getSelectedSize.value
        );
    }
    return 0;
});

// Add to shopping bag
const addToBag = () => {
    if (!getSelectedColor.value || !getSelectedSize.value) {
        alert("Please select a color and size.");
        return;
    }
    categoryStore.addToShoppingBag(
        product.value,
        getSelectedColor.value,
        getSelectedSize.value
    );
};

// Increase or decrease quantity
const increaseQuantity = () => {
    categoryStore.addToShoppingBag(
        product.value,
        getSelectedColor.value,
        getSelectedSize.value
    );
};
const decreaseQuantity = () => {
    categoryStore.removeFromShoppingBag(
        product.value,
        getSelectedColor.value,
        getSelectedSize.value
    );
};

onMounted(async () => {
    isLoading.value = true;
    try {
        if (!categoryStore.products.length) {
            await categoryStore.fetchProducts();
        }
        product.value = categoryStore.getProductById(productId);
        if (!product.value) {
            isError.value = true;
        }
    } catch (error) {
        console.error("Error fetching product data:", error);
        isError.value = true;
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="detail-container">
        <Header />
        <div v-if="isLoading" class="loading-overlay">
            <img
                src="/images/313-loader.png"
                class="logo-loader"
                alt="Loading"
            />
        </div>
        <div v-else-if="isError" class="error-message">
            <p>Product not found. Please try again later.</p>
        </div>
        <div v-else class="display-container">
            <section class="images-container">
                <img
                    v-for="(image, index) in product.imageUrls"
                    :key="index"
                    :src="image"
                    alt="Product Image"
                />
            </section>
            <section class="product-info">
                <div class="product-base-info">
                    <p class="product-name karla-500">{{ product.name }}</p>
                    <p class="product-price karla-500">₦{{ product.price }}</p>
                </div>
                <hr class="section-hr" />

                <!-- Options -->
                <div class="options-wrapper">
                    <p class="option-title karla-500">Color</p>
                    <div class="options-container">
                        <div
                            v-for="color in product.colors"
                            :key="color"
                            class="option"
                            :class="{
                                'option-active': getSelectedColor === color,
                            }"
                            @click="selectColor(color)"
                        >
                            {{ color }}
                        </div>
                    </div>
                </div>
                <div class="options-wrapper">
                    <p class="option-title karla-500">Size</p>
                    <div class="options-container">
                        <div
                            v-for="size in product.sizes"
                            :key="size"
                            class="option"
                            :class="{
                                'option-active': getSelectedSize === size,
                            }"
                            @click="selectSize(size)"
                        >
                            {{ size }}
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="cta-container">
                    <p
                        v-if="product.quantity == 0"
                        class="stock-quantity karla-500"
                    >
                        Out of stock
                    </p>
                    <p
                        v-else-if="product.quantity <= 5"
                        class="stock-quantity karla-500"
                    >
                        Only {{ product.quantity }} left!
                    </p>
                    <p v-else class="stock-quantity karla-500">In stock</p>

                    <!-- Quantity Controls -->
                    <div v-if="quantityInBag > 0" class="quantity-controls">
                        <button
                            @click="decreaseQuantity"
                            class="quantity-button"
                        >
                            -
                        </button>
                        <span class="quantity-display">{{
                            quantityInBag
                        }}</span>
                        <button
                            @click="increaseQuantity"
                            class="quantity-button"
                        >
                            +
                        </button>
                    </div>
                    <button
                        v-if="quantityInBag > 0"
                        class="intent-action-button go-to-bag lato-400"
                        @click="goToShoppingBag"
                    >
                        GO TO BAG
                    </button>
                    <button
                        v-else
                        @click="addToBag"
                        :disabled="!getSelectedColor || !getSelectedSize"
                        class="intent-action-button lato-400"
                    >
                        ADD TO BAG
                    </button>
                </div>

                <hr class="section-hr" />

                <!-- Product descriptions -->
                <div class="product-description-container">
                    <p class="product-description-title karla-500">
                        Product Description
                    </p>
                    <p class="product-description-text karla-500">
                        {{ product.description }}
                    </p>
                </div>
            </section>
        </div>
        <Footer />
    </div>
</template>

<style scoped>
.detail-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.section-hr {
    border: 1px solid #f5f4f4;
    width: 100%;
    margin-top: 1.25rem;
}

.display-container {
    width: 100%;
    height: calc(100% - 70px);
    display: flex;
}

.images-container,
.product-info {
    height: 100%;
}

.images-container {
    overflow-y: scroll;
    scrollbar-width: none;
    width: 55%;
}

.images-container::-webkit-scrollbar {
    display: none;
}

.images-container img {
    width: 100%;
}

.product-info {
    width: 45%;
    padding-inline: 20px;
    padding-block: 40px;
    display: flex;
    flex-direction: column;
    align-items: start;
    overflow-y: scroll;
    scrollbar-width: none;
}

.product-base-info {
    width: 100%;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}

.product-name,
.product-price {
    font-size: 1.875rem;
    color: black;
    line-height: 1.1;
}

.product-name {
    margin-top: 1.875rem;
}

.product-price {
    margin-top: 1.875rem;
}

.options-wrapper {
    width: 100%;
    padding-top: 1.25rem;
}

.option-title,
.product-description-title {
    font-size: 1.125rem;
    color: black;
    margin-bottom: 0.625rem;
}

.options-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: start;
    gap: 0.625rem;
}

.option {
    padding-inline: 1.25rem;
    padding-block: 0.625rem;
    background-color: #f5f4f4;
    color: black;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.option:hover {
    background-color: black;
    color: white;
}

.option-active {
    border: 2px solid black;
}

.cta-container {
    width: 100%;
    display: flex;
    align-items: start;
    flex-direction: column;
    margin-top: 2.5rem;
}

.stock-quantity {
    font-weight: 600;
    margin-bottom: 0.625rem;
}

.intent-action-button {
    width: 100%;
    height: 3.125rem;
    background-color: black;
    color: white;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
}

.go-to-bag {
    margin-top: 1.25rem;
}

.product-description-container {
    width: 100%;
    padding-block: 1.25rem;
}

.product-description-text {
    color: black;
}

.quantity-controls {
    display: flex;
    align-items: center;
    margin-top: 1rem;
}

.quantity-button {
    width: 40px;
    height: 40px;
    background-color: black;
    color: white;
    border: none;
    cursor: pointer;
}

.quantity-display {
    margin: 0 10px;
    font-size: 1.125rem;
}

.loading-overlay {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
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
    width: 100%;
    height: 100vh;
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
    .detail-container {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
    }

    .display-container {
        height: fit-content;
        flex-direction: column;
    }

    .images-container {
        overflow-x: scroll !important;
        overflow-y: hidden; /* Prevent vertical scrolling */
        scrollbar-width: none;
        width: 100%; /* Full width of the screen */
        height: 60vh;
        display: flex;
        white-space: nowrap; /* Prevent line breaks */
    }

    .images-container img {
        width: 100vw; /* Each image takes full viewport width */
        flex-shrink: 0; /* Prevent images from shrinking */
        object-fit: cover; /* Maintain image aspect ratio */
        display: inline-block; /* Allow horizontal scrolling */
    }

    .product-info {
        height: fit-content !important;
        width: 100%;
    }

    .product-base-info {
        flex-direction: column;
        justify-content: start;
    }

    .product-name,
    .product-price {
        margin-top: 1rem;
        font-size: 1.75rem;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}
</style>
