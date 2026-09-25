<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { subirArchivo } from '../lib/media'

type CuentoRow = { id: string; titulo: string; audio_path: string; duracion_seg: number | null; creado_en: string; serie: string | null; numero: number | null; escuchado_en: string | null }

const lista = ref<CuentoRow[]>([])
const titulo = ref('')
const serie = ref('')
const numero = ref<number | null>(null)
const archivo = ref<File | null>(null)
const guardando = ref(false)
const error = ref('')

async function cargar() {
  const { data } = await supabase.from('cuentos').select('*').order('serie', { ascending: true, nullsFirst: false }).order('numero').order('creado_en')
  lista.value = (data ?? []) as CuentoRow[]
}
onMounted(cargar)

async function guardar() {
  if (!titulo.value.trim() || !archivo.value) return
  guardando.value = true
  error.value = ''
  try {
    const audio_path = await subirArchivo(archivo.value, 'cuentos')
    const nombreSerie = serie.value.trim() || null
    // Si es parte de una serie y no pusiste número, va al final sola.
    const num = nombreSerie
      ? (numero.value ?? (Math.max(0, ...lista.value.filter((c) => c.serie === nombreSerie).map((c) => c.numero ?? 0)) + 1))
      : null
    const { error: e } = await supabase.from('cuentos').insert({ titulo: titulo.value.trim(), audio_path, serie: nombreSerie, numero: num })
    if (e) throw e
    titulo.value = ''; numero.value = null; archivo.value = null
    await cargar()
  } catch (e: any) { error.value = e.message ?? String(e) } finally { guardando.value = false }
}

/** Deja la serie como no escuchada, para volver a empezarla desde el capítulo 1. */
async function reiniciarSerie(nombre: string) {
  if (!confirm(`¿Marcar toda la serie "${nombre}" como no escuchada?`)) return
  await supabase.from('cuentos').update({ escuchado_en: null }).eq('serie', nombre)
  await cargar()
}

async function borrar(id: string) {
  if (!confirm('¿Borrar este cuento?')) return
  await supabase.from('cuentos').delete().eq('id', id)
  await cargar()
}

const editandoId = ref<string | null>(null)
const editTitulo = ref('')
const editSerie = ref('')
const editNumero = ref<number | null>(null)
const editArchivo = ref<File | null>(null)
const editGuardando = ref(false)
const editError = ref('')

function editar(c: CuentoRow) {
  editandoId.value = c.id
  editTitulo.value = c.titulo
  editSerie.value = c.serie ?? ''
  editNumero.value = c.numero
  editArchivo.value = null
  editError.value = ''
}
function cancelarEdicion() { editandoId.value = null }
async function guardarEdicion(id: string) {
  editGuardando.value = true
  editError.value = ''
  try {
    const nombreSerie = editSerie.value.trim() || null
    const fila: { titulo: string; serie: string | null; numero: number | null; audio_path?: string } = {
      titulo: editTitulo.value.trim(),
      serie: nombreSerie,
      numero: nombreSerie ? (editNumero.value ?? 1) : null,
    }
    if (editArchivo.value) fila.audio_path = await subirArchivo(editArchivo.value, 'cuentos')
    const { error: e } = await supabase.from('cuentos').update(fila).eq('id', id)
    if (e) throw e
    editandoId.value = null
    await cargar()
  } catch (e: any) { editError.value = e.message ?? String(e) } finally { editGuardando.value = false }
}
</script>

<template>
  <h1>Cuentos para Modo dormir</h1>
  <p class="sub">Grábate leyéndole un cuento (o inventando uno) y súbelo aquí. En la app, ella elige qué escuchar: un <strong>cuento suelto</strong> (suena en bucle hasta que se acaba el temporizador) o una <strong>serie</strong>, que arranca donde quedó y va encadenando los capítulos siguientes sola. Para una novela por capítulos, pon el mismo nombre de serie en todos y numéralos.</p>

  <div class="grid2">
    <form class="tarjeta" @submit.prevent="guardar">
      <label>Título</label>
      <input v-model="titulo" required placeholder="La noche que nos conocimos, contada como cuento" />
      <div class="grid2">
        <div>
          <label>Serie (opcional)</label>
          <input v-model="serie" list="series-existentes" placeholder="Dejar vacío = cuento suelto" />
          <datalist id="series-existentes">
            <option v-for="n in [...new Set(lista.filter((c) => c.serie).map((c) => c.serie as string))]" :key="n" :value="n" />
          </datalist>
        </div>
        <div>
          <label>N° de capítulo</label>
          <input v-model.number="numero" type="number" min="1" placeholder="auto: va al final" />
        </div>
      </div>
      <label>Audio</label>
      <input type="file" accept="audio/*" @change="archivo = ($event.target as HTMLInputElement).files?.[0] ?? null" required />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="acciones"><button class="boton" :disabled="guardando">{{ guardando ? 'Subiendo…' : 'Guardar' }}</button></div>
    </form>
    <div class="tarjeta lavanda">
      <div class="etiqueta">Cuentos grabados</div>
      <div class="numero" style="color:var(--carbon)">{{ lista.length }}</div>
      <div class="meta">
        {{ [...new Set(lista.filter((c) => c.serie).map((c) => c.serie))].length }} serie(s) ·
        {{ lista.filter((c) => !c.serie).length }} sueltos. Mínimo 3-4 sueltos para que no se repitan.
      </div>
    </div>
  </div>

  <div class="tarjeta">
    <h2>{{ lista.length }} cuentos</h2>
    <div class="lista" style="margin-top:12px">
      <div v-for="c in lista" :key="c.id" class="item" style="align-items:center">
        <template v-if="editandoId === c.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicion(c.id)">
            <input v-model="editTitulo" required />
            <div class="grid2" style="margin-top:6px">
              <div><label>Serie</label><input v-model="editSerie" placeholder="vacío = cuento suelto" /></div>
              <div><label>N° de capítulo</label><input v-model.number="editNumero" type="number" min="1" /></div>
            </div>
            <label style="margin-top:6px">Reemplazar audio (opcional)</label>
            <input type="file" accept="audio/*" @change="editArchivo = ($event.target as HTMLInputElement).files?.[0] ?? null" />
            <p v-if="editError" class="error">{{ editError }}</p>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit" :disabled="editGuardando">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicion">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto">
            <strong>{{ c.serie ? `${c.serie} · Cap. ${c.numero}` : c.titulo }}</strong>
            <div class="meta">
              {{ c.serie ? c.titulo : 'cuento suelto' }}
              {{ c.escuchado_en ? '· ya lo escuchó' : '' }}
            </div>
          </div>
          <div class="fila" style="gap:6px">
            <button v-if="c.serie" class="boton sec" type="button" @click="reiniciarSerie(c.serie!)">Reiniciar serie</button>
            <button class="boton sec" type="button" @click="editar(c)">Editar</button>
            <button class="boton sec" type="button" @click="borrar(c.id)">Borrar</button>
          </div>
        </template>
      </div>
      <p v-if="!lista.length" class="meta">Todavía no hay cuentos.</p>
    </div>
  </div>
</template>
