<template>
  <div>
    <header class="portal-header">
      <div class="flex items-center gap-3">
        <div class="logo-icon" style="width:32px;height:32px">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
        </div>
        <span style="color:white;font-weight:700">AutoTrack</span>
      </div>
      <nav class="portal-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button class="portal-nav-item" :class="{ active: isActive }" @click="navigate">{{ item.label }}</button>
        </RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <span style="color:rgba(255,255,255,0.7);font-size:13px">{{ client?.name }}</span>
        <button class="logout-btn" @click="logout" title="Sair">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const client = ref(JSON.parse(localStorage.getItem('clientUser') || 'null'))

const navItems = [
  { to: '/portal/dashboard', label: 'Início' },
  { to: '/portal/vehicles', label: 'Meus Veículos' },
  { to: '/portal/service-orders', label: 'Serviços' },
  { to: '/portal/budgets', label: 'Orçamentos' },
]

const logout = () => {
  localStorage.removeItem('clientToken'); localStorage.removeItem('clientUser')
  router.push('/portal/login')
}
</script>
