<script setup lang="ts">
import { ref, onMounted } from 'vue';
import client from '../api/client';
import { 
  UsersIcon, 
  TicketIcon, 
  TrendingUpIcon, 
  ArrowUpRightIcon,
  SearchIcon,
  MoreVerticalIcon
} from '../components/icons/LucideIcons';

// Extend icons locally as needed
const stats = ref({
  users: 0,
  activeTicket: 'None',
  isTicketActive: false
});

const recentActivity = ref<any[]>([]);

function timeAgo(date: string | Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

onMounted(async () => {
  try {
    const [usersRes, ticketRes, activityRes] = await Promise.all([
      client.get('/users'),
      client.get('/tickets/config'),
      client.get('/dashboard/activity')
    ]);

    stats.value.users = usersRes.data.length;
    
    if (ticketRes.data) {
      stats.value.activeTicket = ticketRes.data.eventName;
      stats.value.isTicketActive = ticketRes.data.isActive;
    }

    recentActivity.value = activityRes.data;
  } catch (e) {
    console.error(e);
  }
});
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
      <p class="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening with your passes today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Users Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <UsersIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <span class="flex items-center text-xs font-medium text-green-600 py-1 px-2 bg-green-50 rounded-full">
            <ArrowUpRightIcon class="w-3 h-3 mr-1" />
            12%
          </span>
        </div>
        <div class="mt-4">
          <h3 class="text-sm font-medium text-slate-500">Total Users</h3>
          <div class="flex items-baseline space-x-2">
            <p class="text-3xl font-bold text-slate-900">{{ stats.users }}</p>
            <p class="text-xs text-slate-400">vs last month</p>
          </div>
        </div>
      </div>

      <!-- Tickets Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <TicketIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <span v-if="stats.isTicketActive" class="flex items-center text-xs font-medium text-emerald-600 py-1 px-2 bg-emerald-50 rounded-full">
            Active
          </span>
        </div>
        <div class="mt-4">
          <h3 class="text-sm font-medium text-slate-500">Active Campaign</h3>
          <p class="text-xl font-bold text-slate-900 truncate mt-1">{{ stats.activeTicket }}</p>
        </div>
      </div>

      <!-- Growth Card -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
        <div class="flex justify-between items-start">
          <div class="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
            <TrendingUpIcon class="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div class="mt-4">
          <h3 class="text-sm font-medium text-slate-500">Pass Retention</h3>
          <div class="flex items-baseline space-x-2">
            <p class="text-3xl font-bold text-slate-900">94.2%</p>
            <p class="text-xs text-slate-400">Excellent</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 class="text-lg font-bold text-slate-900">Recent Activity</h2>
          <button class="text-indigo-600 font-medium hover:text-indigo-700">View all</button>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in recentActivity" :key="item.id" class="p-5 flex items-center hover:bg-slate-50 transition-colors group">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
              <span class="text-lg">👤</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-slate-900">{{ item.type }}</p>
              <p class="text-slate-500 text-xs mt-0.5">
                {{ item.user }}
                <span v-if="item.points" class="ml-1 text-slate-400">• {{ item.points }} pts</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-slate-400 text-xs">{{ timeAgo(item.time) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-6">
        <div class="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
          <div class="relative z-10">
            <h3 class="text-lg font-bold">New Campaign</h3>
            <p class="text-indigo-100 text-sm mt-1">Ready to launch a new pass campaign?</p>
            <RouterLink to="/tickets" class="mt-4 inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">
              Get Started
            </RouterLink>
          </div>
          <!-- Abstract Background Shape -->
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 mb-4">Support</h3>
          <div class="space-y-3">
            <a href="#" class="flex items-center text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              <span class="mr-3">📚</span> Documentation
            </a>
            <a href="#" class="flex items-center text-sm text-slate-600 hover:text-indigo-600 transition-colors">
              <span class="mr-3">💬</span> Community Forum
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
