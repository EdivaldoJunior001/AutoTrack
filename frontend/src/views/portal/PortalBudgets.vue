<template>
  <div class="page-body" style="max-width:1100px;margin:0 auto">
    <div class="section-title">Meus Orçamentos</div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="!budgets.length" class="empty-state"><p>Nenhum orçamento disponível</p></div>
    <div v-else class="timeline">
      <div v-for="b in budgets" :key="b.id" class="card">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div style="font-weight:700;font-size:15px">{{ b.budgetNumber }}</div>
              <div class="text-muted text-sm">{{ b.vehicle.plate }} — {{ b.vehicle.brand }} {{ b.vehicle.model }}</div>
            </div>
            <span class="badge" :class="statusClass(b.status)"><span class="badge-dot"></span>{{ statusLabel(b.status) }}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            <div><div class="detail-label">Criado em</div><div class="detail-value">{{ fmtDate(b.createdAt) }}</div></div>
            <div><div class="detail-label">Válido até</div><div class="detail-value">{{ b.validUntil ? fmtDate(b.validUntil) : '—' }}</div></div>
          </div>
          <div v-if="b.observations" class="obs-box">{{ b.observations }}</div>

          <div v-if="b.services?.length" class="items-section">
            <div class="items-title" style="margin-bottom:8px">Serviços propostos</div>
            <ul class="service-list">
              <li v-for="s in b.services" :key="s.id">{{ s.description }} <span class="text-muted">({{ fmt(s.totalValue) }})</span></li>
            </ul>
          </div>

          <div v-if="b.parts?.length" class="items-section" style="margin-top:14px">
            <div class="items-title" style="margin-bottom:8px">Peças propostas</div>
            <ul class="service-list">
              <li v-for="p in b.parts" :key="p.id">{{ p.name }} ({{ p.quantity }}x) <span class="text-muted">({{ fmt(p.totalValue) }})</span></li>
            </ul>
          </div>

          <div class="total-bar">Total estimado: <strong>{{ fmt(b.totalValue) }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { portalApi } from '../../services/api'

const budgets = ref([]), loading = ref(true)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', EXPIRED: 'badge-inactive' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado', EXPIRED: 'Expirado' }[s])

onMounted(async () => {
  try { const { data } = await portalApi.get('/budgets'); budgets.value = data }
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
