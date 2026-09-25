<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { subirArchivo } from '../lib/media'

const lista = ref<any[]>([])
const titulo = ref('')
const contenido = ref('')
const abreEn = ref('')
const archivo = ref<File | null>(null)
const error = ref('')

const editandoId = ref<string | null>(null)
const editTitulo = ref('')
const editContenido = ref('')
const editAbreEn = ref('')
const editError = ref('')

async function cargar() {
  const { data } = await supabase.from('capsulas').select('*').order('abre_en')
  lista.value = data ?? []
}
onMounted(cargar)

async function guardar() {
  error.value = ''
  try {
    const media_path = archivo.value ? await subirArchivo(archivo.value, 'capsulas') : null
    const { error: e } = await supabase.from('capsulas').insert({ titulo: titulo.value.trim(), contenido: contenido.value.trim() || null, media_path, abre_en: new Date(abreEn.value).toISOString() })
    if (e) throw e
    titulo.value = ''; contenido.value = ''; archivo.value = null
    await cargar()
  } catch (e: any) { error.value = e.message }
}
async function borrar(id: string) {
  if (!confirm('¿Borrar esta cápsula?')) return
  await supabase.from('capsulas').delete().eq('id', id)
  await cargar()
}
function editar(c: any) {
  editandoId.value = c.id
  editTitulo.value = c.titulo
  editContenido.value = c.contenido ?? ''
  editAbreEn.value = c.abre_en ? c.abre_en.slice(0, 16) : ''
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  editError.value = ''
  const { error: e } = await supabase.from('capsulas').update({ titulo: editTitulo.value.trim(), contenido: editContenido.value.trim() || null, abre_en: new Date(editAbreEn.value).toISOString() }).eq('id', id)
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}
const estado = (c: any) => (c.abierta ? 'abierta' : new Date(c.abre_en) <= new Date() ? 'disponible' : 'con candado')
</script>

<template>
  <h1>Cápsula del tiempo</h1>
  <p class="sub">Cartas y audios con fecha de apertura. Ella ve el título y la cuenta regresiva; el contenido lo guarda Postgres hasta el día.</p>
  <form class="tarjeta" @submit.prevent="guardar">
    <div class="grid2">
      <div>
        <label>Título</label><input v-model="titulo" required placeholder="Para cuando cumplamos un año" />
        <label>Se abre el</label><input v-model="abreEn" type="datetime-local" required />
        <label>Audio (opcional)</label><input type="file" accept="audio/*" @change="archivo = ($event.target as HTMLInputElement).files?.[0] ?? null" />
      </div>
      <div><label>Carta</label><textarea v-model="contenido" style="min-height:180px"></textarea></div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="acciones"><button class="boton">Guardar cápsula</button></div>
  </form>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="c in lista" :key="c.id" class="item" style="align-items:center">
        <template v-if="editandoId === c.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(c.id)">
            <input v-model="editTitulo" required />
            <input v-model="editAbreEn" type="datetime-local" required style="margin-top:6px" />
            <textarea v-model="editContenido" style="margin-top:6px"></textarea>
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ c.titulo }}</strong><div class="meta">{{ new Date(c.abre_en).toLocaleString('es-CL') }}</div></div>
          <span class="pill" :class="{ ok: c.abierta, warn: estado(c) === 'disponible' }">{{ estado(c) }}</span>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(c)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(c.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
