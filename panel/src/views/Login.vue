<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const pass = ref('')
const error = ref('')

async function entrar() {
  error.value = ''
  const { error: e } = await supabase.auth.signInWithPassword({ email: email.value, password: pass.value })
  if (e) { error.value = 'Correo o clave incorrectos.'; return }
  router.push('/')
}
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;padding:20px">
    <form class="tarjeta" style="width:min(420px,100%)" @submit.prevent="entrar">
      <h1>Palomita</h1>
      <p class="sub">Panel privado. Solo tú.</p>
      <label>Correo</label>
      <input v-model="email" type="email" autocomplete="username" required />
      <label>Clave</label>
      <input v-model="pass" type="password" autocomplete="current-password" required />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="acciones"><button class="boton" type="submit">Entrar</button></div>
    </form>
  </div>
</template>
