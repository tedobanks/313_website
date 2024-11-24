<script setup>
import { useRoute } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";
import { ref, onMounted } from "vue";

// Component Imports
import Header from "@/components/Header.vue";

const route = useRoute();
const categoryStore = useCategoryStore();

const productId = route.params.id; // Get product ID from route
const product = ref(null); // Holds the product data
const isLoading = ref(true); // Tracks the loading state
const isError = ref(false); // Tracks if there was an error

onMounted(() => {
    try {
        product.value = categoryStore.getProductById(productId); // Get the product by ID
        if (!product.value) {
            isError.value = true; // Mark error if product is not found
            console.error("Product not found.");
        }
    } catch (error) {
        console.error("Error fetching product data:", error);
        isError.value = true;
    } finally {
        isLoading.value = false; // Stop loading
    }
});
</script>

<template>
    <div class="detail-container">
        <Header />
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
            <p>Product not found. Please try again later.</p>
        </div>

        <!-- Product Details -->
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
                    <p class="product-name karla-500">
                        {{ product.name }}
                    </p>
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
                        >
                            {{ size }}
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="cta-container">
                    <p v-if="product.quantity == 0" class="stock-quantity karla-500">
                        Out of stock
                    </p>
                    <p v-else-if="product.quantity <= 5" class="stock-quantity karla-500">
                        Only {{ product.quantity }} left!
                    </p>
                    <p v-else class="stock-quantity karla-500">In stock</p>
                    <button class="add-to-bag karla-500">ADD TO BAG</button>
                </div>

                <hr class="section-hr">

                <div class="product-description-container">
                    <p class="product-descriptions-title">Product Description</p>
                </div>
            </section>
        </div>
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

.option-title {
    font-size: 1.125rem;
    color: black;
    margin-bottom: 0.625rem;
}

.options-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 0.625rem;
}

.option {
    padding-inline: 1.25rem;
    padding-block: 0.625rem;
    background-color: #F5F4F4;
    cursor: pointer;
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

.add-to-bag {
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

.product-description-container {
    width: 100%;
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
</style>
