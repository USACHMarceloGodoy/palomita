<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase, urlFirmada } from '../lib/supabase'
import { subirArchivo, subirFoto } from '../lib/media'

type Recuerdo = { id: string; foto_path: string; thumb_path: string | null; texto: string; fecha: string | null; lugar: string | null; audio_path: string | null; tags: string[]; inedito?: boolean }

const lista = ref<(Recuerdo & { url?: string | null })[]>([])
const foto = ref<File | null>(null)
const audio = ref<File | null>(null)
const texto = ref('')
const fecha = ref('')
const lugar = ref('')
const tags = ref('')
const inedito = ref(false)
const subiendo = ref(false)
const error = ref('')

async function cargar() {
  const { data } = await supabase.from('recuerdos').select('*').order('fecha', { ascending: false })
  const filas = (data ?? []) as Recuerdo[]
  lista.value = await Promise.all(filas.map(async (r) => ({ ...r, url: await urlFirmada(r.thumb_path ?? r.foto_path) })))
}
onMounted(cargar)

async function guardar() {
  if (!foto.value) return
  subiendo.value = true
  error.value = ''
  try {
    const paths = await subirFoto(foto.value)
    const audio_path = audio.value ? await subirArchivo(audio.value, 'audios') : null
    const { error: e } = await supabase.from('recuerdos').insert({
      ...paths,
      audio_path,
      texto: texto.value.trim(),
      fecha: fecha.value || null,
      lugar: lugar.value.trim() || null,
      tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean),
      inedito: inedito.value,
    })
    if (e) throw e
    foto.value = null; audio.value = null; texto.value = ''; fecha.value = ''; lugar.value = ''; tags.value = ''
    await cargar()
  } catch (e: any) {
    error.value = e.message ?? String(e)
  } finally {
    subiendo.value = false
  }
}

async function borrar(id: string) {
  if (!confirm('¿Borrar este recuerdo?')) return
  await supabase.from('recuerdos').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editTexto = ref('')
const editFecha = ref('')
const editLugar = ref('')
const editTags = ref('')
const editInedito = ref(false)
const editError = ref('')

function editar(r: Recuerdo) {
  editandoId.value = r.id
  editTexto.value = r.texto
  editFecha.value = r.fecha ?? ''
  editLugar.value = r.lugar ?? ''
  editTags.value = (r.tags ?? []).join(', ')
  editInedito.value = !!r.inedito
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  editError.value = ''
  const { error: e } = await supabase.from('recuerdos').update({
    texto: editTexto.value.trim(),
    fecha: editFecha.value || null,
    lugar: editLugar.value.trim() || null,
    tags: editTags.value.split(',').map((t) => t.trim()).filter(Boolean),
    inedito: editInedito.value,
  }).eq('id', id)
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Baúl de los recuerdos</h1>
  <p class="sub">Cara A la foto, cara B tu texto. Se sube en WebP a 1600 px, con miniatura aparte.</p>

  <form class="tarjeta" @submit.prevent="guardar">
    <div class="grid2">
      <div>
        <label>Foto</label>
        <input type="file" accept="image/*" @change="foto = ($event.target as HTMLInputElement).files?.[0] ?? null" required />
        <label>Audio de 30 s (opcional)</label>
        <input type="file" accept="audio/*" @change="audio = ($event.target as HTMLInputElement).files?.[0] ?? null" />
        <label>Fecha</label>
        <input type="date" v-model="fecha" />
        <label>Lugar</label>
        <input v-model="lugar" placeholder="Valparaíso" />
      </div>
      <div>
        <label>Tu texto (cara B)</label>
        <textarea v-model="texto" required></textarea>
        <label>Etiquetas, separadas por coma</label>
        <input v-model="tags" placeholder="viajes, primeras veces" />
        <label class="fila" style="gap:8px"><input type="checkbox" v-model="inedito" style="width:auto" /> Inédita: solo se ve al comprarla en la tienda (40 besitos)</label>
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="acciones"><button class="boton" :disabled="subiendo || !foto">{{ subiendo ? 'Subiendo…' : 'Guardar en el Baúl' }}</button></div>
  </form>

  <div class="tarjeta">
    <h2>{{ lista.length }} recuerdos</h2>
    <div class="lista" style="margin-top:12px">
      <div v-for="r in lista" :key="r.id" class="item">
        <img v-if="r.url" :src="r.url" alt="" />
        <template v-if="editandoId === r.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(r.id)">
            <textarea v-model="editTexto" required></textarea>
            <div class="grid3" style="margin-top:6px">
              <input type="date" v-model="editFecha" />
              <input v-model="editLugar" placeholder="Lugar" />
              <input v-model="editTags" placeholder="etiquetas, separadas" />
            </div>
            <label class="fila" style="gap:8px;margin-top:6px"><input type="checkbox" v-model="editInedito" style="width:auto" /> Inédita</label>
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto">
            <div>{{ r.texto }}</div>
            <div class="meta">{{ r.fecha }} · {{ r.lugar }} <span v-for="t in r.tags" :key="t" class="pill">#{{ t }}</span> <span v-if="r.audio_path" class="pill ok">audio</span> <span v-if="r.inedito" class="pill warn">inédita</span></div>
          </div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(r)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(r.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
