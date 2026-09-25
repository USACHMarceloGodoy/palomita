<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './lib/supabase'

const route = useRoute()
const router = useRouter()
const conSesion = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  conSesion.value = !!data.session
  supabase.auth.onAuthStateChange((_e, s) => { conSesion.value = !!s })
})

async function salir() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div v-if="route.path === '/login' || !conSesion"><router-view /></div>
  <div v-else class="app">
    <nav class="lateral">
      <div class="marca">Palomita<small>panel privado</small></div>
      <router-link to="/">Inicio</router-link>
      <router-link to="/mensajes">Mensajes del día</router-link>
      <router-link to="/recuerdos">Baúl</router-link>
      <router-link to="/botiquin">Botiquín</router-link>
      <router-link to="/cuentos">Cuentos (Modo dormir)</router-link>
      <router-link to="/multiverso">Multiverso</router-link>
      <router-link to="/cupones">Cupones</router-link>
      <router-link to="/eventos">Calendario</router-link>
      <router-link to="/checkins">Sus check-ins</router-link>
      <router-link to="/trivia">Trivia</router-link>
      <router-link to="/ruleta">Ruleta de citas</router-link>
      <router-link to="/capsulas">Cápsulas</router-link>
      <router-link to="/lugares">Lugares</router-link>
      <router-link to="/extras">Extras</router-link>
      <button class="salir" @click="salir">Salir</button>
    </nav>
    <main class="contenido"><router-view /></main>
  </div>
</template>
