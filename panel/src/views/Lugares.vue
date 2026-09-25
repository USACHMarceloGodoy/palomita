<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const lista = ref<any[]>([])
const recuerdos = ref<any[]>([])
const titulo = ref('')
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const radio = ref(150)
const recuerdoId = ref('')

async function cargar() {
  const { data } = await supabase.from('lugares').select('*, recuerdo:recuerdos(texto)')
  lista.value = data ?? []
  const { data: r } = await supabase.from('recuerdos').select('id, texto, fecha').order('fecha', { ascending: false })
  recuerdos.value = r ?? []
}
onMounted(cargar)

async function crear() {
  if (lat.value === null || lng.value === null) return
  await supabase.from('lugares').insert({ titulo: titulo.value.trim(), lat: lat.value, lng: lng.value, radio_m: radio.value, recuerdo_id: recuerdoId.value || null })
  titulo.value = ''; lat.value = null; lng.value = null; recuerdoId.value = ''
  await cargar()
}
async function borrar(id: string) {
  await supabase.from('lugares').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editTitulo = ref('')
const editLat = ref<number | null>(null)
const editLng = ref<number | null>(null)
const editRadio = ref(150)
const editRecuerdoId = ref('')

function editar(l: any) {
  editandoId.value = l.id
  editTitulo.value = l.titulo
  editLat.value = l.lat
  editLng.value = l.lng
  editRadio.value = l.radio_m
  editRecuerdoId.value = l.recuerdo_id ?? ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  if (editLat.value === null || editLng.value === null) return
  await supabase.from('lugares').update({ titulo: editTitulo.value.trim(), lat: editLat.value, lng: editLng.value, radio_m: editRadio.value, recuerdo_id: editRecuerdoId.value || null }).eq('id', id)
  editandoId.value = null
  await cargar()
}
function pegarEdit(e: Event) {
  const v = (e.target as HTMLInputElement).value
  const m = v.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/)
  if (m) { editLat.value = Number(m[1]); editLng.value = Number(m[2]) }
}
// Pega "lat, lng" desde Google Maps (clic derecho en el mapa → copia las coordenadas).
function pegar(e: Event) {
  const v = (e.target as HTMLInputElement).value
  const m = v.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/)
  if (m) { lat.value = Number(m[1]); lng.value = Number(m[2]) }
}
</script>

<template>
  <h1>Nuestros lugares</h1>
  <p class="sub">Pines con geofence. Cuando ella pasa cerca, el teléfono vibra y se desbloquea el recuerdo.</p>
  <form class="tarjeta" @submit.prevent="crear">
    <div class="grid3">
      <div><label>Título</label><input v-model="titulo" required placeholder="Donde nos conocimos" /></div>
      <div><label>Coordenadas (pega "lat, lng" de Google Maps)</label><input @input="pegar" placeholder="-33.4372, -70.6506" /></div>
      <div><label>Radio (m)</label><input v-model.number="radio" type="number" min="50" max="1000" /></div>
    </div>
    <label>Recuerdo que se desbloquea ahí</label>
    <select v-model="recuerdoId"><option value="">— ninguno —</option><option v-for="r in recuerdos" :key="r.id" :value="r.id">{{ r.fecha }} · {{ r.texto.slice(0, 60) }}</option></select>
    <p class="meta" v-if="lat !== null">{{ lat }}, {{ lng }}</p>
    <div class="acciones"><button class="boton" :disabled="lat === null">Agregar pin</button></div>
  </form>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="l in lista" :key="l.id" class="item" style="align-items:center">
        <template v-if="editandoId === l.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(l.id)">
            <div class="grid3">
              <input v-model="editTitulo" required />
              <input @input="pegarEdit" :placeholder="editLat + ', ' + editLng" />
              <input v-model.number="editRadio" type="number" min="50" max="1000" />
            </div>
            <select v-model="editRecuerdoId" style="margin-top:6px"><option value="">— ninguno —</option><option v-for="r in recuerdos" :key="r.id" :value="r.id">{{ r.fecha }} · {{ r.texto.slice(0, 60) }}</option></select>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ l.titulo }}</strong><div class="meta">{{ l.lat }}, {{ l.lng }} · {{ l.radio_m }} m · {{ l.recuerdo?.texto?.slice(0, 50) || 'sin recuerdo' }}</div></div>
          <span class="pill" :class="{ ok: l.desbloqueado_en }">{{ l.desbloqueado_en ? 'desbloqueado' : 'pendiente' }}</span>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(l)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(l.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
