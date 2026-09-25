import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'

import Login from './views/Login.vue'
import Inicio from './views/Inicio.vue'
import Mensajes from './views/Mensajes.vue'
import Recuerdos from './views/Recuerdos.vue'
import Botiquin from './views/Botiquin.vue'
import Multiverso from './views/Multiverso.vue'
import Cupones from './views/Cupones.vue'
import Eventos from './views/Eventos.vue'
import Checkins from './views/Checkins.vue'
import Trivia from './views/Trivia.vue'
import Ruleta from './views/Ruleta.vue'
import Capsulas from './views/Capsulas.vue'
import Lugares from './views/Lugares.vue'
import Extras from './views/Extras.vue'
import Cuentos from './views/Cuentos.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/', component: Inicio },
    { path: '/mensajes', component: Mensajes },
    { path: '/recuerdos', component: Recuerdos },
    { path: '/botiquin', component: Botiquin },
    { path: '/multiverso', component: Multiverso },
    { path: '/cupones', component: Cupones },
    { path: '/eventos', component: Eventos },
    { path: '/checkins', component: Checkins },
    { path: '/trivia', component: Trivia },
    { path: '/ruleta', component: Ruleta },
    { path: '/capsulas', component: Capsulas },
    { path: '/lugares', component: Lugares },
    { path: '/extras', component: Extras },
    { path: '/cuentos', component: Cuentos },
  ],
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  if (!data.session && to.path !== '/login') return '/login'
  if (data.session && to.path === '/login') return '/'
})

createApp(App).use(router).mount('#app')
