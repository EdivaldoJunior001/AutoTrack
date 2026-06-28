<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Ordens de Serviço</div><div class="page-subtitle">Gerencie as ordens de serviço</div></div>
      <button class="btn btn-primary" @click="openModal()">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Nova OS
      </button>
    </div>
    <div class="page-body">
      <div class="toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input v-model="search" class="search-input" placeholder="Buscar por cliente, placa..." />
        </div>
        <select v-model="filterStatus" class="form-control" style="width:160px">
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nº</th><th>Cliente</th><th>Veículo</th><th>Status</th><th>Data</th><th>Total</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
              <tr v-else-if="filtered.length===0"><td colspan="7"><div class="empty-state"><p>Nenhuma OS encontrada</p></div></td></tr>
              <tr v-for="o in filtered" :key="o.id">
                <td><strong>{{ o.orderNumber }}</strong></td>
                <td>{{ o.client.name }}</td>
                <td>{{ o.vehicle.plate }} — {{ o.vehicle.brand }} {{ o.vehicle.model }}</td>
                <td><span class="badge" :class="statusClass(o.status)"><span class="badge-dot"></span>{{ statusLabel(o.status) }}</span></td>
                <td>{{ fmtDate(o.entryDate) }}</td>
                <td>{{ fmt(o.totalValue) }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-icon btn-view" @click="viewOrder(o)" title="Ver detalhes"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></button>
                    <button class="btn btn-icon btn-edit" @click="openModal(o)" title="Editar"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">{{ form.id ? 'Editar OS' : 'Nova Ordem de Serviço' }}</span>
          <button class="modal-close" @click="showModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-row" v-if="!form.id">
            <div class="form-group"><label class="form-label">Cliente *</label>
              <select v-model="form.clientId" class="form-control" @change="loadClientVehicles">
                <option value="">Selecione...</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Veículo *</label>
              <select v-model="form.vehicleId" class="form-control">
                <option value="">Selecione...</option>
                <option v-for="v in clientVehicles" :key="v.id" :value="v.id">{{ v.plate }} — {{ v.brand }} {{ v.model }}</option>
              </select>
            </div>
          </div>
          <div class="form-row" v-if="form.id">
            <div class="form-group"><label class="form-label">Status</label>
              <select v-model="form.status" class="form-control">
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label class="form-label">Observações</label><textarea v-model="form.observations" class="form-control" rows="2"></textarea></div>

          <!-- Services -->
          <div class="items-section">
            <div class="items-header">
              <span class="items-title">Serviços</span>
              <button class="btn btn-sm btn-outline" @click="addService">+ Adicionar</button>
            </div>
            <div v-for="(s,i) in form.services" :key="i" class="item-row item-row-service">
              <input v-model="s.description" class="form-control" placeholder="Descrição do serviço" />
              <input v-model.number="s.unitValue" type="number" class="form-control" placeholder="Valor (R$)" step="0.01" />
              <input v-model.number="s.quantity" type="number" class="form-control" placeholder="Qtd" min="1" />
              <button class="item-remove" @click="form.services.splice(i,1)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </div>
          </div>

          <!-- Parts -->
          <div class="items-section" style="margin-top:20px">
            <div class="items-header">
              <span class="items-title">Peças</span>
              <button class="btn btn-sm btn-outline" @click="addPart">+ Adicionar</button>
            </div>
            <div v-for="(p,i) in form.parts" :key="i" class="item-row item-row-part">
              <input v-model="p.name" class="form-control" placeholder="Nome da peça" />
              <input v-model.number="p.unitValue" type="number" class="form-control" placeholder="Valor (R$)" step="0.01" />
              <input v-model.number="p.quantity" type="number" class="form-control" placeholder="Qtd" min="1" />
              <input v-model.number="p.warrantyMonths" type="number" class="form-control" placeholder="Garantia (meses)" min="0" />
              <button class="item-remove" @click="form.parts.splice(i,1)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </div>
          </div>

          <div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:var(--radius);text-align:right">
            <strong>Total estimado: {{ fmt(calcTotal) }}</strong>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showModal=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal && viewData" class="modal-overlay" @click.self="showViewModal=false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">OS {{ viewData.orderNumber }}</span>
          <button class="modal-close" @click="showViewModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div><div class="detail-label">Cliente</div><div class="detail-value">{{ viewData.client?.name }}</div></div>
            <div><div class="detail-label">Veículo</div><div class="detail-value">{{ viewData.vehicle?.plate }} — {{ viewData.vehicle?.brand }} {{ viewData.vehicle?.model }}</div></div>
            <div><div class="detail-label">Status</div><span class="badge" :class="statusClass(viewData.status)"><span class="badge-dot"></span>{{ statusLabel(viewData.status) }}</span></div>
            <div><div class="detail-label">Técnico</div><div class="detail-value">{{ viewData.user?.name }}</div></div>
            <div><div class="detail-label">Entrada</div><div class="detail-value">{{ fmtDate(viewData.entryDate) }}</div></div>
            <div><div class="detail-label">Conclusão</div><div class="detail-value">{{ viewData.completionDate ? fmtDate(viewData.completionDate) : '—' }}</div></div>
          </div>
          <div v-if="viewData.observations" style="margin:12px 0;padding:10px 14px;background:var(--bg);border-radius:var(--radius);font-size:13.5px">{{ viewData.observations }}</div>

          <div v-if="viewData.services?.length" class="items-section">
            <div class="items-title" style="margin-bottom:8px">Serviços</div>
            <table><thead><tr><th>Descrição</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead>
            <tbody><tr v-for="s in viewData.services" :key="s.id"><td>{{ s.description }}</td><td>{{ s.quantity }}</td><td>{{ fmt(s.unitValue) }}</td><td>{{ fmt(s.totalValue) }}</td></tr></tbody>
            </table>
          </div>

          <div v-if="viewData.parts?.length" class="items-section" style="margin-top:16px">
            <div class="items-title" style="margin-bottom:8px">Peças</div>
            <table><thead><tr><th>Peça</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th><th>Garantia</th></tr></thead>
            <tbody>
              <tr v-for="p in viewData.parts" :key="p.id">
                <td>{{ p.name }}<div v-if="p.partNumber" class="text-sm text-muted">{{ p.partNumber }}</div></td>
                <td>{{ p.quantity }}</td><td>{{ fmt(p.unitValue) }}</td><td>{{ fmt(p.totalValue) }}</td>
                <td>
                  <span v-if="!p.warrantyMonths || p.warrantyMonths===0" class="warranty-none">Sem garantia</span>
                  <span v-else-if="new Date(p.warrantyExpires)>new Date()" class="warranty-ok">✓ {{ p.warrantyMonths }}m (até {{ fmtDate(p.warrantyExpires) }})</span>
                  <span v-else class="warranty-expired">✗ Expirada</span>
                </td>
              </tr>
            </tbody></table>
          </div>
          <div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:var(--radius);text-align:right"><strong>Total: {{ fmt(viewData.totalValue) }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const orders = ref([]), clients = ref([]), clientVehicles = ref([])
const loading = ref(true), search = ref(''), filterStatus = ref('')
const showModal = ref(false), showViewModal = ref(false), saving = ref(false), error = ref('')
const form = ref({ services: [], parts: [] }), viewData = ref(null)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', IN_PROGRESS: 'badge-progress', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[s])

const calcTotal = computed(() => {
  const sv = (form.value.services||[]).reduce((s,i)=>s+(i.unitValue||0)*(i.quantity||1),0)
  const pv = (form.value.parts||[]).reduce((s,i)=>s+(i.unitValue||0)*(i.quantity||1),0)
  return sv+pv
})

const filtered = computed(() => {
  let res = orders.value
  if (filterStatus.value) res = res.filter(o => o.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); res = res.filter(o => o.client.name.toLowerCase().includes(q) || o.vehicle.plate.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q)) }
  return res
})

