<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import client from '../api/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  AwardIcon, 
  SettingsIcon, 
  UserIcon, 
  GiftIcon,
  ChevronRightIcon
} from '../components/icons/LucideIcons';

const userId = ref('');
const points = ref(10);
const logs = ref<any[]>([]);
let scanner: Html5QrcodeScanner | null = null;

const awardPoints = async () => {
    if (!userId.value) return;
    try {
        await client.post('/rewards/award', { userId: userId.value, points: points.value });
        logs.value.unshift({
            id: Date.now(),
            type: 'Credit',
            message: `Awarded ${points.value} points to`,
            user: userId.value,
            time: new Date().toLocaleTimeString(),
            amount: `+${points.value}`,
            isCredit: true
        });
        userId.value = '';
    } catch(e) {
        alert('Failed to award points');
    }
};

const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
        const res = await client.post('/rewards/redeem', { token: decodedText });
        logs.value.unshift({
            id: Date.now(),
            type: 'Redemption',
            message: `Redeemed for user`,
            user: res.data.id,
            time: new Date().toLocaleTimeString(),
            amount: `New bal: ${res.data.points}`,
            isCredit: false
        });
        alert(`Redemption successful! New balance: ${res.data.points}`);
    } catch (e: any) {
        alert('Redemption failed: ' + (e.response?.data?.message || e.message));
    }
};

onMounted(() => {
    scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );
    scanner.render(onScanSuccess, (error) => {});
});

onUnmounted(() => {
    if(scanner) {
        scanner.clear();
    }
});
</script>

<template>
  <div class="space-y-8 animate-in slide-in-from-right-4 duration-500">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Rewards & Redemptions</h1>
      <p class="text-slate-500 text-sm mt-1">Manage user points and scan passes for rewards.</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full items-start">
      <!-- Scanner & Manual Award -->
      <div class="xl:col-span-4 space-y-6">
        <!-- Manual Award -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <AwardIcon class="w-5 h-5 mr-2 text-amber-500" />
            Manual Credit
          </h2>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">User UUID</label>
              <div class="relative">
                <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="userId" placeholder="Paste user ID..." class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points to Award</label>
              <div class="flex items-center space-x-3">
                <input v-model.number="points" type="number" class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" />
                <button 
                  @click="awardPoints" 
                  class="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95 disabled:opacity-50"
                  :disabled="!userId"
                >
                  Credit
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scanner -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 relative">
          <div class="absolute inset-0 bg-indigo-600/5 pointer-events-none"></div>
          <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center relative">
            <GiftIcon class="w-5 h-5 mr-2 text-indigo-600" />
            Live Redemption
          </h2>
          <div id="reader" class="rounded-xl overflow-hidden border border-slate-200 bg-black shadow-inner"></div>
          <p class="text-xs text-slate-400 text-center mt-4 italic ">Point the camera to a user digital pass QR code.</p>
        </div>
      </div>

      <!-- Transaction Logs -->
      <div class="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 class="font-bold text-slate-900 flex items-center uppercase tracking-wider text-xs">
            <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
            Transaction History
          </h2>
          <button @click="logs = []" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Clear History</button>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div v-if="logs.length === 0" class="h-full flex flex-col items-center justify-center p-12 text-center">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <SettingsIcon class="w-8 h-8 text-slate-200" />
            </div>
            <p class="text-slate-400 text-sm">No transactions yet.</p>
            <p class="text-slate-300 text-xs mt-1">Completed scans and manual awards will appear here.</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="log in logs" :key="log.id" class="p-6 flex items-center hover:bg-slate-50/50 transition-colors">
              <div :class="`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${log.isCredit ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`">
                <AwardIcon v-if="log.isCredit" class="w-5 h-5" />
                <GiftIcon v-else class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-slate-900">{{ log.type }}</p>
                <p class="text-[10px] font-mono text-slate-400 mt-0.5">{{ log.user }}</p>
              </div>
              <div class="text-right">
                <p :class="`text-sm font-bold ${log.isCredit ? 'text-amber-600' : 'text-indigo-600'}`">{{ log.amount }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5 uppercase">{{ log.time }}</p>
              </div>
              <button class="ml-6 flex items-center justify-center w-8 h-8 text-slate-300 hover:text-slate-600 transition-colors">
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";

/* Override default html5-qrcode styles for better integration */
#reader {
  border: none !important;
}
#reader video {
  border-radius: 12px;
}
#reader > div:first-child {
  display: none;
}
button#html5-qrcode-button-camera-start,
button#html5-qrcode-button-camera-stop {
  @apply bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold mt-2 hover:bg-indigo-700 transition-all border-none block mx-auto;
}
</style>
