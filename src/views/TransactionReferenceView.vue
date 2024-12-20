<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categoryProductStore";
import Header from "@/components/Header.vue";
import emailjs from "@emailjs/browser";
import Footer from "@/components/Footer.vue";

const categoryStore = useCategoryStore();

const isLoading = ref(true); // Tracks the loading state
const isError = ref(false); // Tracks if there was an error
const isSuccessful = ref(false);

const transactionStatus = ref(null);
const errorMessage = ref(null);

const route = useRoute();
const router = useRouter();

const deliveryDetails = computed(() => categoryStore.deliveryDetails);

const goToHome = () => {
    router.push("/");
};

const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const sendMerchantConfirmation = async (order) => {
    try {
        const templateParams = {
            to_name: order.customerName,
            to_email: order.customerEmail,
            from_name: "313 Eleganto",
            order_number: order.orderNumber,
            order_date: new Date().toLocaleDateString(),
            shipping_address: order.shippingAddress,
            delivery_date: getEstimatedDeliveryDate(),
            tracking_link: order.trackingUrl || "Will be provided once shipped",
            support_email: "313eleganto@gmail.com",
            total_amount: order.totalAmount.toFixed(2),
        };

        await emailjs.send(
            import.meta.env.VITE_EMAILJS_MERCHANT_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_MERCHANT_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_MERCHANT_PUBLIC_KEY
        );

        console.log("Order confirmation email sent successfully!");
    } catch (error) {
        console.error("Failed to send order confirmation:", error);
    }
};

const sendVendorNotification = async (order) => {
    try {
        // Format the items list for the email
        const itemsList = categoryStore.shoppingBag
            .map(
                (item) =>
                    `- ${item.product.name} - Size: ${item.size} - Color: ${
                        item.color
                    } - Quantity: ${item.quantity} - Price: ₦${(
                        item.product.price * item.quantity
                    ).toLocaleString()}`
            )
            .join("\n");

        const templateParams = {
            order_number: order.orderNumber,
            order_date: new Date().toLocaleDateString(),
            items_list: itemsList,
            total_amount: `₦${order.totalAmount.toLocaleString()}`,
            shipping_address: order.shippingAddress,
            delivery_date: getEstimatedDeliveryDate(),
        };

        await emailjs.send(
            import.meta.env.VITE_EMAILJS_MERCHANT_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_MERCHANT_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_MERCHANT_PUBLIC_KEY
        );

        console.log("Vendor notification sent successfully!");
    } catch (error) {
        console.error("Failed to send vendor notification:", error);
    }
};

const sendOrderConfirmation = async (order) => {
    try {
        const templateParams = {
            to_name: order.customerName,
            to_email: order.customerEmail,
            from_name: "313 Eleganto",
            order_number: order.orderNumber,
            order_date: new Date().toLocaleDateString(),
            shipping_address: order.shippingAddress,
            delivery_date: getEstimatedDeliveryDate(),
            tracking_link: order.trackingUrl || "Will be provided once shipped",
            support_email: "313eleganto@gmail.com",
            total_amount: order.totalAmount.toFixed(2),
        };

        await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log("Order confirmation email sent successfully!");
    } catch (error) {
        console.error("Failed to send order confirmation:", error);
    }
};

// Example usage remains the same
const handleOrderSuccess = async () => {
    console.log(
        "Initial emailSent state:",
        categoryStore.orderStatus.emailSent
    );

    if (categoryStore.orderStatus.emailSent) {
        console.log("Email already sent for this order");
        return;
    }

    const order = {
        customerName: deliveryDetails.value.recipientName,
        customerEmail: deliveryDetails.value.recipientEmail,
        orderNumber: "ORD-" + Date.now(),
        order_date: new Date().toLocaleDateString(),
        totalAmount: deliveryDetails.value.orderTotal,
        shippingAddress: `${deliveryDetails.value.recipientAddress}, ${deliveryDetails.value.recipientArea}`,
        trackingUrl: "https://tracking.313eleganto.com/ABC123", // Replace with your actual tracking URL or null
        // These are set in sendOrderConfirmation but you can override them here if needed
        // delivery_date: customDeliveryDate,
        // support_email: "custom@313eleganto.com"
    };

    try {
        await sendOrderConfirmation(order);
        await sendVendorNotification(order);
        // Mark email as sent in store
        categoryStore.setOrderEmailStatus(true);
    } catch (error) {
        console.error("Failed to process order:", error);
    }
};

const verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${
                        import.meta.env.VITE_PAYSTACK_TEST_SECRET_KEY
                    }`,
                },
            }
        );

        const status = response.data.data.status;

        if (status === "success") {
            transactionStatus.value = "Payment Successful!";
            if (!categoryStore.orderStatus.emailSent) {
                await handleOrderSuccess();
                categoryStore.clearShoppingBag();
            }
            isLoading.value = false;
            console.log("Payment Details:", response.data.data);

            console.log("Starting timeout");
            await new Promise((resolve) => {
                console.log("Inside timeout promise");
                setTimeout(() => {
                    console.log("Timeout completed");
                    resolve();
                }, 3000);
            });

            console.log("navigation time");
            await router.push("/");
            console.log("Navigation completed");
        } else {
            transactionStatus.value = "Payment Failed!";
            console.error("Payment not successful:", response.data.data);
        }
    } catch (error) {
        transactionStatus.value = "Error verifying transaction!";
        errorMessage.value = error.message;
        console.error("Transaction verification failed", error);
    }
};

onMounted(() => {
    console.log(deliveryDetails.value);

    const reference = route.query.reference;

    if (reference) {
        verifyTransaction(reference);
    } else {
        transactionStatus.value = "No transaction reference found!";
        console.error("No reference in the query parameters");
    }
});

onUnmounted(() => {
    // Only clear if navigating away from reference page (not on reload)
    if (!window.location.href.includes("reference")) {
        categoryStore.clearOrderStatus();
    }
});
</script>

<template>
    <div class="reference-container">
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
            <p>Error Occured</p>
        </div>

        <div class="main-reference">
            <Header />
            <div class="confirmation-box">
                <h2>Thank you for shopping with us!</h2>
                <h3>You would receive a confirmation email shortly.</h3>
                <button class="return-home lato-700" @click="goToHome">
                    Return Home
                </button>
            </div>
            <Footer />
        </div>
    </div>
</template>

<style scoped>
.reference-container {
    width: 100%;
    height: 100%;
}

.main-reference {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.confirmation-box {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.confirmation-box h2 {
    font-weight: 700;
    font-size: 2.5rem;
    margin-bottom: 0.625rem;
}

.confirmation-box h3 {
    margin-bottom: 1.25rem;
}

.return-home {
    width: 18.75rem;
    height: 3.125rem;
    border: 2px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    font-size: 1.125rem;
}

/* Loading and error message styles */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
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
    .confirmation-box h2 {
        font-weight: 700;
        font-size: 1.125rem;
        margin-bottom: 0.625rem;
    }

    .confirmation-box h3 {
        font-size: 0.875rem;
        margin-bottom: 0.875rem;
    }

    .return-home {
        width: 18.75rem;
        height: 3.125rem;
        border: 2px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background-color: transparent;
        font-size: 1.125rem;
    }
}
</style>
