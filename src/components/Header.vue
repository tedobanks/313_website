<template>
    <div class="header-wrapper">
        <section class="header">
            <img src="/images/313-loader.png" alt="logo" class="header-logo" />
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
    justify-content: center;
}

.header-logo {
    height: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

hr {
    margin-top: 10px;
    border-top: 0.5px solid #d3d3d3;
}
</style>
