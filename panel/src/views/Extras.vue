<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

// Diccionario, k-drama episódico y easter eggs de texto, en una sola vista.
const diccionario = ref<any[]>([])
const palabra = ref(''); const definicion = ref(''); const ejemplo = ref('')

const capitulos = ref<any[]>([])
const capTitulo = ref(''); const capTexto = ref(''); const capFecha = ref('')

const chiste = ref('')
const acuerdo = ref('')
const nombre = ref('')
const fechaInicio = ref('')
const guardado = ref('')

async function cargar() {
  diccionario.value = (await supabase.from('diccionario').select('*').order('palabra')).data ?? []
  capitulos.value = (await supabase.from('capitulos').select('*').order('numero')).data ?? []
  const { data: cfg } = await supabase.from('config').select('clave, valor').in('clave', ['chiste_bazinga', 'acuerdo_relacion', 'nombre_ella', 'fecha_inicio'])
  for (const r of cfg ?? []) {
    if (r.clave === 'chiste_bazinga') chiste.value = String(r.valor)
    if (r.clave === 'acuerdo_relacion') acuerdo.value = (r.valor as string[]).join('\n')
    if (r.clave === 'nombre_ella') nombre.value = String(r.valor)
    if (r.clave === 'fecha_inicio') fechaInicio.value = String(r.valor)
  }
}
onMounted(cargar)

async function agregarPalabra() {
  await supabase.from('diccionario').insert({ palabra: palabra.value.trim(), definicion: definicion.value.trim(), ejemplo: ejemplo.value.trim() || null })
  palabra.value = ''; definicion.value = ''; ejemplo.value = ''
  await cargar()
}
async function agregarCapitulo() {
  const numero = (capitulos.value.at(-1)?.numero ?? 0) + 1
  await supabase.from('capitulos').insert({ numero, titulo: capTitulo.value.trim(), texto: capTexto.value.trim(), publica_en: new Date(capFecha.value || Date.now()).toISOString() })
  capTitulo.value = ''; capTexto.value = ''; capFecha.value = ''
  await cargar()
}
async function borrarPalabra(id: string) {
  await supabase.from('diccionario').delete().eq('id', id)
  await cargar()
}
const editandoPalabraId = ref<string | null>(null)
const editPalabra = ref(''); const editDefinicion = ref(''); const editEjemplo = ref('')
function editarPalabra(d: any) {
  editandoPalabraId.value = d.id
  editPalabra.value = d.palabra
  editDefinicion.value = d.definicion
  editEjemplo.value = d.ejemplo ?? ''
}
function cancelarEdicionPalabra() { editandoPalabraId.value = null }
async function guardarEdicionPalabra(id: string) {
  await supabase.from('diccionario').update({ palabra: editPalabra.value.trim(), definicion: editDefinicion.value.trim(), ejemplo: editEjemplo.value.trim() || null }).eq('id', id)
  editandoPalabraId.value = null
  await cargar()
}

async function borrarCapitulo(id: string) {
  await supabase.from('capitulos').delete().eq('id', id)
  await cargar()
}
const editandoCapituloId = ref<string | null>(null)
const editCapTitulo = ref(''); const editCapTexto = ref(''); const editCapFecha = ref('')
function editarCapitulo(c: any) {
  editandoCapituloId.value = c.id
  editCapTitulo.value = c.titulo
  editCapTexto.value = c.texto
  editCapFecha.value = c.publica_en ? c.publica_en.slice(0, 16) : ''
}
function cancelarEdicionCapitulo() { editandoCapituloId.value = null }
async function guardarEdicionCapitulo(id: string) {
  await supabase.from('capitulos').update({ titulo: editCapTitulo.value.trim(), texto: editCapTexto.value.trim(), publica_en: new Date(editCapFecha.value || Date.now()).toISOString() }).eq('id', id)
  editandoCapituloId.value = null
  await cargar()
}

async function guardarConfig() {
  await supabase.from('config').upsert([
    { clave: 'chiste_bazinga', valor: chiste.value },
    { clave: 'acuerdo_relacion', valor: acuerdo.value.split('\n').map((l) => l.trim()).filter(Boolean) },
    { clave: 'nombre_ella', valor: nombre.value },
    { clave: 'fecha_inicio', valor: fechaInicio.value },
  ])
  guardado.value = 'Guardado.'
  setTimeout(() => (guardado.value = ''), 2000)
}
</script>

