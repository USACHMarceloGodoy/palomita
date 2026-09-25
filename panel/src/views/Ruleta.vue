<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const lista = ref<any[]>([])
const giros = ref<any[]>([])
const titulo = ref('')
const descripcion = ref('')
const peso = ref(2)

async function cargar() {
  const { data } = await supabase.from('ruleta').select('*').order('titulo')
  lista.value = data ?? []
  const { data: g } = await supabase.from('ruleta_giros').select('fecha, canjeado_en, premio:ruleta(titulo)').order('fecha', { ascending: false }).limit(10)
  giros.value = g ?? []
}
onMounted(cargar)

async function crear() {
  await supabase.from('ruleta').insert({ titulo: titulo.value.trim(), descripcion: descripcion.value.trim() || null, peso: peso.value })
  titulo.value = ''; descripcion.value = ''
  await cargar()
}
async function alternar(p: any) {
  await supabase.from('ruleta').update({ activo: !p.activo }).eq('id', p.id)
  await cargar()
}
async function borrar(id: string) {
  if (!confirm('¿Borrar este premio?')) return
  await supabase.from('ruleta').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editTitulo = ref('')
const editDescripcion = ref('')
const editPeso = ref(2)

function editar(p: any) {
  editandoId.value = p.id
  editTitulo.value = p.titulo
  editDescripcion.value = p.descripcion ?? ''
  editPeso.value = p.peso
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  await supabase.from('ruleta').update({ titulo: editTitulo.value.trim(), descripcion: editDescripcion.value.trim() || null, peso: editPeso.value }).eq('id', id)
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Ruleta de citas</h1>
  <p class="sub">Un giro por semana. Meta: 12 premios (3 meses de fines de semana).</p>
  <div class="grid2">
    <form class="tarjeta" @submit.prevent="crear">
      <label>Premio</label><input v-model="titulo" required placeholder="Noche de películas" />
      <label>Descripción</label><input v-model="descripcion" placeholder="Tú eliges, yo no me quejo." />
      <label>Peso (más peso, sale más)</label><input v-model.number="peso" type="number" min="1" max="10" />
      <div class="acciones"><button class="boton">Agregar</button></div>
    </form>
    <div class="tarjeta lavanda">
      <h2>Últimos giros</h2>
      <div class="lista" style="margin-top:10px">
        <div v-for="g in giros" :key="g.fecha" class="item"><div class="texto">{{ g.premio?.titulo }}<div class="meta">{{ g.fecha.slice(0, 10) }}</div></div></div>
        <p v-if="!giros.length" class="meta">Todavía no gira.</p>
      </div>
    </div>
  </div>
  <div class="tarjeta">
    <div class="lista">
      <div v-for="p in lista" :key="p.id" class="item" style="align-items:center">
        <template v-if="editandoId === p.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(p.id)">
            <input v-model="editTitulo" required />
            <input v-model="editDescripcion" style="margin-top:6px" />
            <input v-model.number="editPeso" type="number" min="1" max="10" style="margin-top:6px" />
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ p.titulo }}</strong><div class="meta">{{ p.descripcion }} · peso {{ p.peso }}</div></div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="alternar(p)">{{ p.activo ? 'Desactivar' : 'Activar' }}</button>
            <button class="boton sec" type="button" @click="editar(p)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(p.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
