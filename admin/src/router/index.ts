import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import TicketConfig from '../views/TicketConfig.vue'
import Rewards from '../views/Rewards.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketConfig,
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: Rewards,
    },
  ],
})

export default router
