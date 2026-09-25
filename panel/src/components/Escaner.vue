<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

// Escáner de QR con la cámara del navegador. Emite el token del cupón.
const emit = defineEmits<{ (e: 'token', token: string): void }>()
const id = 'lector-qr-' + Math.random().toString(36).slice(2, 7)
const error = ref('')
let lector: Html5Qrcode | null = null

onMounted(async () => {
  try {
    lector = new Html5Qrcode(id)
    await lector.start({ facingMode: 'environment' }, { fps: 8, qrbox: 220 }, (texto) => {
      const m = texto.match(/^palomita:cupon:([a-f0-9]+)$/i)
      if (m) { emit('token', m[1]); lector?.pause(true) }
    }, () => {})
  } catch (e: any) {
    error.value = 'No pude abrir la cámara. Escribe el código a mano.'
  }
})
onBeforeUnmount(() => { lector?.stop().catch(() => {}) })
</script>

<template>
  <div :id="id" style="width:100%;max-width:320px;border-radius:16px;overflow:hidden"></div>
  <p v-if="error" class="meta">{{ error }}</p>
</template>
