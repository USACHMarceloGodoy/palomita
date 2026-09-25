<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const lista = ref<any[]>([])
const lote = ref('')
const categoria = ref('general')
const error = ref('')

async function cargar() {
  const { data } = await supabase.from('multiverso').select('*').order('creado_en', { ascending: false })
  lista.value = data ?? []
}
onMounted(cargar)

// Una variante por línea: se cargan en tanda.
async function guardar() {
  const filas = lote.value.split('\n').map((t) => t.trim()).filter(Boolean).map((texto) => ({ texto, categoria: categoria.value }))
  if (!filas.length) return
  const { error: e } = await supabase.from('multiverso').insert(filas)
  if (e) { error.value = e.message; return }
  lote.value = ''
  await cargar()
}

async function borrar(id: string) {
  if (!confirm('¿Borrar esta variante?')) return
  await supabase.from('multiverso').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editTexto = ref('')
const editCategoria = ref('')
const editError = ref('')

function editar(v: any) {
  editandoId.value = v.id
  editTexto.value = v.texto
  editCategoria.value = v.categoria
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  if (!editTexto.value.trim()) return
  editError.value = ''
  const { error: e } = await supabase.from('multiverso').update({ texto: editTexto.value.trim(), categoria: editCategoria.value.trim() }).eq('id', id)
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Multiverso del te amo</h1>
  <p class="sub">Una por línea. En idiomas, en código, en comparaciones absurdas. Meta: 100.</p>
  <div class="grid2">
    <form class="tarjeta" @submit.prevent="guardar">
      <label>Categoría</label>
      <input v-model="categoria" placeholder="idiomas, código, comparaciones, series…" />
      <label>Variantes (una por línea)</label>
      <textarea v-model="lote" style="min-height:220px" placeholder="Te amo en binario: 01110100…&#10;while (true) { teAmo(); }"></textarea>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="acciones"><button class="boton">Cargar tanda</button></div>
    </form>
    <div class="tarjeta lavanda">
      <div class="etiqueta">Descubiertas</div>
      <div class="numero" style="color:var(--carbon)">{{ lista.filter((v) => v.descubierto_en).length }} / {{ lista.length }}</div>
    </div>
  </div>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="v in lista" :key="v.id" class="item">
        <template v-if="editandoId === v.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(v.id)">
            <input v-model="editCategoria" />
            <textarea v-model="editTexto" style="margin-top:6px"></textarea>
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><div>{{ v.texto }}</div><div class="meta"><span class="pill">{{ v.categoria }}</span> <span v-if="v.descubierto_en" class="pill ok">descubierta</span></div></div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(v)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(v.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
