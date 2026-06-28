<template>
  <div class="page-body" style="max-width:1100px;margin:0 auto">
    <div class="section-title">Meus Veículos</div>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="!vehicles.length" class="empty-state"><p>Nenhum veículo cadastrado</p><span>Entre em contato com a oficina para cadastrar seu veículo.</span></div>
    <div v-else class="vehicles-grid">
      <div v-for="v in vehicles" :key="v.id" class="card vehicle-card">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div style="font-size:16px;font-weight:700">{{ v.brand }} {{ v.model }}</div>
              <div class="text-muted text-sm">{{ v.plate }} · {{ v.year }}</div>
            </div>
            <span class="badge" :class="v.status==='ACTIVE'?'badge-active':'badge-inactive'"><span class="badge-dot"></span>{{ v.status==='ACTIVE'?'Ativo':'Inativo' }}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            <div><div class="detail-label">Cor</div><div class="detail-value">{{ v.color || '—' }}</div></div>
            <div><div class="detail-label">KM atual</div><div class="detail-value">{{ v.mileage?.toLocaleString('pt-BR') || '—' }}</div></div>
          </div>
          <div class="detail-label" style="margin-bottom:8px">Últimas visitas</div>
          <div v-if="!v.visits?.length" class="text-sm text-muted">Nenhuma visita registrada</div>
          <div v-for="visit in v.visits" :key="visit.id" class="visit-row">
            <span>{{ fmtDate(visit.visitDate) }}</span>
            <span class="text-muted">{{ visit.reason || 'Visita' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { portalApi } from '../../services/api'

const vehicles = ref([]), loading = ref(true)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')

onMounted(async () => {
  try { const { data } = await portalApi.get('/vehicles'); vehicles.value = data }
  finally { loading.value = false }
})
</script>

<style scoped>
.vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.visit-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-top: 1px solid var(--border); }
</style>
