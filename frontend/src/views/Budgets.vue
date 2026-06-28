<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Orçamentos</div><div class="page-subtitle">Gerencie os orçamentos enviados aos clientes</div></div>
      <button class="btn btn-primary" @click="openModal()">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo Orçamento
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
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Rejeitado</option>
          <option value="EXPIRED">Expirado</option>
        </select>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nº</th><th>Cliente</th><th>Veículo</th><th>Status</th><th>Validade</th><th>Total</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
              <tr v-else-if="filtered.length===0"><td colspan="7"><div class="empty-state"><p>Nenhum orçamento encontrado</p></div></td></tr>
              <tr v-for="b in filtered" :key="b.id">
                <td><strong>{{ b.budgetNumber }}</strong></td>
                <td>{{ b.client.name }}</td>
                <td>{{ b.vehicle.plate }} — {{ b.vehicle.brand }} {{ b.vehicle.model }}</td>
                <td><span class="badge" :class="statusClass(b.status)"><span class="badge-dot"></span>{{ statusLabel(b.status) }}</span></td>
                <td>{{ b.validUntil ? fmtDate(b.validUntil) : '—' }}</td>
                <td>{{ fmt(b.totalValue) }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-icon btn-view" @click="viewBudget(b)" title="Ver detalhes"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></button>
                    <button class="btn btn-icon btn-success" v-if="b.status==='PENDING'" @click="setStatus(b,'APPROVED')" title="Aprovar"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></button>
                    <button class="btn btn-icon btn-delete" v-if="b.status==='PENDING'" @click="setStatus(b,'REJECTED')" title="Rejeitar"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">Novo Orçamento</span>
          <button class="modal-close" @click="showModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-row">
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
          <div class="form-row">
            <div class="form-group"><label class="form-label">Válido até</label><input v-model="form.validUntil" type="date" class="form-control" /></div>
          </div>
          <div class="form-group"><label class="form-label">Observações</label><textarea v-model="form.observations" class="form-control" rows="2"></textarea></div>

          <div class="items-section">
            <div class="items-header"><span class="items-title">Serviços</span><button class="btn btn-sm btn-outline" @click="addService">+ Adicionar</button></div>
            <div v-for="(s,i) in form.services" :key="i" class="item-row item-row-service">
              <input v-model="s.description" class="form-control" placeholder="Descrição do serviço" />
              <input v-model.number="s.unitValue" type="number" class="form-control" placeholder="Valor (R$)" step="0.01" />
              <input v-model.number="s.quantity" type="number" class="form-control" placeholder="Qtd" min="1" />
              <button class="item-remove" @click="form.services.splice(i,1)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </div>
          </div>

          <div class="items-section" style="margin-top:20px">
            <div class="items-header"><span class="items-title">Peças</span><button class="btn btn-sm btn-outline" @click="addPart">+ Adicionar</button></div>
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
          <span class="modal-title">Orçamento {{ viewData.budgetNumber }}</span>
          <button class="modal-close" @click="showViewModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div><div class="detail-label">Cliente</div><div class="detail-value">{{ viewData.client?.name }}</div></div>
            <div><div class="detail-label">Veículo</div><div class="detail-value">{{ viewData.vehicle?.plate }} — {{ viewData.vehicle?.brand }} {{ viewData.vehicle?.model }}</div></div>
            <div><div class="detail-label">Status</div><span class="badge" :class="statusClass(viewData.status)"><span class="badge-dot"></span>{{ statusLabel(viewData.status) }}</span></div>
            <div><div class="detail-label">Válido até</div><div class="detail-value">{{ viewData.validUntil ? fmtDate(viewData.validUntil) : '—' }}</div></div>
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
                <td>{{ p.name }}</td><td>{{ p.quantity }}</td><td>{{ fmt(p.unitValue) }}</td><td>{{ fmt(p.totalValue) }}</td>
                <td><span v-if="p.warrantyMonths">{{ p.warrantyMonths }} meses</span><span v-else class="warranty-none">Sem garantia</span></td>
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

const budgets = ref([]), clients = ref([]), clientVehicles = ref([])
const loading = ref(true), search = ref(''), filterStatus = ref('')
const showModal = ref(false), showViewModal = ref(false), saving = ref(false), error = ref('')
const form = ref({ services: [], parts: [] }), viewData = ref(null)

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR')
const statusClass = s => ({ PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', EXPIRED: 'badge-inactive' }[s])
const statusLabel = s => ({ PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado', EXPIRED: 'Expirado' }[s])

const calcTotal = computed(() => {
  const sv = (form.value.services||[]).reduce((s,i)=>s+(i.unitValue||0)*(i.quantity||1),0)
  const pv = (form.value.parts||[]).reduce((s,i)=>s+(i.unitValue||0)*(i.quantity||1),0)
  return sv+pv
})

const filtered = computed(() => {
  let res = budgets.value
  if (filterStatus.value) res = res.filter(b => b.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); res = res.filter(b => b.client.name.toLowerCase().includes(q) || b.vehicle.plate.toLowerCase().includes(q) || b.budgetNumber.toLowerCase().includes(q)) }
  return res
})

const load = async () => {
  try {
    const [b, c] = await Promise.all([api.get('/budgets'), api.get('/clients')])
    budgets.value = b.data; clients.value = c.data
  } finally { loading.value = false }
}

const loadClientVehicles = async () => {
  if (!form.value.clientId) { clientVehicles.value = []; return }
  const { data } = await api.get('/vehicles')
  clientVehicles.value = data.filter(v => v.clientId === Number(form.value.clientId) || v.client?.id === Number(form.value.clientId))
}

const openModal = () => {
  form.value = { clientId: '', vehicleId: '', validUntil: '', observations: '', services: [], parts: [] }
  clientVehicles.value = []; error.value = ''; showModal.value = true
}

const viewBudget = async (b) => {
  const { data } = await api.get(`/budgets/${b.id}`)
  viewData.value = data; showViewModal.value = true
}

const setStatus = async (b, status) => {
  await api.put(`/budgets/${b.id}`, { status })
  await load()
}

const addService = () => form.value.services.push({ description: '', unitValue: 0, quantity: 1 })
const addPart = () => form.value.parts.push({ name: '', unitValue: 0, quantity: 1, warrantyMonths: 0 })

const save = async () => {
  if (!form.value.clientId || !form.value.vehicleId) { error.value = 'Selecione cliente e veículo'; return }
  saving.value = true; error.value = ''
  try {
    await api.post('/budgets', form.value)
    showModal.value = false; await load()
  } catch (e) { error.value = e.response?.data?.error || 'Erro ao salvar' }
  finally { saving.value = false }
}

onMounted(load)
</script>
