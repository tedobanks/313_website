<script setup>
import { useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";

const categoryStore = useCategoryStore();
const router = useRouter();

const goToHome = () => {
    router.push("/")
}

const goToShoppingBag = () => {
    router.push("/cart");
};

</script>

<template>
    <div class="header-wrapper">
        <section class="header">
            <div class="placeholder-container"></div>
            <img src="/images/313-loader.png" alt="logo" class="header-logo" @click="goToHome" />
            <div class="shopping-bag" @click="goToShoppingBag">
                <div v-if="categoryStore.shoppingBag.length != 0" class="product-count"></div>
            </div>
        </section>
        <hr />
    </div>
</template>

<style scoped>
.header-wrapper {
    width: 100%;
}
.header {
    margin-top: 10px;
    height: 50px;
    width: 100%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 1.25rem;
}

.header-logo {
    height: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.placeholder-container,
.shopping-bag {
    height: 50%;
    aspect-ratio: 1;
}

.shopping-bag {
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("/images/shopping-bag.png");
    cursor: pointer;
}

.product-count {
    position: absolute;
    top: 0;
    right: 0;
    height: 0.8125rem;
    aspect-ratio: 1;
    background-color: red;
    border-radius: 100%;
}

hr {
    margin-top: 10px;
    border-top: 0.5px solid #d3d3d3;
}
</style>
