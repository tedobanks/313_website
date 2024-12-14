
<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";

// Component imports
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();
const router = useRouter();
const categoryId = route.params.category; // Get category ID from route
const categoryStore = useCategoryStore();

const isLoading = ref(true);
const isError = ref(false);

// Initialize selectedCategoryData as a ref
const selectedCategoryData = ref(null);

const viewProductDetails = (productId) => {
    router.push({
        name: "ProductDetailsView",
        params: { category: categoryId, id: productId },
    });
};

// Function to load category data
const loadCategoryData = () => {
    if (categoryStore.productsByCategory) {
        // Use bracket notation to access the category data
        selectedCategoryData.value =
            categoryStore.productsByCategory[categoryId];
        if (!selectedCategoryData.value) {
            isError.value = true;
            console.error("Category data not found.");
        } else {
            isError.value = false;
        }
    } else {
        selectedCategoryData.value = null;
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await categoryStore.refreshData();
        // Check if products and categories are loaded, if not, fetch them
        if (
            !categoryStore.products.length ||
            !categoryStore.categories.length
        ) {
            await Promise.all([
                categoryStore.fetchCategories(),
                categoryStore.fetchProducts(),
            ]);
        }
        // Load the category data
        loadCategoryData();
    } catch (error) {
        console.error("Error fetching category data:", error);
        isError.value = true;
    } finally {
        isLoading.value = false;
    }
});

// Watch for changes in productsByCategory to update selectedCategoryData
watch(
    () => categoryStore.productsByCategory,
    () => {
        loadCategoryData();
    },
    { immediate: true }
);
</script>

<template>
    <div class="products-container">
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
            <p>Failed to load category data. Please try again later.</p>
        </div>

        <!-- Data Display -->
        <div v-else-if="selectedCategoryData">
            <section class="category-info">
                <h2 class="category-name">
                    {{ selectedCategoryData.categoryName }}
                </h2>
                <p class="category-items-count">
                    {{ selectedCategoryData.categoryProducts.length }} items
                </p>
            </section>
            <section class="category-products">
                <div
                    v-for="product in selectedCategoryData.categoryProducts"
                    :key="product.id"
                    class="category-product"
                    @click="viewProductDetails(product.id)"
                >
                    <div class="category-product-image">
                        <img :src="product.imageUrls[0]" alt="" />
                    </div>
                    <div class="category-product-info">
                        <p class="category-product-name">{{ product.name }}</p>
                        <p class="category-product-price">
                            ₦{{ product.price }}
                        </p>
                    </div>
                </div>
            </section>
        </div>

        <!-- Fallback for No Data -->
        <div v-else class="no-data">
            <p>No data available for this category.</p>
        </div>

        <Footer/>
    </div>
</template>

<style scoped>
.products-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.category-info {
    margin-top: 20px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    padding-inline: 20px;
}

.category-name {
    font-size: 20px;
    color: black;
    font-weight: 500;
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

.error-message,
.no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
}

.error-message {
    color: red;
}

.category-products {
    width: 100%;
    background-color: white;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    margin-block: 20px;
}

.category-product {
    height: 85vh;
    width: 25%;
    position: relative;
    background-color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
    border: 0px solid transparent;
    transition: all 0.3s ease-in-out;
}

.category-product-image {
    width: 100%;
    height: 90%;
    overflow: hidden;
}

.category-product:hover {
    border: 2px solid black;
}

.category-product-image img {
    width: 100%;
    height: 100%;
    object-position: center;
    object-fit: cover;
    transform: scale(1);
    transition: transform 0.4s ease-in-out;
}

.category-product-image img:hover {
    transform: scale(1.2);
}

.category-product-info {
    width: 100%;
    height: 10%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 15px;
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
    .category-product {
        height: 38vh;
        width: 50%;
    }

    .category-product-image {
        width: 100%;
        height: 80%;
        overflow: hidden;
    }

    .category-product:hover {
        border: 2px solid black;
    }

    .category-product-info {
        width: 100%;
        height: 18%;
        flex-direction: column;
        padding-inline: 0.3125rem;
    }

    .category-product-name,
    .category-product-price {
        height: 50%;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
