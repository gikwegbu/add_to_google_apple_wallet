<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import client from '../api/client';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
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
const scanMode = ref<'camera' | 'upload'>('camera');
const isCameraActive = ref(false);
let html5QrCode: Html5Qrcode | null = null;

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
            user: res.data.id || 'Unknown',
            time: new Date().toLocaleTimeString(),
            amount: `New bal: ${res.data.points}`,
            isCredit: false
        });
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

watch(scanMode, (newMode) => {
    if (newMode === 'upload') {
        stopCamera();
    }
});

onMounted(() => {
    // We don't auto-start here to ensure user interaction if needed
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
  object-fit: cover !important;
}
/* Fixed: Removed restrictive display rules that were hiding permissions */
</style>