const load = async () => {
  try {
    const [o, c] = await Promise.all([api.get('/service-orders'), api.get('/clients')])
    orders.value = o.data; clients.value = c.data
  } finally { loading.value = false }
}

const loadClientVehicles = async () => {
  if (!form.value.clientId) { clientVehicles.value = []; return }
  const { data } = await api.get('/vehicles')
  clientVehicles.value = data.filter(v => v.clientId === Number(form.value.clientId) || v.client?.id === Number(form.value.clientId))
}

const openModal = (o = null) => {
  if (o) form.value = { id: o.id, status: o.status, observations: o.observations, services: [], parts: [] }
  else form.value = { clientId: '', vehicleId: '', observations: '', services: [], parts: [] }
  clientVehicles.value = []; error.value = ''; showModal.value = true
}

const viewOrder = async (o) => {
  const { data } = await api.get(`/service-orders/${o.id}`)
  viewData.value = data; showViewModal.value = true
}

const addService = () => form.value.services.push({ description: '', unitValue: 0, quantity: 1 })
const addPart = () => form.value.parts.push({ name: '', unitValue: 0, quantity: 1, warrantyMonths: 0 })

const save = async () => {
  saving.value = true; error.value = ''
  try {
    if (form.value.id) await api.put(`/service-orders/${form.value.id}`, form.value)
    else await api.post('/service-orders', form.value)
    showModal.value = false; await load()
  } catch (e) { error.value = e.response?.data?.error || 'Erro ao salvar' }
  finally { saving.value = false }
}

onMounted(load)
</script>
