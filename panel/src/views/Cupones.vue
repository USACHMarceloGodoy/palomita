<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import Escaner from '../components/Escaner.vue'

const lista = ref<any[]>([])
const titulo = ref('')
const descripcion = ref('')
const costo = ref(150)
const token = ref('')
const aviso = ref('')
const escaneando = ref(false)

const editandoId = ref<string | null>(null)
const editTitulo = ref('')
const editDescripcion = ref('')
const editCosto = ref(150)
const editError = ref('')

async function cargar() {
  const { data } = await supabase.from('cupones').select('*').order('costo')
  lista.value = data ?? []
}
onMounted(cargar)

async function crear() {
  const { error } = await supabase.from('cupones').insert({ titulo: titulo.value.trim(), descripcion: descripcion.value.trim() || null, costo: costo.value })
  if (error) { aviso.value = error.message; return }
  titulo.value = ''; descripcion.value = ''
  await cargar()
}

// Ella te muestra el código del cupón; lo escribes (o escaneas el QR) y queda usado.
async function canjear(desdeQr?: string) {
  aviso.value = ''
  const t = (desdeQr ?? token.value).trim().toLowerCase()
  const c = lista.value.find((x) => x.qr_token.startsWith(t) && x.comprado_en && !x.usado_en)
  if (!c) { aviso.value = 'No hay un cupón comprado y sin usar con ese código.'; return }
  await supabase.from('cupones').update({ usado_en: new Date().toISOString() }).eq('id', c.id)
  aviso.value = `Canjeado: ${c.titulo}`
  token.value = ''
  await cargar()
}

async function borrar(id: string) {
  if (!confirm('¿Borrar este cupón?')) return
  await supabase.from('cupones').delete().eq('id', id)
  await cargar()
}
function editar(c: any) {
  editandoId.value = c.id
  editTitulo.value = c.titulo
  editDescripcion.value = c.descripcion ?? ''
  editCosto.value = c.costo
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  editError.value = ''
  const { error: e } = await supabase.from('cupones').update({ titulo: editTitulo.value.trim(), descripcion: editDescripcion.value.trim() || null, costo: editCosto.value }).eq('id', id)
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Cupones</h1>
  <p class="sub">Los caros son caros a propósito. Deben sentirse ganados.</p>
  <div class="grid2">
    <form class="tarjeta" @submit.prevent="crear">
      <label>Título</label>
      <input v-model="titulo" required placeholder="Una noche de películas a tu elección" />
      <label>Descripción</label>
      <input v-model="descripcion" placeholder="Sin quejas por el género." />
      <label>Costo en besitos</label>
      <input v-model.number="costo" type="number" min="10" step="5" />
      <div class="acciones"><button class="boton">Crear cupón</button></div>
    </form>
    <form class="tarjeta menta" @submit.prevent="canjear()">
      <h2>Canjear un cupón</h2>
      <p class="sub" style="margin-bottom:8px">Ella te muestra el código y queda marcado como usado.</p>
      <Escaner v-if="escaneando" @token="(t) => { escaneando = false; canjear(t) }" />
      <button class="boton sec" type="button" style="margin-bottom:10px" @click="escaneando = !escaneando">{{ escaneando ? 'Cerrar cámara' : 'Escanear QR' }}</button>
      <input v-model="token" placeholder="o escribe el código de 6 letras" />
      <p v-if="aviso" class="error" style="color:#26543F">{{ aviso }}</p>
      <div class="acciones"><button class="boton">Marcar como usado</button></div>
    </form>
  </div>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="c in lista" :key="c.id" class="item" style="align-items:center">
        <template v-if="editandoId === c.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(c.id)">
            <input v-model="editTitulo" required />
            <input v-model="editDescripcion" style="margin-top:6px" />
            <input v-model.number="editCosto" type="number" min="10" step="5" style="margin-top:6px" />
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ c.titulo }}</strong><div class="meta">{{ c.descripcion }} · {{ c.costo }} besitos · código {{ c.qr_token.slice(0, 6) }}</div></div>
          <span class="pill" :class="c.usado_en ? 'ok' : c.comprado_en ? 'warn' : ''">{{ c.usado_en ? 'usado' : c.comprado_en ? 'comprado' : 'en tienda' }}</span>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(c)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(c.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
