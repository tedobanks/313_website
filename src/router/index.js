import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoryProducts from '@/views/CategoryProducts.vue'
import ProductDetailsView from '@/views/ProductDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/category/:category',
      name: 'CategoryProducts',
      component: CategoryProducts,
      props: true,
    },
    {
      path: '/category/:category/:id',
      name: 'ProductDetailsView',
      component: ProductDetailsView,
      props: true,
    },
  ]
})

export default router
