<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

type Mensaje = { id: string; texto: string; tipo: string; fecha_publicacion: string | null; visto_en: string | null; creado_en: string }

const lista = ref<Mensaje[]>([])
const texto = ref('')
const tipo = ref<'nota' | 'poema' | 'extracto'>('nota')
const paraHoy = ref(true)
const fecha = ref(new Date().toISOString().slice(0, 10))
const guardando = ref(false)
const error = ref('')

const editandoId = ref<string | null>(null)
const editTexto = ref('')
const editTipo = ref<'nota' | 'poema' | 'extracto'>('nota')
const editFecha = ref('')
const editGuardando = ref(false)
const editError = ref('')

async function cargar() {
  const { data } = await supabase.from('mensajes').select('*').order('creado_en', { ascending: false }).limit(200)
  lista.value = (data ?? []) as Mensaje[]
}
onMounted(cargar)

async function publicar() {
  if (!texto.value.trim()) return
  guardando.value = true
  error.value = ''
  const fila = {
    texto: texto.value.trim(),
    tipo: tipo.value,
    fecha_publicacion: paraHoy.value ? `${fecha.value}T09:00:00-03:00` : null,
  }
  const { error: e } = await supabase.from('mensajes').insert(fila)
  guardando.value = false
  if (e) { error.value = e.message; return }
  texto.value = ''
  await cargar()
}

async function borrar(id: string) {
  if (!confirm('¿Borrar este mensaje?')) return
  await supabase.from('mensajes').delete().eq('id', id)
  await cargar()
}

function editar(m: Mensaje) {
  editandoId.value = m.id
  editTexto.value = m.texto
  editTipo.value = m.tipo as 'nota' | 'poema' | 'extracto'
  editFecha.value = m.fecha_publicacion ? m.fecha_publicacion.slice(0, 10) : ''
  editError.value = ''
}

function cancelarEdicion() {
  editandoId.value = null
}

async function guardarEdicion(id: string) {
  if (!editTexto.value.trim()) return
  editGuardando.value = true
  editError.value = ''
  const fila = {
    texto: editTexto.value.trim(),
    tipo: editTipo.value,
    fecha_publicacion: editFecha.value ? `${editFecha.value}T09:00:00-03:00` : null,
  }
  const { error: e } = await supabase.from('mensajes').update(fila).eq('id', id)
  editGuardando.value = false
  if (e) { editError.value = e.message; return }
  editandoId.value = null
  await cargar()
}

const enCola = () => lista.value.filter((m) => !m.visto_en && !m.fecha_publicacion).length
</script>

<template>
  <h1>Mensaje del día</h1>
  <p class="sub">Si escribes una nota para una fecha, esa gana. Si no, sale el siguiente del banco.</p>

  <div class="grid2">
    <form class="tarjeta" @submit.prevent="publicar">
      <label>Texto</label>
      <textarea v-model="texto" placeholder="Escríbele algo que solo ella entienda…" required></textarea>
      <label>Tipo</label>
      <select v-model="tipo">
        <option value="nota">Nota manual</option>
        <option value="poema">Poema</option>
        <option value="extracto">Extracto</option>
      </select>
      <label class="fila" style="gap:8px"><input type="checkbox" v-model="paraHoy" style="width:auto" /> Programar para una fecha</label>
      <input v-if="paraHoy" type="date" v-model="fecha" />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="acciones">
        <button class="boton" type="submit" :disabled="guardando">{{ paraHoy ? 'Publicar para esa fecha' : 'Sumar al banco' }}</button>
      </div>
    </form>

    <div class="tarjeta lavanda">
      <div class="etiqueta">Banco sin ver</div>
      <div class="numero" style="color:var(--carbon)">{{ enCola() }}</div>
      <div class="meta">Bajo 15 la app se empieza a repetir. Rinde ~2 meses con 60.</div>
      <p class="manuscrita" style="margin-top:16px">Escribe en tandas: una categoría por sesión.</p>
    </div>
  </div>

  <div class="tarjeta">
    <h2>Últimos {{ lista.length }}</h2>
    <div class="lista" style="margin-top:12px">
      <div v-for="m in lista" :key="m.id" class="item">
        <template v-if="editandoId === m.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(m.id)">
            <textarea v-model="editTexto" required></textarea>
            <div class="fila" style="gap:8px; margin-top:8px">
              <select v-model="editTipo">
                <option value="nota">Nota manual</option>
                <option value="poema">Poema</option>
                <option value="extracto">Extracto</option>
              </select>
              <input type="date" v-model="editFecha" />
            </div>
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit" :disabled="editGuardando">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto">
            <div>{{ m.texto }}</div>
            <div class="meta">
              <span class="pill">{{ m.tipo }}</span>
              <span v-if="m.fecha_publicacion" class="pill warn">para {{ m.fecha_publicacion.slice(0, 10) }}</span>
              <span v-if="m.visto_en" class="pill ok">visto {{ m.visto_en.slice(0, 10) }}</span>
            </div>
          </div>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editar(m)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(m.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
