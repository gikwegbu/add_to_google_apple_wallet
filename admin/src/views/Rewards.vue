<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import client from '../api/client';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  AwardIcon, 
  SettingsIcon, 
  UserIcon, 
  GiftIcon,
  ChevronRightIcon,
  CameraIcon,
  SearchIcon
} from '../components/icons/LucideIcons';
import { computed } from 'vue';

const userId = ref('');
const points = ref(10);
const redemptionPoints = ref(10);
const logs = ref<any[]>([]);
const searchQuery = ref('');
const scanMode = ref<'camera' | 'upload'>('camera');
const isCameraActive = ref(false);
let html5QrCode: Html5Qrcode | null = null;

const fetchTransactions = async () => {
    try {
        const res = await client.get('/rewards/transactions');
        logs.value = res.data;
    } catch (e) {
        console.error('Failed to fetch transactions', e);
    }
};

const awardPoints = async () => {
    if (!userId.value) return;
    try {
        await client.post('/rewards/award', { userId: userId.value, points: points.value });
        console.log('Manual Credit successful');
        await fetchTransactions();
        userId.value = '';
    } catch(e: any) {
        alert('Failed to award points: ' + (e.response?.data?.message || e.message));
    }
};

const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    // Auto-stop camera on success
    if (isCameraActive.value) {
        await stopCamera();
    }

    try {
        const res = await client.post('/rewards/redeem', { 
            token: decodedText,
            points: redemptionPoints.value 
        });
        console.log('Redemption response:', res.data);
        await fetchTransactions();
        alert(`Redemption successful! New balance: ${res.data.points}`);
    } catch (e: any) {
        alert('Redemption failed: ' + (e.response?.data?.message || e.message));
    }
};

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  if (!file) return;

  const fileScanner = new Html5Qrcode("reader");
  
  try {
    const decodedText = await fileScanner.scanFile(file, true);
    await onScanSuccess(decodedText, null);
  } catch (err) {
    alert("Error scanning file: " + err);
  } finally {
    fileScanner.clear();
  }
};

const startCamera = async () => {
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }
    
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            (errorMessage) => { /* quiet error */ }
        );
        isCameraActive.value = true;
    } catch (err) {
        alert("Unable to start camera: " + err);
    }
};

const stopCamera = async () => {
    if (html5QrCode && isCameraActive.value) {
        try {
            await html5QrCode.stop();
            isCameraActive.value = false;
        } catch (err) {
            console.error("Error stopping camera", err);
        }
    }
};

const filteredLogs = computed(() => {
    if (!searchQuery.value) return logs.value;
    const query = searchQuery.value.toLowerCase();
    return logs.value.filter(log => 
        log.user?.fullname?.toLowerCase().includes(query) ||
        log.user?.email?.toLowerCase().includes(query) ||
        log.userId?.toLowerCase().includes(query)
    );
});

watch(scanMode, (newMode) => {
    if (newMode === 'upload') {
        stopCamera();
    }
});

onMounted(() => {
    fetchTransactions();
});

onUnmounted(() => {
    stopCamera();
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
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Email or UUID</label>
              <div class="relative">
                <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="userId" placeholder="Enter email or UUID..." class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all" />
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
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div class="absolute inset-0 bg-indigo-600/5 pointer-events-none"></div>
          <div class="p-6 pb-0">
            <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center relative">
              <GiftIcon class="w-5 h-5 mr-2 text-indigo-600" />
              Live Redemption
            </h2>
            
            <!-- Mode Switcher -->
            <div class="flex p-1 bg-slate-100 rounded-xl mb-6 relative">
              <button 
                @click="scanMode = 'camera'"
                :class="`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scanMode === 'camera' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`"
              >
                Camera
              </button>
              <button 
                @click="scanMode = 'upload'"
                :class="`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scanMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`"
              >
                Upload Image
              </button>
            </div>

            <div class="space-y-1.5 mb-6">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Redemption Cost (Points)</label>
              <input v-model.number="redemptionPoints" type="number" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
            </div>
          </div>

          <div class="px-6 pb-6">
            <div v-show="scanMode === 'camera'" class="space-y-4">
              <div id="reader" class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner aspect-square relative flex items-center justify-center">
                <div v-if="!isCameraActive" class="text-center p-6 space-y-4 relative z-10">
                  <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CameraIcon class="w-8 h-8 text-white/40" />
                  </div>
                  <p class="text-sm text-white/60">Camera is currently inactive</p>
                  <button 
                    @click="startCamera" 
                    class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Enable Camera Access
                  </button>
                </div>
              </div>
              
              <div v-if="isCameraActive" class="flex justify-center">
                <button 
                  @click="stopCamera" 
                  class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Stop Camera
                </button>
              </div>
              
              <p class="text-xs text-slate-400 text-center italic">Point the camera to a user digital pass QR code.</p>
            </div>

            <div v-if="scanMode === 'upload'" class="space-y-4">
              <label class="group relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CameraIcon class="w-6 h-6 text-indigo-600" />
                  </div>
                  <p class="text-sm font-bold text-slate-700">Drop QR image here</p>
                  <p class="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">or click to browse</p>
                </div>
                <input type="file" class="hidden" @change="onFileChange" accept="image/*" />
              </label>
              <p class="text-xs text-slate-400 text-center italic">Upload a screenshot or photo of the user's pass.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Logs -->
      <div class="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 class="font-bold text-slate-900 flex items-center uppercase tracking-wider text-xs whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
            Transaction History
          </h2>
          <div class="relative w-full sm:w-64">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by name, email or ID..." 
              class="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
          <button @click="fetchTransactions" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest whitespace-nowrap">Refresh</button>
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
            <div v-for="log in filteredLogs" :key="log.id" class="p-6 flex items-center hover:bg-slate-50/50 transition-colors">
              <div :class="`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${log.type === 'CREDIT' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`">
                <AwardIcon v-if="log.type === 'CREDIT'" class="w-5 h-5" />
                <GiftIcon v-else class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0 mr-4">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ log.user?.fullname || 'Unknown User' }}</p>
                  <span :class="`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${log.type === 'CREDIT' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`">{{ log.type }}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-0.5">
                  <p class="text-[10px] text-slate-500 truncate">{{ log.user?.email }}</p>
                  <span class="hidden sm:inline text-slate-300">•</span>
                  <p class="text-[10px] font-mono text-slate-400 truncate">{{ log.userId }}</p>
                </div>
              </div>
              <div class="text-right whitespace-nowrap">
                <p :class="`text-sm font-bold ${log.type === 'CREDIT' ? 'text-amber-600' : 'text-indigo-600'}`">
                  {{ log.type === 'CREDIT' ? '+' : '-' }}{{ log.points }}
                </p>
                <p class="text-[10px] text-slate-400 mt-0.5 uppercase">{{ new Date(log.createdAt).toLocaleString() }}</p>
              </div>
            </div>
            <div v-if="filteredLogs.length === 0" class="p-12 text-center text-slate-400 text-sm italic">
              No results match your search.
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
  object-fit: cover !important;
}
/* Fixed: Removed restrictive display rules that were hiding permissions */
</style>
