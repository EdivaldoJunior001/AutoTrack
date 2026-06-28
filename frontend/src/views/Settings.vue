<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Configurações</div><div class="page-subtitle">Gerencie usuários do sistema</div></div>
      <button class="btn btn-primary" @click="openModal()" v-if="auth.isAdmin">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo Usuário
      </button>
    </div>
    <div class="page-body">
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">Meu Perfil</span></div>
        <div class="card-body">
          <div class="detail-grid">
            <div><div class="detail-label">Nome</div><div class="detail-value">{{ auth.user?.name }}</div></div>
            <div><div class="detail-label">E-mail</div><div class="detail-value">{{ auth.user?.email }}</div></div>
            <div><div class="detail-label">Função</div><div class="detail-value">{{ auth.user?.role === 'ADMIN' ? 'Administrador' : 'Mecânico' }}</div></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="auth.isAdmin">
        <div class="card-header"><span class="card-title">Equipe</span></div>
        <div class="card-body">
          <p class="text-muted text-sm">Para criar novos usuários (mecânicos/administradores), utilize o formulário acima. A listagem de equipe pode ser expandida conforme a necessidade do negócio.</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">Novo Usuário</span>
          <button class="modal-close" @click="showModal=false"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>
          <div class="form-group"><label class="form-label">Nome *</label><input v-model="form.name" class="form-control" /></div>
          <div class="form-group"><label class="form-label">E-mail *</label><input v-model="form.email" type="email" class="form-control" /></div>
          <div class="form-group"><label class="form-label">Senha *</label><input v-model="form.password" type="password" class="form-control" /></div>
          <div class="form-group"><label class="form-label">Função</label>
            <select v-model="form.role" class="form-control"><option value="MECHANIC">Mecânico</option><option value="ADMIN">Administrador</option></select>
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
import { ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const showModal = ref(false), saving = ref(false), error = ref(''), success = ref('')
const form = ref({ name: '', email: '', password: '', role: 'MECHANIC' })

const openModal = () => { form.value = { name: '', email: '', password: '', role: 'MECHANIC' }; error.value=''; success.value=''; showModal.value = true }

const save = async () => {
  if (!form.value.name || !form.value.email || !form.value.password) { error.value = 'Preencha todos os campos'; return }
  saving.value = true; error.value = ''
  try {
    await api.post('/auth/register', form.value)
    success.value = 'Usuário criado com sucesso!'
    setTimeout(() => { showModal.value = false }, 1200)
  } catch (e) { error.value = e.response?.data?.error || 'Erro ao criar usuário' }
  finally { saving.value = false }
}
</script>
