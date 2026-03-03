<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import client from '../api/client';
import { 
  SearchIcon, 
  Trash2Icon, 
  UserPlusIcon, 
  MailIcon, 
  AwardIcon, 
  MoreVerticalIcon,
  ChevronRightIcon,
  CopyIcon
} from '../components/icons/LucideIcons';

const users = ref<any[]>([]);
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const searchQuery = ref('');
const isLoading = ref(false);

const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const res = await client.get('/users');
        users.value = res.data;
    } finally {
        isLoading.value = false;
    }
};

const registerUser = async () => {
    if (!email.value || !firstName.value || !lastName.value) return;
    try {
        await client.post('/users/register', { 
            email: email.value,
            fullname: `${firstName.value} ${lastName.value}`.trim()
        });
        email.value = '';
        firstName.value = '';
        lastName.value = '';
        fetchUsers();
    } catch (e: any) {
        alert(e.response?.data?.message || 'Failed to register user');
    }
};

const deleteUser = async (id: string) => {
    if(!confirm('This will permanently delete the user and their associated passes. Continue?')) return;
    try {
        await client.delete(`/users/${id}`);
        fetchUsers();
    } catch (e) {
        alert('Failed to delete user');
    }
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback could be added here
};

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    return users.value.filter(u => 
        u.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        u.fullname?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

onMounted(fetchUsers);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Users</h1>
        <p class="text-slate-500 text-sm mt-1 text-center sm:text-left">Manage your community and their digital passes.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1 sm:w-64">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search users..." 
            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>
        <button 
          @click="fetchUsers" 
          class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Registration Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div class="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
      <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <UserPlusIcon class="w-5 h-5 mr-2 text-indigo-600" />
        Quick Register
      </h2>
      <div class="flex flex-col space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="relative">
            <input 
              v-model="firstName" 
              type="text" 
              placeholder="First Name" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:bg-white transition-all" 
            />
          </div>
          <div class="relative">
            <input 
              v-model="lastName" 
              type="text" 
              placeholder="Last Name" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="Enter user email address" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:bg-white transition-all" 
            />
          </div>
          <button 
            @click="registerUser" 
            class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            :disabled="!email || !firstName || !lastName"
          >
            Add User
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table (Desktop) / Cards (Mobile) -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Points</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Passes</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {{ (user.fullname || user.email).charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 leading-none">{{ user.fullname || 'Default User' }}</p>
                    <p class="text-xs text-slate-400 mt-1">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  <AwardIcon class="w-3 h-3 mr-1" />
                  {{ user.points }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <div v-if="user.googlePassId" class="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-md">
                    <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    <span class="text-[10px] font-bold text-slate-600 uppercase">Google</span>
                  </div>
                  <div v-if="user.applePassId" class="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-md">
                    <span class="w-2 h-2 rounded-full bg-slate-900 mr-2"></span>
                    <span class="text-[10px] font-bold text-slate-600 uppercase">Apple</span>
                  </div>
                  <span v-if="!user.googlePassId && !user.applePassId" class="text-slate-300 text-xs italic">No passes</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="copyToClipboard(user.email)" title="Copy Email" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <CopyIcon class="w-4 h-4" />
                  </button>
                  <button @click="deleteUser(user.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                  <button class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <MoreVerticalIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0 && !isLoading">
              <td colspan="4" class="px-6 py-20 text-center">
                <p class="text-slate-400">No users found matching your search.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="md:hidden divide-y divide-slate-100">
        <div v-for="user in filteredUsers" :key="user.id" class="p-4 flex items-center justify-between hover:bg-slate-50">
          <div class="flex items-center">
             <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
              {{ (user.fullname || user.email).charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-slate-900 text-sm">{{ user.fullname || 'Default User' }}</p>
              <p class="text-xs text-slate-400">{{ user.email }}</p>
              <div class="flex gap-1 mt-1">
                <span class="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">{{ user.points }} pts</span>
                <span v-if="user.googlePassId" class="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded">G</span>
                <span v-if="user.applePassId" class="text-[10px] text-slate-600 font-bold bg-slate-100 px-1 rounded">A</span>
              </div>
            </div>
          </div>
          <button @click="deleteUser(user.id)" class="p-2 text-slate-400">
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
