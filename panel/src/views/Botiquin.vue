<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { subirArchivo } from '../lib/media'

const CATS = [
  { id: 'animos', nombre: 'Necesito ánimos' },
  { id: 'feliz', nombre: 'Estoy feliz' },
  { id: 'logro', nombre: 'Logré algo hoy' },
  { id: 'extrano', nombre: 'Te extraño' },
]

const lista = ref<any[]>([])
const categoria = ref('animos')
const tipo = ref<'texto' | 'audio' | 'video'>('texto')
const texto = ref('')
const archivo = ref<File | null>(null)
const guardando = ref(false)
const error = ref('')
const inedito = ref(false)

const editandoId = ref<string | null>(null)
const editCategoria = ref('animos')
const editTexto = ref('')
const editInedito = ref(false)
const editError = ref('')

async function cargar() {
  const { data } = await supabase.from('botiquin').select('*').order('creado_en', { ascending: false })
  lista.value = data ?? []
}
onMounted(cargar)

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    const media_path = archivo.value ? await subirArchivo(archivo.value, 'botiquin') : null
    if (tipo.value !== 'texto' && !media_path) throw new Error('Falta el archivo')
    const { error: e } = await supabase.from('botiquin').insert({ categoria: categoria.value, tipo: tipo.value, texto: texto.value.trim() || null, media_path, inedito: inedito.value })
    if (e) throw e
    texto.value = ''; archivo.value = null
    await cargar()
  } catch (e: any) { error.value = e.message } finally { guardando.value = false }
}

async function borrar(id: string) {
  if (!confirm('¿Borrar esta pieza?')) return
  await supabase.from('botiquin').delete().eq('id', id)
  await cargar()
}

function editar(b: any) {
  editandoId.value = b.id
  editCategoria.value = b.categoria
  editTexto.value = b.texto ?? ''
  editInedito.value = !!b.inedito
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  editError.value = ''
  const { error: e } = await supabase.from('botiquin').update({ categoria: editCategoria.value, texto: editTexto.value.trim() || null, inedito: editInedito.value }).eq('id', id)
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}

const cuenta = (c: string) => lista.value.filter((b) => b.categoria === c).length
</script>

<template>
  <h1>Botiquín de emergencia</h1>
  <p class="sub">Cuatro botones. Mínimo 4 piezas por botón para no repetir en un mes.</p>

  <div class="grid2">
    <form class="tarjeta" @submit.prevent="guardar">
      <label>Botón</label>
      <select v-model="categoria"><option v-for="c in CATS" :key="c.id" :value="c.id">{{ c.nombre }}</option></select>
      <label>Tipo</label>
      <select v-model="tipo"><option value="texto">Texto</option><option value="audio">Audio</option><option value="video">Video</option></select>
      <label>Texto (puede acompañar al audio)</label>
      <textarea v-model="texto"></textarea>
      <label v-if="tipo !== 'texto'">Archivo</label>
      <input v-if="tipo !== 'texto'" type="file" :accept="tipo + '/*'" @change="archivo = ($event.target as HTMLInputElement).files?.[0] ?? null" />
      <label v-if="tipo === 'audio'" class="fila" style="gap:8px"><input type="checkbox" v-model="inedito" style="width:auto" /> Inédito: solo se oye al comprarlo (60 besitos)</label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="acciones"><button class="boton" :disabled="guardando">Guardar</button></div>
    </form>
    <div class="tarjeta menta">
      <h2>Por botón</h2>
      <div class="lista" style="margin-top:12px">
        <div v-for="c in CATS" :key="c.id" class="item" style="align-items:center">
          <div class="texto"><strong>{{ c.nombre }}</strong></div>
          <span class="pill" :class="cuenta(c.id) >= 4 ? 'ok' : 'warn'">{{ cuenta(c.id) }} / 4</span>
        </div>
      </div>
      <p class="manuscrita" style="margin-top:14px">El kit zombi no es un chiste sobre su tristeza: yo te cubro la espalda.</p>
    </div>
  </div>

  <div class="tarjeta">
    <div class="lista">
      <div v-for="b in lista" :key="b.id" class="item">
        <template v-if="editandoId === b.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(b.id)">
            <select v-model="editCategoria"><option v-for="c in CATS" :key="c.id" :value="c.id">{{ c.nombre }}</option></select>
            <textarea v-model="editTexto" style="margin-top:6px"></textarea>
            <label v-if="b.tipo === 'audio'" class="fila" style="gap:8px;margin-top:6px"><input type="checkbox" v-model="editInedito" style="width:auto" /> Inédito</label>
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><div>{{ b.texto || '(solo archivo)' }}</div><div class="meta"><span class="pill">{{ b.categoria }}</span> <span class="pill">{{ b.tipo }}</span></div></div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(b)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(b.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
