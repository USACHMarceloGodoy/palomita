<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const lista = ref<any[]>([])
const rondas = ref<any[]>([])
const pregunta = ref('')
const opciones = ref(['', '', '', ''])
const correcta = ref(0)

async function cargar() {
  const { data } = await supabase.from('trivia').select('*')
  lista.value = data ?? []
  const { data: r } = await supabase.from('trivia_rondas').select('*').order('fecha', { ascending: false }).limit(14)
  rondas.value = r ?? []
}
onMounted(cargar)

async function guardar() {
  const ops = opciones.value.map((o) => o.trim()).filter(Boolean)
  if (ops.length < 2) return
  await supabase.from('trivia').insert({ pregunta: pregunta.value.trim(), opciones: ops, correcta: correcta.value })
  pregunta.value = ''; opciones.value = ['', '', '', '']; correcta.value = 0
  await cargar()
}
async function borrar(id: string) {
  await supabase.from('trivia').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editPregunta = ref('')
const editOpciones = ref(['', '', '', ''])
const editCorrecta = ref(0)

function editar(t: any) {
  editandoId.value = t.id
  editPregunta.value = t.pregunta
  editOpciones.value = [...t.opciones, '', '', '', ''].slice(0, Math.max(4, t.opciones.length))
  editCorrecta.value = t.correcta
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  const ops = editOpciones.value.map((o) => o.trim()).filter(Boolean)
  if (ops.length < 2) return
  await supabase.from('trivia').update({ pregunta: editPregunta.value.trim(), opciones: ops, correcta: editCorrecta.value }).eq('id', id)
  editandoId.value = null
  await cargar()
}
</script>

<template>
  <h1>Trivia de la pareja</h1>
  <p class="sub">Cinco por ronda, una ronda al día. Meta: 50 preguntas (10 rondas).</p>
  <div class="grid2">
    <form class="tarjeta" @submit.prevent="guardar">
      <label>Pregunta</label>
      <input v-model="pregunta" required placeholder="¿Dónde fue nuestra primera cita?" />
      <label>Opciones (marca la correcta)</label>
      <div v-for="(_, i) in opciones" :key="i" class="fila" style="margin-bottom:6px">
        <input type="radio" :value="i" v-model="correcta" style="width:auto" />
        <input v-model="opciones[i]" :placeholder="'Opción ' + (i + 1)" />
      </div>
      <div class="acciones"><button class="boton">Guardar pregunta</button></div>
    </form>
    <div class="tarjeta menta">
      <h2>Sus rondas</h2>
      <div class="lista" style="margin-top:10px">
        <div v-for="r in rondas" :key="r.id" class="item"><div class="texto">{{ r.fecha }} · {{ r.correctas }} de 5 <span v-if="r.correctas === 5" class="pill ok">perfecta</span></div></div>
        <p v-if="!rondas.length" class="meta">Todavía no juega.</p>
      </div>
    </div>
  </div>
  <div class="tarjeta">
    <h2>{{ lista.length }} preguntas</h2>
    <div class="lista" style="margin-top:12px">
      <div v-for="t in lista" :key="t.id" class="item">
        <template v-if="editandoId === t.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(t.id)">
            <input v-model="editPregunta" required />
            <div v-for="(_, i) in editOpciones" :key="i" class="fila" style="margin-top:6px">
              <input type="radio" :value="i" v-model="editCorrecta" style="width:auto" />
              <input v-model="editOpciones[i]" :placeholder="'Opción ' + (i + 1)" />
            </div>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ t.pregunta }}</strong><div class="meta">{{ t.opciones.join(' · ') }} → <b>{{ t.opciones[t.correcta] }}</b></div></div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(t)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(t.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
