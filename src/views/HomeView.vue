<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const isLoading = ref(true);
const isError = ref(false);
const router = useRouter();
const categoryStore = useCategoryStore();

const productsByCategory = ref({});

const openProductCategory = (id) => {
    router.push({
        name: "CategoryProducts",
        params: { category: id },
    });
};

const loadProductsByCategory = () => {
    if (categoryStore.productsByCategory) {
        productsByCategory.value = categoryStore.productsByCategory;
        console.log("Products by Category:", productsByCategory.value);
        isError.value = false;
    } else {
        productsByCategory.value = {};
        isError.value = true;
        console.error("Products by category not available.");
    }
};

// Computed property to get category list from the object
const categoryList = computed(() => {
    return Object.entries(productsByCategory.value);
});

onMounted(async () => {
    isLoading.value = true;
    try {
        if (
            !categoryStore.productsByCategory ||
            Object.keys(categoryStore.productsByCategory).length === 0
        ) {
            await Promise.all([
                categoryStore.fetchCategories(),
                categoryStore.fetchProducts(),
            ]);
        }
        loadProductsByCategory();
    } catch (error) {
        console.error("Error fetching data:", error);
        isError.value = true;
    } finally {
        isLoading.value = false;
    }
});

watch(
    () => categoryStore.productsByCategory,
    () => {
        loadProductsByCategory();
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="isLoading" class="loading-overlay">
        <img src="/images/313-loader.png" class="logo-loader" alt="Loading" />
    </div>
    <div v-else-if="isError" class="error-message">
        <p>Failed to load categories. Please try again later.</p>
    </div>
    <div v-else class="home-container">
        <Header />
        <div class="hero-section">
            <div class="overlay">
                <div class="sticky-container">
                    <p class="sticky-text"><span class="dotted-e">E</span>LGNT</p>
                </div>
            </div>

            <div class="hero-section-1"></div>
            <div class="hero-section-2">
                <div class="sub-hero-image shi-1"></div>
                <div class="sub-hero-image shi-2"></div>
            </div>
            <div class="hero-section-3"></div>
        </div>
        <div class="extras">
            <div
                v-for="[categoryId, categoryData] in categoryList"
                :key="categoryId"
                class="category"
                :style="{
                    backgroundImage: `url(${categoryData.categoryImage})`,
                }"
                @click="openProductCategory(categoryId)"
            >
                <div class="blur-overlay"></div>
                <p class="category-name">{{ categoryData.categoryName }}</p>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped>
.home-container {
    width: 100%;
    height: fit-content;
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

.hero-section {
    width: 100%;
    height: 4000px;
    background-color: transparent;
    position: relative;
}

.overlay {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: transparent !important;
}

.sticky-container {
    position: sticky;
    top: 30%;
    padding: 5px;
    margin-bottom: 40px;
    background-color: transparent !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

@font-face {
    font-family: "Helvetica Extra Compressed";
    src: url("/fonts/Helvetica Extra Compressed Regular.otf") format("opentype");
    font-weight: normal;
    font-style: normal;
}

.sticky-text {
    font-family: "Helvetica Extra Compressed", sans-serif;
    font-size: 12.5rem;
    line-height: 1;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    user-select: none;
}

.dotted-e {
    position: relative;
}

.dotted-e::after {
    content: '••';
    position: absolute;
    bottom: -0.06em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.2em;
    letter-spacing: normal;
}

.hero-section-1,
.hero-section-2,
.hero-section-3 {
    height: calc(100% / 3);
    width: 100%;
    background-color: transparent !important;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.hero-section-1 {
    background-image: url("/images/showcase-1.jpeg");
}
.hero-section-2 {
    display: flex;
    align-items: center;
}
.hero-section-3 {
    background-image: url("/images/showcase-2.jpeg");
}

.sub-hero-image {
    height: 100%;
    width: 50%;
    background-color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.shi-1 {
    background-image: url("/images/showcase-3.jpeg");
}

.shi-2 {
    background-image: url("/images/showcase-4.jpeg");
    background-color: red;
}

.extras {
    width: 100%;
    background-color: white;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    margin-block: 5px;
}

.category {
    height: 60vh;
    width: 25%;
    position: relative;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    cursor: pointer;
}

.blur-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(0px); /* Adjust the intensity of the blur */
    background-color: rgba(
        255,
        255,
        255,
        0
    ); /* Optional for adding transparency */
    z-index: 1;
    transition: all 0.3s ease-in-out;
}

.category-name {
    color: black;
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 2;
    transition: font-size 0.3s ease-in-out;
}

.category:hover .blur-overlay {
    backdrop-filter: blur(5px); /* Adjust the intensity of the blur */
    background-color: rgba(255, 255, 255, 0.3);
}

.category:hover .category-name {
    font-size: 25px;
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
    .hero-section {
        height: 260vh;
    }

    .hero-section-1,
    .hero-section-2,
    .hero-section-3 {
        height: 65vh;
        width: 100%;
    }

    .hero-section-1 {
        background-image: url("/images/showcase-2.jpeg");
    }
    .hero-section-2 {
        flex-direction: column;
        height: fit-content;
        filter: grayscale(0.5);
    }

    .hero-section-2:hover {
        filter: none;
    }

    .hero-section-3 {
        background-image: url("/images/showcase-1.jpeg");
    }

    .sub-hero-image {
        height: 65vh;
        width: 100%;
    }

    .sticky-text {
        font-size: 3.75rem;
    }

    .extras {
        gap: 0px;
    }

    .category {
        height: 30vh;
        width: 50%;
    }
}
</style>
