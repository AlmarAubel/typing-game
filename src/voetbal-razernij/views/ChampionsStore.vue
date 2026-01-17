<template>
  <div class="champions-store min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-bold text-yellow-300 mb-4 drop-shadow-lg">
          🏆 Champions Store
        </h1>
        <p class="text-xl text-white/80 max-w-2xl mx-auto">
          Gebruik je Champions Medals om exclusieve stafleden en upgrades te
          kopen voor je team!
        </p>

        <!-- Wallet -->
        <div
          class="mt-8 bg-black/40 backdrop-blur rounded-full px-8 py-3 inline-flex items-center gap-4 text-3xl font-black text-yellow-400 border-2 border-yellow-500/50"
        >
          <span>{{ tournamentStore.totalMedals }}</span>
          <span>🥇</span>
        </div>
      </header>

      <!-- Staff Section -->
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span class="text-4xl">👔</span> Technische Staf
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="staff in staffStore.availableStaff"
            :key="staff.id"
            class="staff-card group relative"
            :class="{
              owned: staffStore.hasStaff(staff.id),
              'can-afford':
                !staffStore.hasStaff(staff.id) &&
                tournamentStore.totalMedals >= staff.cost,
            }"
          >
            <!-- Owned Overlay -->
            <div
              v-if="staffStore.hasStaff(staff.id)"
              class="absolute inset-0 bg-green-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl border-4 border-green-500"
            >
              <span class="text-6xl mb-4 animate-bounce">✅</span>
              <span class="text-2xl font-bold text-white">In Dienst</span>
            </div>

            <!-- Card Content -->
            <div
              class="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 h-full flex flex-col"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="text-5xl bg-white/10 p-4 rounded-xl">
                  {{ staff.icon }}
                </div>
                <div class="text-right">
                  <div class="text-sm uppercase text-white/50 font-bold">
                    {{ staff.role }}
                  </div>
                  <div
                    class="text-2xl font-black flex items-center justify-end gap-1"
                    :class="
                      tournamentStore.totalMedals >= staff.cost
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    "
                  >
                    {{ staff.cost }} <span>🥇</span>
                  </div>
                </div>
              </div>

              <h3 class="text-2xl font-bold text-white mb-2">
                {{ staff.name }}
              </h3>
              <p class="text-white/70 mb-6 flex-grow">
                {{ staff.description }}
              </p>

              <button
                @click="buyStaff(staff)"
                :disabled="
                  staffStore.hasStaff(staff.id) ||
                  tournamentStore.totalMedals < staff.cost
                "
                class="w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95"
                :class="
                  staffStore.hasStaff(staff.id)
                    ? 'hidden'
                    : tournamentStore.totalMedals >= staff.cost
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:shadow-yellow-500/50'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                "
              >
                {{
                  staffStore.hasStaff(staff.id)
                    ? "Al gekocht"
                    : tournamentStore.totalMedals >= staff.cost
                      ? "Nu Inhuren"
                      : "Te weinig Medals"
                }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Coming Soon -->
      <section class="opacity-50 grayscale">
        <h2 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span class="text-4xl">🏟️</span> Stadion Upgrades (Binnenkort)
        </h2>
        <div
          class="bg-white/5 rounded-2xl p-8 border border-white/10 text-center"
        >
          <p class="text-xl text-white/60">
            Speel meer toernooien om toekomstige upgrades te ontgrendelen...
          </p>
        </div>
      </section>

      <!-- Close Button -->
      <div class="fixed bottom-8 right-8">
        <button
          @click="router.back()"
          class="bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-xl hover:bg-gray-100 transition-colors"
        >
          <span>🔙</span> Terug
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useTournamentStore } from "../stores/tournament";
import { useStaffStore, type StaffMember } from "../stores/staff";

const router = useRouter();
const tournamentStore = useTournamentStore();
const staffStore = useStaffStore();

function buyStaff(staff: StaffMember) {
  // Check affordability without spending first
  if (tournamentStore.totalMedals < staff.cost) {
    alert("Niet genoeg Medals!");
    return;
  }
  
  // Try to hire staff first
  if (staffStore.hireStaff(staff.id)) {
    // Only spend medals if hire was successful
    tournamentStore.spendMedals(staff.cost);
    alert(`${staff.name} is nu in dienst!`);
  } else {
    // Staff already owned or invalid ID
    alert("Deze staf is al in dienst of ongeldig!");
  }
}
</script>

<style scoped>
.champions-store {
  background: radial-gradient(circle at top, #1e3a8a 0%, #0f172a 100%);
}
</style>
