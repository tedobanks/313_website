<script setup></script>

<template>
    <div class="home-container">
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
        <div class="extras"></div>
    </div>
</template>

<style scoped>
.home-container {
    width: 100%;
    height: fit-content;
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
}

.sticky-container {
    position: sticky;
    top: 30%;
    padding: 5px;
    margin-bottom: 40px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sticky-text {
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
    background-color: transparent;
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
    height: 2000px;
    width: 100%;
    background-color: white;
}
</style>
