<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
        </div>
        <span>AutoTrack</span>
      </div>
      <h1>Bem-vindo de volta</h1>
      <p class="login-sub">Sistema para gestão de oficinas</p>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div class="form-group">
        <label class="form-label">E-mail</label>
        <input v-model="email" type="email" class="form-control" placeholder="seu@email.com" @keyup.enter="submit" />
      </div>
      <div class="form-group">
        <label class="form-label">Senha</label>
        <input v-model="password" type="password" class="form-control" placeholder="••••••••" @keyup.enter="submit" />
      </div>
      <button class="btn btn-primary w-full" style="justify-content:center;margin-top:8px" :disabled="loading" @click="submit">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
      <div class="login-portal-link">
        <RouterLink to="/portal/login">Acesso do cliente →</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()
const email = ref(''), password = ref(''), loading = ref(false), error = ref('')

const submit = async () => {
  if (!email.value || !password.value) { error.value = 'Preencha todos os campos'; return }
  loading.value = true; error.value = ''
  const ok = await auth.login(email.value, password.value)
  loading.value = false
  if (ok) router.push('/dashboard')
  else error.value = auth.error
}
</script>

<style scoped>
.login-page { 
  min-height: 100vh;
  background: var(--sidebar-bg); 
  display: flex;
  align-items: center;
  justify-content: center; 
  padding: 16px; 

  background-color: #ffff;
}

.login-card { 
  background: #fff;
  border-radius: 16px;
  padding: 36px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3); 

  display: flex;
  flex-direction: column;
}

.login-logo { 
  display: flex;
  align-items: center;
  gap: 10px; 
  margin-bottom: 28px; 
  flex-direction: column;

}

.login-logo .logo-icon {
   width: 42px;
    height: 42px;
    background: var(--primary);
    border-radius: 10px; display: flex; align-items: center; justify-content: center; 
    }

.login-logo .logo-icon svg { width: 24px; height: 24px; fill: white; }
.login-logo span { font-size: 20px; font-weight: 800; color: var(--text); }
h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; text-align: center; }
.login-sub { color: var(--text-muted); margin-bottom: 24px; text-align: center; }
.login-portal-link { text-align: center; margin-top: 16px; font-size: 13px; }
.login-portal-link a { color: var(--primary); text-decoration: none; font-weight: 500; }
</style>
