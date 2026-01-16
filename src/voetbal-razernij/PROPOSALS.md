# Voetbalrazernij Game Mode & Mechanisme Voorstellen

Dit document beschrijft voorstellen voor nieuwe spelmodi en mechanismen voor Voetbalrazernij, gericht op het oefenen van meerdere tafels tegelijk en het verdiepen van de gameplay met team-management elementen.

## 1. Nieuwe Spelmodus: "Champions League" (Multi-Tafel Toernooi)

**Doel:** Het oefenen van meerdere tafels tegelijk in een spannende toernooivorm.

**Concept:**
In plaats van één tafel (één club) te kiezen, selecteert de speler een groep van 3 tot 5 clubs (tafels) om mee te doen aan een toernooi.
De vragen die gesteld worden zijn een mix van de tafels van de geselecteerde clubs.

**Spelverloop:**
*   **Groepsfase:** De speler speelt korte sessies tegen willekeurige tegenstanders. De vragen komen uit de geselecteerde mix.
*   **Knock-out Fase:** Als de speler genoeg vragen goed heeft beantwoord in de groepsfase, gaan ze door naar de kwart-, halve- en finale.
*   **Finale:** Een langere sessie met een hogere moeilijkheidsgraad (snellere timer of moeilijkere sommen).

**Beloning:**
*   Winnaars krijgen een "Champions Cup" trofee voor in hun prijzenkast.
*   Grote hoeveelheid munten/tokens die voor elke club gebruikt kunnen worden.
*   Kans op een "Zeldzaam Spelerspakket" dat spelers van alle deelnemende clubs kan bevatten.

## 2. Gameplay Mechaniek: "De Wedstrijd" (Team vs Team)

**Doel:** De verzamelde spelers en teams daadwerkelijk "gebruiken" in een actieve wedstrijd, waar rekenvaardigheid de uitslag bepaalt.

**Concept:**
Gebruik het team dat is samengesteld in de `TeamBuilder`. De speler kiest een tegenstander (een andere club/tafel, of een 'All-Star' team van de computer).

**Mechanisme:**
Een wedstrijd duurt 90 'minuten' (bijvoorbeeld 2 echte minuten).
*   **Aanval:** Er verschijnt een som. Als de speler deze binnen X seconden goed heeft, schiet zijn team op doel. De kans op een doelpunt hangt af van de *Attack Rating* van zijn voorhoedespelers.
*   **Verdediging:** De tegenstander valt aan! De speler moet snel een som oplossen om de bal af te pakken of de keeper een redding te laten maken. De kans op succes hangt af van de *Defense Rating* van de verdedigers.
*   **Rust:** Halverwege kan de speler wissels toepassen of een "Pep Talk" (power-up) inzetten.

**Strategie:**
*   Het hebben van betere spelers (Goud/Zilver) maakt het makkelijker om te scoren of te verdedigen, zelfs als je net iets langzamer bent met rekenen.

## 3. Toernooi Beloning Systeem: "Champions Medals" 🥇

**Doel:** Directe feedback en uitdaging toevoegen aan toernooiwedstrijden, vergelijkbaar met streak-systeem in normale sessies.

**Probleem:** 
Normale game sessies geven directe feedback via streaks, tickets en munten. In toernooien mis je deze spanning en directe beloning.

**Oplossing - Champions Medals:**
Een apart puntensysteem speciaal voor toernooien met realtime feedback tijdens wedstrijden.

**Hoe werkt het:**
*   **Tijdens Toernooiwedstrijden:**
    *   Correcte antwoorden: +1 Medal
    *   3-streak: +2 Bonus Medals (met visuele feedback!)
    *   5-streak: +5 Bonus Medals + "🔥 Op dreef!" animatie
    *   10-streak: +10 Bonus Medals + "⚡ Onhoudbaar!" effect
*   **Fase Bonussen:**
    *   Groepsfase win: +10 Medals
    *   Kwartfinale win: +20 Medals  
    *   Halve finale win: +30 Medals
    *   Finale win: +50 Medals + 🏆 Champions Cup
*   **Perfecte Wedstrijd Bonus:**
    *   Alle vragen goed in één wedstrijd: +25 Extra Medals