<template>
  <h1>Extras</h1>
  <p class="sub">Diccionario, el drama por capítulos y los easter eggs que no se anuncian.</p>

  <div class="grid2">
    <form class="tarjeta" @submit.prevent="guardarConfig">
      <h2>Ajustes</h2>
      <label>Su nombre</label><input v-model="nombre" />
      <label>Fecha de inicio (contador de días)</label><input v-model="fechaInicio" type="date" />
      <label>Chiste del Bazinga (toque largo en el saludo de Inicio)</label><input v-model="chiste" />
      <label>Acuerdo de relación (una cláusula por línea)</label><textarea v-model="acuerdo"></textarea>
      <div class="acciones"><button class="boton">Guardar</button><span class="meta" style="align-self:center">{{ guardado }}</span></div>
    </form>

    <form class="tarjeta lavanda" @submit.prevent="agregarPalabra">
      <h2>Nuestro diccionario</h2>
      <label>Palabra</label><input v-model="palabra" required />
      <label>Definición (tono académico)</label><textarea v-model="definicion" required style="min-height:80px"></textarea>
      <label>Ejemplo de uso</label><input v-model="ejemplo" />
      <div class="acciones"><button class="boton">Agregar entrada</button></div>
      <div class="lista" style="margin-top:14px">
        <div v-for="d in diccionario" :key="d.id" class="item">
          <template v-if="editandoPalabraId === d.id">
            <form class="texto" style="width:100%" @submit.prevent="guardarEdicionPalabra(d.id)">
              <input v-model="editPalabra" required />
              <textarea v-model="editDefinicion" required style="margin-top:6px"></textarea>
              <input v-model="editEjemplo" style="margin-top:6px" />
              <div class="acciones" style="margin-top:8px">
                <button class="boton" type="submit">Guardar</button>
                <button class="boton sec" type="button" @click="cancelarEdicionPalabra">Cancelar</button>
              </div>
            </form>
          </template>
          <template v-else>
            <div class="texto"><strong>{{ d.palabra }}</strong><div class="meta">{{ d.definicion }}</div></div>
            <div class="fila" style="gap:6px">
              <button class="boton sec" type="button" @click="editarPalabra(d)">Editar</button>
              <button class="boton sec" type="button" @click="borrarPalabra(d.id)">Borrar</button>
            </div>
          </template>
        </div>
      </div>
    </form>
  </div>

  <form class="tarjeta" @submit.prevent="agregarCapitulo">
    <h2>Nuestro drama · capítulo {{ (capitulos.at(-1)?.numero ?? 0) + 1 }}</h2>
    <p class="sub" style="margin-bottom:8px">Un capítulo por semana, con cliffhanger. Ella solo ve los ya publicados.</p>
    <div class="grid2">
      <div><label>Título</label><input v-model="capTitulo" required /><label>Se publica el</label><input v-model="capFecha" type="datetime-local" /></div>
      <div><label>Texto</label><textarea v-model="capTexto" required style="min-height:200px"></textarea></div>
    </div>
    <div class="acciones"><button class="boton">Guardar capítulo</button></div>
    <div class="lista" style="margin-top:14px">
      <div v-for="c in capitulos" :key="c.id" class="item" style="align-items:center">
        <template v-if="editandoCapituloId === c.id">
          <form class="texto" style="width:100%" @submit.prevent="guardarEdicionCapitulo(c.id)">
            <input v-model="editCapTitulo" required />
            <input v-model="editCapFecha" type="datetime-local" style="margin-top:6px" />
            <textarea v-model="editCapTexto" required style="margin-top:6px;min-height:160px"></textarea>
            <div class="acciones" style="margin-top:8px">
              <button class="boton" type="submit">Guardar</button>
              <button class="boton sec" type="button" @click="cancelarEdicionCapitulo">Cancelar</button>
            </div>
          </form>
        </template>
        <template v-else>
          <div class="texto"><strong>{{ c.numero }}. {{ c.titulo }}</strong><div class="meta">{{ new Date(c.publica_en).toLocaleDateString('es-CL') }}</div></div>
          <span class="pill" :class="{ ok: c.leido_en }">{{ c.leido_en ? 'leído' : new Date(c.publica_en) <= new Date() ? 'publicado' : 'programado' }}</span>
          <div class="fila" style="gap:6px">
            <button class="boton sec" type="button" @click="editarCapitulo(c)">Editar</button>
            <button class="boton sec" type="button" @click="borrarCapitulo(c.id)">Borrar</button>
          </div>
        </template>
      </div>
    </div>
  </form>
</template>
