import { defineStore } from "pinia";
import { getAllCategoriesFromFirestore, getAllProductsFromFirestore } from "@/firebase/firebaseConfig";

export const useCategoryStore = defineStore("categoryProductStore", {
    state: () => ({
        productsByCategory: {}, // Map of categories and their products
        categories: [], // Array of categories
        products: [], // Array of products
        shoppingBag: [],
        deliveryDetails: {
            recipientName: '',
            recipientEmail: '',
            recipientPhone: '',
            recipientAddress: '',
            recipientArea: '',
            deliveryFee: 0,
            orderTotal: 0,
            orderNumber: ''
        },
        orderStatus: {
            emailSent: false,
            paymentConfirmed: false
        }
    }),
    actions: {
        async fetchCategories() {
            try {
                const categories = await getAllCategoriesFromFirestore();
                this.categories = categories;
                this.updateProductsByCategory();
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },
        async fetchProducts() {
            try {
                const products = await getAllProductsFromFirestore();
                this.products = products;
                this.updateProductsByCategory();
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        },
        updateProductsByCategory() {
            const map = {};

            if (this.categories.length && this.products.length) {
                this.categories.forEach((category) => {
                    map[category.id] = {
                        categoryName: category.name,
                        categoryImage: category.imageUrls,
                        categoryProducts: this.products.filter(
                            (product) => product.category === category.id
                        ),
                    };
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

        // addToShoppingBag(product) {
        //     this.shoppingBag.push(product)
        //     console.log("shopping bag has: ", this.shoppingBag)
        // },

        // removeFromShoppingBag(product) {

        // }

        /**
     * Add a product to the shopping bag.
     * If the product with the same variations already exists, increase the quantity.
     * @param {object} product - The product object.
     * @param {string} color - The selected color.
     * @param {string} size - The selected size.
     * @param {number} quantity - The quantity to add (default 1).
     */
        addToShoppingBag(product, color, size, quantity = 1) {
            if (!product || !product.id) {
                console.warn('Product or product.id is undefined', product);
                return;
            }

            const existingItem = this.shoppingBag.find((item) => {
                if (!item.product || !item.product.id) {
                    console.warn('Item in shoppingBag has undefined product or product.id', item);
                    return false;
                }
                return (
                    item.product.id === product.id &&
                    item.color === color &&
                    item.size === size
                );
            });

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.shoppingBag.push({
                    product: product,
                    color: color,
                    size: size,
                    quantity: quantity,
                });
            }
            console.log('Shopping bag has:', this.shoppingBag);
        },


        /**
     * Remove a product from the shopping bag.
     * Decrease the quantity or remove it if quantity reaches 0.
     * @param {object} product - The product object.
     * @param {string} color - The selected color.
     * @param {string} size - The selected size.
     * @param {number} quantity - The quantity to remove (default 1).
     */
        removeFromShoppingBag(product, color, size, quantity = 1) {
            if (!product || !product.id) {
                console.warn('Product or product.id is undefined', product);
                return;
            }

            const existingItemIndex = this.shoppingBag.findIndex((item) => {
                if (!item.product || !item.product.id) {
                    console.warn('Item in shoppingBag has undefined product or product.id', item);
                    return false;
                }
                return (
                    item.product.id === product.id &&
                    item.color === color &&
                    item.size === size
                );
            });

            if (existingItemIndex !== -1) {
                const existingItem = this.shoppingBag[existingItemIndex];
                existingItem.quantity -= quantity;
                if (existingItem.quantity <= 0) {
                    this.shoppingBag.splice(existingItemIndex, 1);
                }
            }
        },


        /**
         * Get the quantity of a specific product variation in the shopping bag.
         * @param {object} product - The product object.
         * @param {string} color - The selected color.
         * @param {string} size - The selected size.
         * @returns {number} - The quantity in the shopping bag.
         */
        getProductQuantityInBag(product, color, size) {
            if (!product || !product.id) {
                console.warn('Product or product.id is undefined', product);
                return 0;
            }

            const existingItem = this.shoppingBag.find((item) => {
                if (!item.product || !item.product.id) {
                    console.warn('Item in shoppingBag has undefined product or product.id', item);
                    return false;
                }
                return (
                    item.product.id === product.id &&
                    item.color === color &&
                    item.size === size
                );
            });
            return existingItem ? existingItem.quantity : 0;
        },

        clearShoppingBag() {
            this.shoppingBag = [];
            console.log('Shopping bag cleared:', this.shoppingBag);
        },

        setDeliveryDetails(details) {
            this.deliveryDetails = {
                ...this.deliveryDetails,
                ...details
            };
        },

        setOrderEmailStatus(status) {
            this.orderStatus = {
                emailSent: status,
                paymentConfirmed: true
            };
        },

        clearOrderStatus() {
            this.orderStatus = {
                emailSent: false,
                paymentConfirmed: false
            };
        }

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
