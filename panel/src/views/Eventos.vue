<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

// Mismas claves que el motor de partículas de la app.
const TIPOS = ['sorpresa', 'kawaii', 'bichitos', 'comida', 'flores-rosas', 'flores-amarillas', 'rosas', 'girasoles', 'corazones', 'volantines', 'lazos', 'gatitos', 'capibaras', 'zuricatas', 'ovejas', 'conejitos', 'frutillas', 'hamburguesitas', 'lanas']

const lista = ref<any[]>([])
const fecha = ref('')
const tipo = ref('corazones')
const mensaje = ref('')
const mensajeDia = ref('')
const recurrente = ref(true)

async function cargar() {
  const { data } = await supabase.from('eventos').select('*').order('fecha')
  lista.value = data ?? []
}
onMounted(cargar)

async function crear() {
  await supabase.from('eventos').insert({ fecha: fecha.value, tipo_particula: tipo.value, mensaje: mensaje.value.trim() || null, mensaje_dia: mensajeDia.value.trim() || null, recurrente: recurrente.value })
  mensaje.value = ''
  mensajeDia.value = ''
  await cargar()
}
async function borrar(id: string) {
  await supabase.from('eventos').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editFecha = ref('')
const editTipo = ref('corazones')
const editMensaje = ref('')
const editMensajeDia = ref('')
const editRecurrente = ref(true)

function editar(e: any) {
  editandoId.value = e.id
  editFecha.value = e.fecha
  editTipo.value = e.tipo_particula
  editMensaje.value = e.mensaje ?? ''
  editMensajeDia.value = e.mensaje_dia ?? ''
  editRecurrente.value = e.recurrente
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  await supabase.from('eventos').update({ fecha: editFecha.value, tipo_particula: editTipo.value, mensaje: editMensaje.value.trim() || null, mensaje_dia: editMensajeDia.value.trim() || null, recurrente: editRecurrente.value }).eq('id', id)
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Calendario</h1>
  <p class="sub">Agregar un evento es agregar una fila. La app cambia el splash sola.</p>
  <form class="tarjeta" @submit.prevent="crear">
    <div class="grid3">
      <div><label>Fecha</label><input type="date" v-model="fecha" required /></div>
      <div><label>Partículas</label><select v-model="tipo"><option v-for="t in TIPOS" :key="t">{{ t }}</option></select></div>
      <div><label>Mensaje del splash</label><input v-model="mensaje" placeholder="Feliz cumpleaños" /></div>
    </div>
    <div><label>Mensaje del día especial (reemplaza el mensaje al azar de Inicio ese día — ej: letra de una canción)</label><textarea v-model="mensajeDia" rows="3" placeholder="Pega acá el texto completo" /></div>
    <label class="fila" style="gap:8px"><input type="checkbox" v-model="recurrente" style="width:auto" /> Se repite cada año</label>
    <div class="acciones"><button class="boton">Agregar</button></div>
  </form>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="e in lista" :key="e.id" class="item" style="align-items:center">
        <template v-if="editandoId === e.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(e.id)">
            <div class="grid3">
              <input type="date" v-model="editFecha" required />
              <select v-model="editTipo"><option v-for="t in TIPOS" :key="t">{{ t }}</option></select>
              <input v-model="editMensaje" />
            </div>
            <textarea v-model="editMensajeDia" rows="3" placeholder="Mensaje del día especial (ej: letra de una canción)" style="margin-top:6px" />
            <label class="fila" style="gap:8px;margin-top:6px"><input type="checkbox" v-model="editRecurrente" style="width:auto" /> Se repite cada año</label>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ e.fecha }}</strong> · {{ e.tipo_particula }}<div class="meta">{{ e.mensaje }} {{ e.recurrente ? '· cada año' : '' }}</div></div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(e)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(e.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
