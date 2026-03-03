<script setup lang="ts">
import { ref } from 'vue';
import { MenuIcon, XIcon, BellIcon, SearchIcon } from '@/components/icons/LucideIcons';

defineEmits(['toggleMobileMenu']);

const searchQuery = ref('');
</script>

<template>
  <header class="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Left: Mobile menu button & Search -->
        <div class="flex items-center flex-1">
          <button 
            type="button" 
            class="lg:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none"
            @click="$emit('toggleMobileMenu')"
          >
            <MenuIcon class="h-6 w-6" />
          </button>

          <div class="ml-4 lg:ml-0 flex-1 max-w-md relative hidden sm:block">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon class="h-4 w-4 text-slate-400" />
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search anything..." 
              class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-4">
          <button class="p-2 text-slate-400 hover:text-slate-600 relative">
            <BellIcon class="h-5 w-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div class="h-8 w-px bg-slate-200 mx-2"></div>
          
          <div class="flex items-center space-x-3">
            <span class="hidden md:block text-sm font-medium text-slate-700 uppercase tracking-wider">Production</span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
