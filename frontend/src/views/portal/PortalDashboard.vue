<template>
  <div class="page-body" style="max-width:1100px;margin:0 auto">
    <div class="section-title">Olá, {{ profile?.name?.split(' ')[0] }} 👋</div>
    <p class="text-muted mb-4">Aqui está um resumo da sua conta na AutoTrack.</p>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card">
          <div class="stat-label">Veículos cadastrados</div>
          <div class="stat-value">{{ profile?._count?.vehicles || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Ordens de serviço</div>
          <div class="stat-value">{{ profile?._count?.serviceOrders || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Orçamentos pendentes</div>
          <div class="stat-value">{{ pendingBudgets }}</div>
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-header"><span class="card-title">Últimos serviços</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nº</th><th>Veículo</th><th>Data</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              <tr v-if="!orders.length"><td colspan="5"><div class="empty-state"><p>Nenhuma ordem de serviço ainda</p></div></td></tr>
              <tr v-for="o in orders.slice(0,5)" :key="o.id">
                <td>{{ o.orderNumber }}</td>
                <td>{{ o.vehicle.plate }} — {{ o.vehicle.model }}</td>
                <td>{{ fmtDate(o.entryDate) }}</td>
                <td><span class="badge" :class="statusClass(o.status)"><span class="badge-dot"></span>{{ statusLabel(o.status) }}</span></td>
                <td>{{ fmt(o.totalValue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { portalApi } from '../../services/api'

const profile = ref(null), orders = ref([]), budgets = ref([]), loading = ref(true)
const pendingBudgets = computed(() => budgets.value.filter(b => b.status === 'PENDING').length)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[s])

onMounted(async () => {
  try {
    const [p, o, b] = await Promise.all([portalApi.get('/me'), portalApi.get('/service-orders'), portalApi.get('/budgets')])
    profile.value = p.data; orders.value = o.data; budgets.value = b.data
  } finally { loading.value = false }
})
</script>
