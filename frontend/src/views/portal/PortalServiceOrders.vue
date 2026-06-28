<template>
  <div class="page-body" style="max-width:1100px;margin:0 auto">
    <div class="section-title">Histórico de Serviços</div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="!orders.length" class="empty-state"><p>Nenhum serviço realizado ainda</p></div>
    <div v-else class="timeline">
      <div v-for="o in orders" :key="o.id" class="order-card card">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div style="font-weight:700;font-size:15px">{{ o.orderNumber }}</div>
              <div class="text-muted text-sm">{{ o.vehicle.plate }} — {{ o.vehicle.brand }} {{ o.vehicle.model }} ({{ o.vehicle.year }})</div>
            </div>
            <span class="badge" :class="statusClass(o.status)"><span class="badge-dot"></span>{{ statusLabel(o.status) }}</span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
            <div><div class="detail-label">Entrada</div><div class="detail-value">{{ fmtDate(o.entryDate) }}</div></div>
            <div><div class="detail-label">Conclusão</div><div class="detail-value">{{ o.completionDate ? fmtDate(o.completionDate) : '—' }}</div></div>
            <div><div class="detail-label">Responsável</div><div class="detail-value">{{ o.user?.name }}</div></div>
          </div>

          <div v-if="o.observations" class="obs-box">{{ o.observations }}</div>

          <div v-if="o.services?.length" class="items-section">
            <div class="items-title" style="margin-bottom:8px">O que foi feito</div>
            <ul class="service-list">
              <li v-for="s in o.services" :key="s.id">{{ s.description }} <span class="text-muted">({{ fmt(s.totalValue) }})</span></li>
            </ul>
          </div>

          <div v-if="o.parts?.length" class="items-section" style="margin-top:14px">
            <div class="items-title" style="margin-bottom:8px">Peças trocadas</div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Peça</th><th>Qtd</th><th>Valor</th><th>Garantia</th></tr></thead>
                <tbody>
                  <tr v-for="p in o.parts" :key="p.id">
                    <td>{{ p.name }}<div v-if="p.partNumber" class="text-sm text-muted">Cód: {{ p.partNumber }}</div></td>
                    <td>{{ p.quantity }}</td>
                    <td>{{ fmt(p.totalValue) }}</td>
                    <td>
                      <span v-if="!p.warrantyMonths || p.warrantyMonths===0" class="warranty-none">Sem garantia</span>
                      <span v-else-if="isWarrantyValid(p.warrantyExpires)" class="warranty-ok">✓ Válida até {{ fmtDate(p.warrantyExpires) }}</span>
                      <span v-else class="warranty-expired">✗ Expirada em {{ fmtDate(p.warrantyExpires) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="total-bar">Total: <strong>{{ fmt(o.totalValue) }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { portalApi } from '../../services/api'

const orders = ref([]), loading = ref(true)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[s])
const isWarrantyValid = (date) => new Date(date) > new Date()

onMounted(async () => {
  try { const { data } = await portalApi.get('/service-orders'); orders.value = data }
  finally { loading.value = false }
})
</script>

<style scoped>
.timeline { display: flex; flex-direction: column; gap: 16px; }
.obs-box { background: var(--bg); padding: 10px 14px; border-radius: var(--radius); font-size: 13.5px; margin-bottom: 14px; }
.service-list { list-style: none; padding: 0; font-size: 13.5px; }
.service-list li { padding: 6px 0; border-top: 1px solid var(--border); }
.service-list li:first-child { border-top: none; }
.total-bar { margin-top: 16px; padding: 10px 14px; background: var(--bg); border-radius: var(--radius); text-align: right; font-size: 14px; }
</style>
