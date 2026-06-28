<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">Clientes</div>
        <div class="page-subtitle">Gerencie seus clientes cadastrados</div>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo Cliente
      </button>
    </div>
    <div class="page-body">
      <div class="toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input v-model="search" class="search-input" placeholder="Buscar cliente..." />
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Nome</th><th>Telefone</th><th>Veículos</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="6"><div class="loading"><div class="spinner"></div></div></td></tr>
              <tr v-else-if="filtered.length===0"><td colspan="6"><div class="empty-state"><p>Nenhum cliente encontrado</p></div></td></tr>
              <tr v-for="c in filtered" :key="c.id">
                <td>#{{ c.id }}</td>
                <td><strong>{{ c.name }}</strong><div class="text-sm text-muted">{{ c.email }}</div></td>
                <td>{{ c.phone }}</td>
                <td>{{ c._count?.vehicles || 0 }}</td>
                <td><span class="badge" :class="c.status==='ACTIVE'?'badge-active':'badge-inactive'"><span class="badge-dot"></span>{{ c.status==='ACTIVE'?'Ativo':'Inativo' }}</span></td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-icon btn-edit" @click="openModal(c)" title="Editar"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                    <button class="btn btn-icon btn-delete" @click="del(c)" title="Excluir"><svg viewBox="0 0 24 24" fill="white" style="width:14px;height:14px"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <span class="modal-title">{{ form.id ? 'Editar Cliente' : 'Novo Cliente' }}</span>
          <button class="modal-close" @click="showModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Nome *</label><input v-model="form.name" class="form-control" placeholder="Nome completo" /></div>
            <div class="form-group"><label class="form-label">Telefone *</label><input v-model="form.phone" class="form-control" placeholder="(99) 99999-9999" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">E-mail *</label><input v-model="form.email" type="email" class="form-control" /></div>
            <div class="form-group"><label class="form-label">CPF</label><input v-model="form.cpf" class="form-control" placeholder="000.000.000-00" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">{{ form.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha *' }}</label><input v-model="form.password" type="password" class="form-control" :placeholder="form.id?'••••••••':'Senha de acesso ao portal'" /></div>
            <div class="form-group" v-if="form.id"><label class="form-label">Status</label>
              <select v-model="form.status" class="form-control"><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option></select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showModal=false">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const clients = ref([]), loading = ref(true), search = ref('')
const showModal = ref(false), saving = ref(false), error = ref('')
const form = ref({})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return clients.value.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q))
})

const load = async () => { try { const { data } = await api.get('/clients'); clients.value = data } finally { loading.value = false } }

const openModal = (c = null) => {
  form.value = c ? { ...c, password: '' } : { name: '', email: '', phone: '', cpf: '', password: '', status: 'ACTIVE' }
  error.value = ''; showModal.value = true
}

const save = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone) { error.value = 'Preencha os campos obrigatórios'; return }
  saving.value = true; error.value = ''
  try {
    if (form.value.id) await api.put(`/clients/${form.value.id}`, form.value)
    else await api.post('/clients', form.value)
    showModal.value = false; await load()
  } catch (e) { error.value = e.response?.data?.error || 'Erro ao salvar' }
  finally { saving.value = false }
}

const del = async (c) => {
  if (!confirm(`Excluir cliente ${c.name}?`)) return
  await api.delete(`/clients/${c.id}`); await load()
}

onMounted(load)
</script>
