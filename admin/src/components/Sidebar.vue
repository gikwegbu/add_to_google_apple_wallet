<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { 
  HomeIcon, 
  UsersIcon, 
  TicketIcon, 
  GiftIcon 
} from '@/components/icons/LucideIcons';

const navItems = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Users', to: '/users', icon: UsersIcon },
  { name: 'Tickets', to: '/tickets', icon: TicketIcon },
  { name: 'Rewards', to: '/rewards', icon: GiftIcon },
];
</script>

<template>
  <aside class="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 ease-in-out">
    <div class="p-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <TicketIcon class="w-5 h-5 text-white" />
        </div>
        <span class="text-xl font-bold text-slate-900 tracking-tight">PassManager</span>
      </div>
    </div>

    <nav class="flex-1 px-4 py-4 space-y-1">
      <RouterLink 
        v-for="item in navItems" 
        :key="item.name"
        :to="item.to"
        class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
        :class="[
          $route.path === item.to 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        ]"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 mr-3 transition-colors duration-200"
          :class="[
            $route.path === item.to ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
          ]"
        />
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-slate-100">
      <div class="flex items-center px-3 py-3 rounded-xl bg-slate-50">
        <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
        <div class="ml-3 overflow-hidden">
          <p class="text-sm font-medium text-slate-900 truncate">Admin User</p>
          <p class="text-xs text-slate-500 truncate">admin@wallet.com</p>
        </div>
      </div>
    </div>
  </aside>
</template>
