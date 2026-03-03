<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import client from '../api/client';
import { 
  SaveIcon, 
  CalendarIcon, 
  MapPinIcon, 
  CameraIcon,
  TicketIcon,
  SettingsIcon
} from '../components/icons/LucideIcons';

const form = ref({
    eventName: '',
    description: '',
    imageUrl: '',
    logoUrl: '',
    expirationDate: '',
    eventDate: '',
    backgroundColor: '#4f46e5',
    foregroundColor: '#ffffff',
    totalQuantity: 100,
    eventLocation: '',
    barcodeFormat: 'QR_CODE',
});

const isLoading = ref(false);

onMounted(async () => {
    isLoading.value = true;
    try {
        const res = await client.get('/tickets/config');
        if(res.data) {
            form.value = { 
              ...res.data, 
              expirationDate: res.data.expirationDate?.split('T')[0] || '', 
              eventDate: res.data.eventDate?.split('T')[0] || '',
              backgroundColor: res.data.backgroundColor || '#4f46e5',
              foregroundColor: res.data.foregroundColor || '#ffffff',
            };
        }
    } finally {
        isLoading.value = false;
    }
});

const saveConfig = async () => {
    try {
        await client.post('/tickets/config', form.value);
        alert('Configuration successfully saved to all pass issuers.');
    } catch (e) {
        alert('Failed to save configuration');
    }
};
</script>

<template>
  <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Campaign Designer</h1>
        <p class="text-slate-500 text-sm mt-1">Configure your digital tickets and pass visuals.</p>
      </div>
      <button 
        @click="saveConfig" 
        class="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
      >
        <SaveIcon class="w-4 h-4 mr-2" />
        Save & Deploy
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
      <!-- Configuration Form -->
      <div class="lg:col-span-12 xl:col-span-7 space-y-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 class="font-bold text-slate-900 flex items-center">
              <SettingsIcon class="w-5 h-5 mr-2 text-indigo-600" />
              General Information
            </h2>
          </div>
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Name</label>
                <input v-model="form.eventName" type="text" placeholder="e.g. Summer Music Festival" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo URL</label>
                <div class="relative">
                  <CameraIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input v-model="form.logoUrl" type="text" placeholder="https://..." class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Describe your event or pass benefits..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Location</label>
                <div class="relative">
                  <MapPinIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input v-model="form.eventLocation" type="text" placeholder="e.g. Wembley Stadium, London" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quantity</label>
                <input v-model.number="form.totalQuantity" type="number" placeholder="100" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Hero Image URL</label>
              <input v-model="form.imageUrl" type="text" placeholder="https://..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode Format</label>
              <select v-model="form.barcodeFormat" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all">
                <option value="QR_CODE">QR Code</option>
                <option value="BARCODE_128">Barcode 128</option>
                <option value="PDF_417">PDF 417</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <CalendarIcon class="w-3 h-3 mr-1" />
                  Event Date
                </label>
                <input v-model="form.eventDate" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center text-red-500">
                  <CalendarIcon class="w-3 h-3 mr-1" />
                  Expiry Date
                </label>
                <input v-model="form.expirationDate" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Background Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="form.backgroundColor" type="color" class="h-10 w-20 p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-white" />
                  <span class="text-sm font-mono text-slate-500 uppercase">{{ form.backgroundColor }}</span>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Text/Foreground Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="form.foregroundColor" type="color" class="h-10 w-20 p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-white" />
                  <span class="text-sm font-mono text-slate-500 uppercase">{{ form.foregroundColor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div class="lg:col-span-12 xl:col-span-5 flex flex-col items-center">
        <div class="sticky top-24 w-full">
          <div class="text-center mb-6">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Live Preview</h3>
            <p class="text-xs text-slate-400 mt-1">Real-time visualization of your pass</p>
          </div>

          <!-- Apple Wallet Pass Mockup -->
          <div class="relative mx-auto w-full max-w-[340px] aspect-[1/1.6] rounded-[2.5rem] bg-black p-3 shadow-2xl overflow-hidden ring-4 ring-slate-900">
            <div class="h-full w-full rounded-[2rem] overflow-hidden flex flex-col" :style="{ backgroundColor: form.backgroundColor, color: form.foregroundColor }">
              <!-- Header -->
              <div class="p-5 flex items-start justify-between">
                <div class="flex items-center space-x-2">
                  <img v-if="form.logoUrl" :src="form.logoUrl" class="w-8 h-8 rounded-lg object-contain bg-white" alt="logo" />
                  <div v-else class="w-8 h-8 rounded-lg bg-white/20"></div>
                  <span class="text-xs font-bold">{{ form.eventName || 'Event Name' }}</span>
                </div>
                <div class="text-right">
                  <p class="text-[10px] opacity-70 uppercase font-bold tracking-tighter">Event Ticket</p>
                </div>
              </div>

              <!-- Main Image -->
              <div class="px-5">
                <div class="aspect-[1.5/1] rounded-2xl overflow-hidden bg-white/10 relative group">
                  <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" alt="hero" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/30 italic text-sm">
                    <CameraIcon class="w-8 h-8 mb-2" />
                    Hero Image
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>

              <!-- Content Body -->
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div class="space-y-4">
                  <div>
                    <p class="text-[10px] opacity-70 uppercase font-extrabold tracking-widest">Description</p>
                    <p class="text-sm font-medium line-clamp-2 mt-0.5 leading-snug">{{ form.description || 'Campaign description goes here...' }}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-[10px] opacity-70 uppercase font-extrabold tracking-widest">Date</p>
                      <p class="text-sm font-bold mt-0.5">{{ form.eventDate || 'TBD' }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] opacity-70 uppercase font-extrabold tracking-widest">Seat</p>
                      <p class="text-sm font-bold mt-0.5">GA-102</p>
                    </div>
                  </div>
                </div>

                <!-- Barcode Area -->
                <div class="mt-auto pt-6 flex flex-col items-center">
                   <div class="w-full h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                     <!-- Mock Barcode -->
                     <div class="w-full h-full flex items-center justify-center space-x-0.5 overflow-hidden">
                       <div v-for="i in 30" :key="i" :class="`h-full bg-slate-900 rounded-full`" :style="{ width: Math.random() * 4 + 1 + 'px' }"></div>
                     </div>
                   </div>
                   <p class="text-[10px] mt-2 font-mono uppercase tracking-[0.3em]">USER-ID-PREVIEW</p>
                </div>
              </div>
            </div>
            
            <!-- Mobile Notch Simulation -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
          </div>
          
          <div class="mt-8 flex justify-center space-x-4">
            <div class="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Google Wallet Sync</span>
            </div>
            <div class="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Apple Wallet Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
