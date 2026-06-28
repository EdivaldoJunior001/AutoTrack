<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Visão geral do mês</div>
      </div>
    </div>
    <div class="page-body">
      <div v-if="loading" class="loading"><div class="spinner"></div>Carregando...</div>
      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Ordens de Serviço em aberto</div>
            <div class="stat-value">{{ stats.openOrders }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Concluídas do mês</div>
            <div class="stat-value">{{ stats.completedThisMonth }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Faturamento (mês)</div>
            <div class="stat-value green">{{ fmt(stats.monthRevenue) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">A receber</div>
            <div class="stat-value">{{ fmt(stats.pendingRevenue) }}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Ordens em andamento</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>ID</th><th>Nome</th><th>Veículo</th><th>Serviço</th><th>Status</th>
              </tr></thead>
              <tbody>
                <tr v-if="stats.recentOrders?.length === 0"><td colspan="5"><div class="empty-state"><p>Nenhuma ordem recente</p></div></td></tr>
                <tr v-for="o in stats.recentOrders" :key="o.id">
                  <td><strong>#{{ o.id }}</strong></td>
                  <td>{{ o.client.name }}</td>
                  <td>{{ o.vehicle.brand }} {{ o.vehicle.model }}</td>
                  <td>{{ o.services?.[0]?.description || '—' }}</td>
                  <td><span class="badge" :class="statusClass(o.status)"><span class="badge-dot"></span>{{ statusLabel(o.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const stats = ref({ openOrders: 0, completedThisMonth: 0, monthRevenue: 0, pendingRevenue: 0, recentOrders: [] })
const loading = ref(true)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const statusClass = s => ({ PENDING: 'badge-warning', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s] || 'badge-info')
const statusLabel = s => ({ PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[s] || s)

onMounted(async () => {
  try { const { data } = await api.get('/dashboard'); stats.value = data }
  finally { loading.value = false }
})
</script>
