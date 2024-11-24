<script setup>
import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";

const isLoading = ref(false);
const router = useRouter();
const categoryStore = useCategoryStore();

// Check if productsByCategory is available
const productsByCategory = computed(() => {
  return categoryStore.productsByCategory || new Map(); // Provide a fallback Map
});

const openProductCategory = (id) => {
  router.push({
    name: "CategoryProducts",
    params: { category: id },
  });
};

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([categoryStore.fetchCategories(), categoryStore.fetchProducts()]);
  isLoading.value = false;
});
</script>

<template>
    <div v-if="isLoading" class="loading-overlay">
        <img src="/images/313-loader.png" class="logo-loader" alt="" />
    </div>
    <div v-else class="home-container">
        <div class="hero-section">
            <div class="overlay">
                <div class="sticky-container">
                    <p class="sticky-text">E&#x0324;LGNT</p>
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
                v-for="[
                    categoryId,
                    categoryData,
                ] in productsByCategory.entries()"
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

.sticky-text {
    font-family: sans-serif;
    font-size: 12.5rem;
    line-height: 1;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Adjust values as needed */
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
    align-items: center;
    gap: 10px;
    margin-block: 10px;
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
</style>
