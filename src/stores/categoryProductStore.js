import { defineStore } from "pinia";
import { getAllCategoriesFromFirestore, getAllProductsFromFirestore } from "@/firebase/firebaseConfig";

export const useCategoryStore = defineStore("categoryProductStore", {
    state: () => ({
        productsByCategory: null, // Map of categories and their products
        categories: [], // Array of categories
        products: [], // Array of products
    }),
    actions: {
        async fetchCategories() {
            try {
                const categories = await getAllCategoriesFromFirestore();
                this.categories = categories;
                this.updateProductsByCategory(); // Update map when categories are fetched
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },
        async fetchProducts() {
            try {
                const products = await getAllProductsFromFirestore();
                this.products = products;
                this.updateProductsByCategory(); // Update map when products are fetched
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        },
        updateProductsByCategory() {
            const map = new Map();

            if (this.categories.length && this.products.length) {
                this.categories.forEach((category) => {
                    map.set(category.id, {
                        categoryName: category.name,
                        categoryImage: category.imageUrls,
                        categoryProducts: this.products.filter(
                            (product) => product.category === category.id
                        ),
                    });
                });
            }

            this.productsByCategory = map;
        },

        /**
         * Get details of a specific product by its ID.
         * @param {string} productId - The ID of the product to retrieve.
         * @returns {object|null} The product data or null if not found.
         */
        getProductById(productId) {
            const product = this.products.find((p) => p.id === productId);
            if (!product) {
                console.error(`Product with ID ${productId} not found.`);
                return null;
            }
            return product;
        },
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: "categoryProductStore",
                storage: localStorage,
            },
        ],
    },
});
