<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Veículos</div><div class="page-subtitle">Gerencie os veículos cadastrados</div></div>
      <button class="btn btn-primary" @click="openModal()">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo Veículo
      </button>
    </div>
    <div class="page-body">
      <div class="toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input v-model="search" class="search-input" placeholder="Buscar por placa, modelo..." />
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Placa</th><th>Modelo</th><th>Cliente</th><th>Ano</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
              <tr v-else-if="filtered.length===0"><td colspan="7"><div class="empty-state"><p>Nenhum veículo encontrado</p></div></td></tr>
              <tr v-for="v in filtered" :key="v.id">
                <td>#{{ v.id }}</td>
                <td><strong>{{ v.plate }}</strong></td>
                <td>{{ v.brand }} {{ v.model }}</td>
                <td>{{ v.client?.name }}</td>
                <td>{{ v.year }}</td>
                <td><span class="badge" :class="v.status==='ACTIVE'?'badge-active':'badge-inactive'"><span class="badge-dot"></span>{{ v.status==='ACTIVE'?'Ativo':'Inativo' }}</span></td>
                <td>
                  <div class="flex gap-2">
                    <RouterLink :to="`/vehicles/${v.id}`" class="btn btn-icon btn-view" title="Ver detalhes"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></RouterLink>
                    <button class="btn btn-icon btn-edit" @click="openModal(v)" title="Editar"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                    <button class="btn btn-icon" style="background:#6366F1" @click="openVisit(v)" title="Registrar visita"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Vehicle Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <span class="modal-title">{{ form.id ? 'Editar Veículo' : 'Novo Veículo' }}</span>
          <button class="modal-close" @click="showModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Placa *</label><input v-model="form.plate" class="form-control" placeholder="ABC1234" style="text-transform:uppercase" /></div>
            <div class="form-group"><label class="form-label">Cliente *</label>
              <select v-model="form.clientId" class="form-control">
                <option value="">Selecione...</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group"><label class="form-label">Marca *</label><input v-model="form.brand" class="form-control" placeholder="Toyota" /></div>
            <div class="form-group"><label class="form-label">Modelo *</label><input v-model="form.model" class="form-control" placeholder="Corolla" /></div>
            <div class="form-group"><label class="form-label">Ano *</label><input v-model="form.year" type="number" class="form-control" placeholder="2023" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Cor</label><input v-model="form.color" class="form-control" placeholder="Prata" /></div>
            <div class="form-group"><label class="form-label">Quilometragem</label><input v-model="form.mileage" type="number" class="form-control" placeholder="0" /></div>
          </div>
          <div class="form-group"><label class="form-label">Observações</label><textarea v-model="form.observations" class="form-control" rows="2"></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showModal=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>

    <!-- Visit Modal -->
    <div v-if="showVisitModal" class="modal-overlay" @click.self="showVisitModal=false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">Registrar Visita — {{ visitForm.plate }}</span>
          <button class="modal-close" @click="showVisitModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Quilometragem atual</label><input v-model="visitForm.mileage" type="number" class="form-control" /></div>
          <div class="form-group"><label class="form-label">Motivo da visita</label><input v-model="visitForm.reason" class="form-control" placeholder="Troca de óleo, revisão..." /></div>
          <div class="form-group"><label class="form-label">Observações</label><textarea v-model="visitForm.observations" class="form-control" rows="2"></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showVisitModal=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="saveVisit">{{ saving ? 'Registrando...' : 'Registrar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const vehicles = ref([]), clients = ref([]), loading = ref(true), search = ref('')
const showModal = ref(false), showVisitModal = ref(false), saving = ref(false), error = ref('')
const form = ref({}), visitForm = ref({})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return vehicles.value.filter(v =>
    v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.client?.name?.toLowerCase().includes(q)
  )
})

const load = async () => {
  try {
    const [v, c] = await Promise.all([api.get('/vehicles'), api.get('/clients')])
    vehicles.value = v.data; clients.value = c.data
  } finally { loading.value = false }
}

const openModal = (v = null) => {
  form.value = v ? { ...v, clientId: v.clientId || v.client?.id } : { plate: '', brand: '', model: '', year: new Date().getFullYear(), color: '', mileage: '', clientId: '', observations: '' }
  error.value = ''; showModal.value = true
}

const openVisit = (v) => {
  visitForm.value = { vehicleId: v.id, plate: v.plate, mileage: v.mileage || '', reason: '', observations: '' }
  showVisitModal.value = true
}

const save = async () => {
  if (!form.value.plate || !form.value.brand || !form.value.model || !form.value.year || !form.value.clientId) { error.value = 'Preencha todos os campos obrigatórios'; return }
  saving.value = true; error.value = ''
  try {
    if (form.value.id) await api.put(`/vehicles/${form.value.id}`, form.value)
    else await api.post('/vehicles', form.value)
    showModal.value = false; await load()
  } catch (e) { error.value = e.response?.data?.error || 'Erro ao salvar' }
  finally { saving.value = false }
}

const saveVisit = async () => {
  saving.value = true
  try {
    await api.post(`/vehicles/${visitForm.value.vehicleId}/visit`, visitForm.value)
    showVisitModal.value = false; await load()
  } catch (e) { alert('Erro ao registrar visita') }
  finally { saving.value = false }
}

onMounted(load)
</script>
