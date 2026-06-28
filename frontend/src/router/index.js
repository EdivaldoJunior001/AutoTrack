// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
        { path: 'clients', component: () => import('../views/Clients.vue') },
        { path: 'vehicles', component: () => import('../views/Vehicles.vue') },
        { path: 'vehicles/:id', component: () => import('../views/VehicleDetail.vue') },
        { path: 'service-orders', component: () => import('../views/ServiceOrders.vue') },
        { path: 'budgets', component: () => import('../views/Budgets.vue') },
        { path: 'settings', component: () => import('../views/Settings.vue') },
      ]
    },
    // Client portal
    { path: '/portal/login', component: () => import('../views/portal/PortalLogin.vue'), meta: { public: true } },
    { path: '/portal', component: () => import('../views/portal/PortalLayout.vue'), meta: { requiresClientAuth: true },
      children: [
        { path: '', redirect: '/portal/dashboard' },
        { path: 'dashboard', component: () => import('../views/portal/PortalDashboard.vue') },
        { path: 'vehicles', component: () => import('../views/portal/PortalVehicles.vue') },
        { path: 'service-orders', component: () => import('../views/portal/PortalServiceOrders.vue') },
        { path: 'budgets', component: () => import('../views/portal/PortalBudgets.vue') },
      ]
    }
  ]
})

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) return next('/login')
  if (to.meta.requiresClientAuth && !localStorage.getItem('clientToken')) return next('/portal/login')
  if (to.path === '/login' && localStorage.getItem('token')) return next('/dashboard')
  if (to.path === '/portal/login' && localStorage.getItem('clientToken')) return next('/portal/dashboard')
  next()
})

export default router
