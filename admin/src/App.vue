<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import { 
  HomeIcon, 
  UsersIcon, 
  TicketIcon, 
  GiftIcon,
  XIcon
} from './components/icons/LucideIcons';

const isMobileMenuOpen = ref(false);

const navItems = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Users', to: '/users', icon: UsersIcon },
  { name: 'Tickets', to: '/tickets', icon: TicketIcon },
  { name: 'Rewards', to: '/rewards', icon: GiftIcon },
];

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isMobileMenuOpen" 
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        @click="isMobileMenuOpen = false"
      ></div>
    </Transition>

    <!-- Mobile Sidebar -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside 
        v-if="isMobileMenuOpen" 
        class="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
      >
        <div class="p-6 flex items-center justify-between border-b border-slate-100">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TicketIcon class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-bold text-slate-900 tracking-tight">PassManager</span>
          </div>
          <button @click="isMobileMenuOpen = false" class="p-2 text-slate-400 hover:text-slate-600">
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        
        <nav class="flex-1 px-4 py-6 space-y-1">
          <RouterLink 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.to"
            class="group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200"
            :class="[
              $route.path === item.to 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600'
            ]"
            @click="isMobileMenuOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 mr-4" />
            {{ item.name }}
          </RouterLink>
        </nav>
      </aside>
    </Transition>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <Navbar @toggle-mobile-menu="toggleMobileMenu" />
      
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <RouterView v-slot="{ Component }">
            <Transition
              mode="out-in"
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";

/* Global active link state for Vue Router */
.router-link-active {
  @apply bg-indigo-50 text-indigo-700;
}
.router-link-active svg {
  @apply text-indigo-600;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
}
</style>
