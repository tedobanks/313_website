<script setup>
import { computed } from "vue";

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
    <div class="footer-wrapper">
        <section class="footer">
            <p>Copyright &copy; {{ currentYear }} 313 Eleganto</p>
        </section>
    </div>
</template>

<style scoped>
.footer-wrapper {
    width: 100%;
}

.footer {
    height: 6.25rem;
    width: 100%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 1.25rem;
}

.footer p {
    font-weight: 700;
}
</style>
