<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const lista = ref<any[]>([])
const respuestas = ref<any[]>([])
const emoji = ref('bien')
const texto = ref('')

async function cargar() {
  const { data } = await supabase.from('checkins').select('*').order('fecha', { ascending: false }).limit(90)
  lista.value = data ?? []
  const { data: r } = await supabase.from('respuestas_checkin').select('*')
  respuestas.value = r ?? []
}
onMounted(cargar)

async function agregarRespuesta() {
  if (!texto.value.trim()) return
  await supabase.from('respuestas_checkin').insert({ emoji: emoji.value, texto: texto.value.trim() })
  texto.value = ''
  await cargar()
}
async function borrarRespuesta(id: string) {
  await supabase.from('respuestas_checkin').delete().eq('id', id)
  await cargar()
}
const editandoId = ref<string | null>(null)
const editEmoji = ref('bien')
const editTexto = ref('')
function editar(r: any) {
  editandoId.value = r.id
  editEmoji.value = r.emoji
  editTexto.value = r.texto
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  if (!editTexto.value.trim()) return
  await supabase.from('respuestas_checkin').update({ emoji: editEmoji.value, texto: editTexto.value.trim() }).eq('id', id)
  editandoId.value = null
  await cargar()
}
const porEmoji = (e: string) => respuestas.value.filter((r) => r.emoji === e).length
</script>

<template>
  <h1>Sus check-ins</h1>
  <p class="sub">Solo lectura. Lo que ella eligió cada día, con su texto si lo escribió.</p>
  <div class="grid2">
    <div class="tarjeta">
      <div class="lista">
        <div v-for="c in lista" :key="c.id" class="item">
          <div class="texto"><strong style="text-transform:capitalize">{{ c.emoji }}</strong> <span class="meta">· {{ c.fecha }}</span><div>{{ c.texto || '—' }}</div></div>
        </div>
        <p v-if="!lista.length" class="meta">Todavía nada.</p>
      </div>
    </div>
    <form class="tarjeta" @submit.prevent="agregarRespuesta">
      <h2>Respuestas preconfiguradas</h2>
      <p class="sub" style="margin-bottom:8px">Mínimo 3 por carita. Las de días malos acompañan, nunca minimizan.</p>
      <div class="fila" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
        <span v-for="e in ['fatal','mal','normal','bien','genial']" :key="e" class="pill" :class="porEmoji(e) >= 3 ? 'ok' : 'warn'">{{ e }} {{ porEmoji(e) }}</span>
      </div>
      <label>Carita</label>
      <select v-model="emoji"><option>fatal</option><option>mal</option><option>normal</option><option>bien</option><option>genial</option></select>
      <label>Respuesta</label>
      <textarea v-model="texto"></textarea>
      <div class="acciones"><button class="boton">Guardar</button></div>
      <div class="lista" style="margin-top:14px">
        <div v-for="r in respuestas" :key="r.id" class="item">
          <template v-if="editandoId === r.id">
            <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(r.id)">
              <select v-model="editEmoji"><option>fatal</option><option>mal</option><option>normal</option><option>bien</option><option>genial</option></select>
              <textarea v-model="editTexto" style="margin-top:6px"></textarea>
              <div class="acciones" style="margin-top:8px">
                <button class="boton" type="submit">Guardar</button>
                <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
              </div>
            </form>
          </template>
          <template v-else>
            <div class="texto"><span class="pill">{{ r.emoji }}</span> {{ r.texto }}</div>
            <div class="fila" style="gap:6px">
              <button class="boton sec" type="button" @click="editar(r)">Editar</button>
              <button class="boton sec" type="button" @click="borrarRespuesta(r.id)">Borrar</button>
            </div>
          </template>
        </div>
      </div>
    </form>
  </div>
</template>