**Visuele Feedback:**
*   Grote "+1 🥇" animaties bij correct antwoord
*   Streak meter die oploopt (net als normale sessie)
*   Medal teller prominent in beeld tijdens toernooi
*   Confetti animatie bij grote bonussen

**Wat kun je met Medals kopen:**
*   **Exclusief voor Medals (niet met normale munten):**
    *   Trainers & Stafleden (zie hieronder)
    *   Special Edition Kits
    *   Stadion Upgrades
    *   "Second Chance" power-ups voor toernooien
*   **Waarde:** 
    *   Maak Medals waardevol - je kan ze NIET verdienen in normale sessies
    *   Geeft spelers motivatie om toernooien te spelen

## 4. Nieuwe Winkel Item: Trainers & Staf (te kopen met Medals)

**Doel:** Medals een waardevol doel geven en passieve bonussen introduceren.

**Concept:**
Spelers kunnen hun verdiende Champions Medals besteden aan het inhuren van trainers en stafleden.

**Soorten Staf (alleen te koop met Medals):**
*   **Hoofdtrainer (100 Medals):** Geeft een permanente XP boost (+10% XP na elke sessie).
*   **Keeperstrainer (75 Medals):** Geeft een "Tweede Kans" mogelijkheid (1x per wedstrijd mag je een fout antwoord corrigeren).
*   **Scout (150 Medals):** Verhoogt de kans op betere kaarten (Silver/Gold) in packs met 20%.
*   **Fysio (50 Medals):** Zorgt dat je spelers niet "moe" worden (als je een vermoeidheidsmechanisme zou toevoegen).
*   **Tactisch Analist (200 Medals):** Geeft je 5 extra seconden denktijd bij moeilijke sommen (7+).

**Visueel:**
*   Trainers verschijnen als kaarten in een "Staf Collectie"
*   Actieve bonussen zichtbaar tijdens gameplay
*   Special animaties wanneer een trainer bonus activeert

## 5. Goodies & Club Upgrades

**Doel:** Visuele progressie en personalisatie van de club.

**Concept:**
Naast spelers kunnen munten ook worden besteed aan het upgraden van het stadion en de faciliteiten.

**Upgrades:**
*   **Stadion Uitbreiding:** Verandert de achtergrond van het spel tijdens een sessie. Van een trapveldje naar een groot verlicht stadion.
*   **Nieuwe Kits/Tenues:** Koop klassieke of speciale shirts voor je team die zichtbaar zijn op de spelerskaarten.
*   **Fan Sfeer:** Koop spandoeken of vuurwerk die afgaan als je een reeks goede antwoorden (streak) haalt.

## Samenvatting van de Verbeterde Loop

1.  **Oefenen (Normale Sessies):** Verdien munten, tokens en basisspelers.
2.  **Toernooi (Champions League - Multi-Tafel):** 
    *   Verdien Champions Medals met streak bonussen
    *   Win bekers en grote geldbedragen
    *   Realtime feedback houdt het spannend
3.  **Team Bouwen:** Stel het beste team samen met verzamelde kaarten.
4.  **Wedstrijd Spelen:** Gebruik je team om moeilijkere tegenstanders te verslaan.
5.  **Investeren met Medals:** 
    *   Koop exclusieve trainers die je helpen beter te worden
    *   Koop stadion upgrades voor visuele progressie
    *   Medals zijn alleen verkrijgbaar via toernooien → motiveert toernooi spelen

## Technische Implementatie Notes

**Champions Medals Tracking:**
```typescript
export interface TournamentState {
  // ... bestaande velden
  medalsEarned: number;
  currentMatchStreak: number;
  perfectMatches: number; // Telt matches waar alles goed was
}

export interface MedalRewards {
  correctAnswer: 1;
  streak3Bonus: 2;
  streak5Bonus: 5;
  streak10Bonus: 10;
  groupWin: 10;
  quarterWin: 20;
  semiWin: 30;
  finalWin: 50;
  perfectMatch: 25;
}
```

**Voortgang Hervatten:**
In VoetbalRazernijLayout of een TournamentHub component:
```typescript
onMounted(() => {
  const tournamentStore = useTournamentStore();
  if (tournamentStore.tournament?.isActive) {
    // Toon "Hervat Toernooi" knop
    // Of navigeer automatisch naar de huidige wedstrijd
  }
});
```
