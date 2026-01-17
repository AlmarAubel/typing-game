import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  description: string;
  cost: number; // in Medals
  icon: string;
  effectType:
    | "xp_boost"
    | "second_chance"
    | "better_packs"
    | "stamina_boost"
    | "tactical_time";
  effectValue: number;
}

export const AVAILABLE_STAFF: StaffMember[] = [
  {
    id: "head_coach",
    name: "Hoofdtrainer",
    role: "Trainer",
    description: "+10% XP na elke sessie",
    cost: 100,
    icon: "👔",
    effectType: "xp_boost",
    effectValue: 0.1,
  },
  {
    id: "keeper_coach",
    name: "Keeperstrainer",
    role: "Trainer",
    description: "1x per wedstrijd 'Tweede Kans' bij een fout antwoord",
    cost: 75,
    icon: "🧤",
    effectType: "second_chance",
    effectValue: 1,
  },
  {
    id: "scout",
    name: "Meester Scout",
    role: "Scout",
    description: "+20% kans op Silver/Gold kaarten in packs",
    cost: 150,
    icon: "🔭",
    effectType: "better_packs",
    effectValue: 0.2,
  },
  {
    id: "physio",
    name: "Piet de Fysio",
    role: "Medisch",
    description: "Spelers herstellen sneller (Toekomstig gebruik)",
    cost: 50,
    icon: "🩹",
    effectType: "stamina_boost",
    effectValue: 1,
  },
  {
    id: "analyst",
    name: "Video Analist",
    role: "Staf",
    description: "+5 seconden denktijd bij moeilijke sommen",
    cost: 200,
    icon: "💻",
    effectType: "tactical_time",
    effectValue: 5,
  },
];

export const useStaffStore = defineStore(
  "voetbal-staff",
  () => {
    const ownedStaffIds = ref<string[]>([]);

    const ownedStaff = computed(() => {
      return AVAILABLE_STAFF.filter((staff) =>
        ownedStaffIds.value.includes(staff.id),
      );
    });

    /**
     * Attempts to hire a staff member by ID and add them to the owned staff list.
     *
     * @param staffId - The ID of the staff member to hire
     * @returns `true` if the staff ID existed and was added; `false` if the ID is invalid or the staff is already owned
     */
    function hireStaff(staffId: string): boolean {
      // Validate staffId exists in AVAILABLE_STAFF
      const staffExists = AVAILABLE_STAFF.some(staff => staff.id === staffId);
      if (!staffExists) {
        return false; // Invalid staff ID
      }
      if (ownedStaffIds.value.includes(staffId)) {
        return false; // Already owned
      }
      ownedStaffIds.value.push(staffId);
      return true;
    }

    function hasStaff(staffId: string): boolean {
      return ownedStaffIds.value.includes(staffId);
    }

    function getStaffEffect(effectType: string): number {
      const staff = ownedStaff.value.find((s) => s.effectType === effectType);
      return staff ? staff.effectValue : 0;
    }

    return {
      ownedStaffIds,
      ownedStaff,
      hireStaff,
      hasStaff,
      getStaffEffect,
      availableStaff: AVAILABLE_STAFF,
    };
  },
  {
    persist: true,
  },
);