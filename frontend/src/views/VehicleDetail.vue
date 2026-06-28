<template>
  <div>
    <div class="page-header">
      <div>
        <RouterLink to="/vehicles" class="back-link">← Veículos</RouterLink>
        <div class="page-title" v-if="vehicle">{{ vehicle.brand }} {{ vehicle.model }} — {{ vehicle.plate }}</div>
      </div>
    </div>
    <div class="page-body" v-if="vehicle">
      <div class="detail-grid" style="margin-bottom:20px">
        <div class="card card-body">
          <div class="detail-label">Informações do Veículo</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
            <div><div class="detail-label">Placa</div><div class="detail-value">{{ vehicle.plate }}</div></div>
            <div><div class="detail-label">Ano</div><div class="detail-value">{{ vehicle.year }}</div></div>
            <div><div class="detail-label">Cor</div><div class="detail-value">{{ vehicle.color || '—' }}</div></div>
            <div><div class="detail-label">KM Atual</div><div class="detail-value">{{ vehicle.mileage?.toLocaleString('pt-BR') || '—' }} km</div></div>
          </div>
        </div>
        <div class="card card-body">
          <div class="detail-label">Cliente</div>
          <div style="margin-top:12px">
            <div class="detail-value" style="font-size:16px">{{ vehicle.client?.name }}</div>
            <div class="text-muted" style="margin-top:4px">{{ vehicle.client?.phone }}</div>
            <div class="text-muted">{{ vehicle.client?.email }}</div>
          </div>
        </div>
      </div>

      <!-- Visits -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">Histórico de Visitas</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>KM</th><th>Motivo</th><th>Observações</th></tr></thead>
            <tbody>
              <tr v-if="!vehicle.visits?.length"><td colspan="4"><div class="empty-state"><p>Nenhuma visita registrada</p></div></td></tr>
              <tr v-for="v in vehicle.visits" :key="v.id">
                <td>{{ fmtDate(v.visitDate) }}</td>
                <td>{{ v.mileage?.toLocaleString('pt-BR') || '—' }} km</td>
                <td>{{ v.reason || '—' }}</td>
                <td>{{ v.observations || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Service Orders -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">Ordens de Serviço</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nº</th><th>Data</th><th>Status</th><th>Técnico</th><th>Total</th></tr></thead>
            <tbody>
              <tr v-if="!vehicle.serviceOrders?.length"><td colspan="5"><div class="empty-state"><p>Nenhuma ordem de serviço</p></div></td></tr>
              <tr v-for="o in vehicle.serviceOrders" :key="o.id">
                <td>{{ o.orderNumber }}</td>
                <td>{{ fmtDate(o.entryDate) }}</td>
                <td><span class="badge" :class="statusClass(o.status)"><span class="badge-dot"></span>{{ statusLabel(o.status) }}</span></td>
                <td>{{ o.user?.name }}</td>
                <td>{{ fmt(o.totalValue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="loading"><div class="spinner"></div>Carregando...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const vehicle = ref(null)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[s])

onMounted(async () => {
  const { data } = await api.get(`/vehicles/${route.params.id}`)
  vehicle.value = data
})
</script>

<style scoped>
.back-link { font-size: 13px; color: var(--text-muted); text-decoration: none; display: block; margin-bottom: 4px; }
.back-link:hover { color: var(--primary); }
</style>
