<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

// Inventario mínimo del documento de diseño: qué hay y cuánto dura.
const MINIMOS = [
  { tabla: 'mensajes', nombre: 'Mensajes del día', minimo: 60, filtro: (q: any) => q.is('visto_en', null) },
  { tabla: 'recuerdos', nombre: 'Fotos con texto', minimo: 40 },
  { tabla: 'botiquin', nombre: 'Contenido del botiquín', minimo: 16 },
  { tabla: 'cuentos', nombre: 'Cuentos para Modo dormir', minimo: 4 },
  { tabla: 'multiverso', nombre: 'Variantes del Multiverso', minimo: 100, filtro: (q: any) => q.is('descubierto_en', null) },
  { tabla: 'trivia', nombre: 'Preguntas de trivia', minimo: 50 },
  { tabla: 'ruleta', nombre: 'Premios de ruleta', minimo: 12 },
  { tabla: 'respuestas_checkin', nombre: 'Respuestas al check-in', minimo: 15 },
  { tabla: 'cupones', nombre: 'Cupones', minimo: 10, filtro: (q: any) => q.is('comprado_en', null) },
  { tabla: 'eventos', nombre: 'Eventos de calendario', minimo: 6 },
  { tabla: 'capsulas', nombre: 'Cápsulas del tiempo', minimo: 4 },
  { tabla: 'lugares', nombre: 'Nuestros lugares', minimo: 3 },
  { tabla: 'diccionario', nombre: 'Palabras del diccionario', minimo: 10 },
  { tabla: 'capitulos', nombre: 'Capítulos del drama', minimo: 4 },
]

const inventario = ref<{ nombre: string; minimo: number; hay: number }[]>([])
const ultimoCheckin = ref<any>(null)
const proximoEvento = ref<any>(null)
const ultimaPublicacion = ref<string | null>(null)

onMounted(async () => {
  inventario.value = await Promise.all(
    MINIMOS.map(async (m) => {
      let q = supabase.from(m.tabla).select('*', { count: 'exact', head: true })
      if (m.filtro) q = m.filtro(q)
      const { count } = await q
      return { nombre: m.nombre, minimo: m.minimo, hay: count ?? 0 }
    }),
  )
  const { data: c } = await supabase.from('checkins').select('*').order('creado_en', { ascending: false }).limit(1).maybeSingle()
  ultimoCheckin.value = c
  const { data: m } = await supabase.from('mensajes').select('creado_en').order('creado_en', { ascending: false }).limit(1).maybeSingle()
  ultimaPublicacion.value = m?.creado_en ?? null
  const { data: ev } = await supabase.from('eventos').select('*')
  const hoy = new Date().toISOString().slice(5, 10)
  proximoEvento.value = (ev ?? [])
    .map((e: any) => ({ ...e, mmdd: e.fecha.slice(5) }))
    .sort((a: any, b: any) => ((a.mmdd >= hoy ? 0 : 1) - (b.mmdd >= hoy ? 0 : 1)) || a.mmdd.localeCompare(b.mmdd))[0] ?? null
})

const mensajesEnCola = () => inventario.value.find((i) => i.nombre === 'Mensajes del día')?.hay ?? 0
const diasDesde = (iso: string | null) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null)
</script>

<template>
  <h1>Panel de publicación</h1>
  <p class="sub">Lo que decide si la app sigue viva.</p>

  <div v-if="inventario.length && mensajesEnCola() < 15" class="aviso">
    Quedan {{ mensajesEnCola() }} mensajes en cola. Bajo 15 la app empieza a repetirse: escribe una tanda.
  </div>

  <div class="grid3">
    <div class="tarjeta">
      <div class="etiqueta">Última publicación</div>
      <div class="numero">{{ diasDesde(ultimaPublicacion) ?? '—' }}</div>
      <div class="meta">días atrás · la mascota baja sola si no subes nada</div>
    </div>
    <div class="tarjeta">
      <div class="etiqueta">Su último check-in</div>
      <div class="numero" style="text-transform:capitalize">{{ ultimoCheckin?.emoji ?? '—' }}</div>
      <div class="meta">{{ ultimoCheckin?.texto || 'sin texto' }}</div>
    </div>
    <div class="tarjeta lavanda">
      <div class="etiqueta">Próximo evento</div>
      <div class="numero" style="color:var(--carbon)">{{ proximoEvento?.fecha?.slice(5) ?? '—' }}</div>
      <div class="meta">{{ proximoEvento?.tipo_particula }} · {{ proximoEvento?.mensaje }}</div>
    </div>
  </div>

  <div class="tarjeta">
    <h2>Inventario de contenido</h2>
    <p class="sub" style="margin-bottom:12px">Lo mínimo del documento de diseño. Verde cuando estás cubierto.</p>
    <div class="lista">
      <div v-for="i in inventario" :key="i.nombre" class="item" style="align-items:center">
        <div class="texto"><strong>{{ i.nombre }}</strong><div class="meta">{{ i.hay }} de {{ i.minimo }}</div></div>
        <div style="width:200px" class="barra"><div :style="{ width: Math.min(100, (i.hay / i.minimo) * 100) + '%', background: i.hay >= i.minimo ? '#3E8A62' : 'var(--rosa-fuerte)' }"></div></div>
        <span class="pill" :class="i.hay >= i.minimo ? 'ok' : 'warn'">{{ i.hay >= i.minimo ? 'listo' : 'faltan ' + (i.minimo - i.hay) }}</span>
      </div>
    </div>
  </div>
</template>
