/**
 * ============================================================================
 * ⚗️ CHEMISTRY & CHEMICAL PROTECTIVE SUITE (KayetDMS)
 * Comprehensive Industrial HAZMAT Suite, Chemical Database, Suit PPE Selector,
 * Permeation Matrix, Reactivity Checker & Neutralization Stoichiometry
 * ============================================================================
 */

(function () {
  // 1. Comprehensive Industrial Chemical Database
  const CHEMICAL_DATABASE = [
    {
      id: "hf",
      name: "Hydrofluoric Acid (HF)",
      formula: "HF",
      cas: "7664-39-3",
      un: "UN 1790 (liquid) / UN 1052 (anhydrous)",
      category: "Acids",
      molWeight: 20.01,
      density: "1.15 g/cm³ (48%), 0.97 g/cm³ (anhydrous)",
      boilingPt: "19.5 °C (67.1 °F) / 106 °C (48%)",
      freezingPt: "-83.6 °C",
      vaporPressure: "100 kPa @ 20°C (fuming liquid/gas)",
      flashPoint: "Non-flammable",
      autoignition: "N/A",
      nature: "Extremely toxic, corrosive weak acid that penetrates deep tissue",
      ph: "< 1.0 (highly acidic)",
      nfpa: { health: 4, flammability: 0, instability: 1, special: "COR, POI" },
      ghs: ["Corrosion", "Skull and Crossbones", "Health Hazard"],
      ghsStatements: "Fatal if swallowed, in contact with skin or inhaled. Causes severe skin burns and serious eye damage. Damages bones and nerves via systemic hypocalcemia.",
      exposure: { pel: "3 ppm (as F) TWA", tlv: "0.5 ppm TWA / 2 ppm Ceiling", idlh: "30 ppm" },
      suitRecommendations: {
        tankEntry: "Level A (Totally Encapsulated Gas-Tight Suit + Positive Pressure SCBA)",
        lineBreak: "Level A or Level B (Tychem TK/Responder + SCBA with shroud)",
        sampling: "Level C (Tychem F / Responder apron, full-face APR with HF cartridge, heavy Neoprene gloves)",
        spillResponse: "Level A (Full gas-tight HAZMAT suit)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene (Heavy 30 mil)", breakthrough: "240 - 360 min", rating: "Good" },
        { material: "Nitrile Rubber", breakthrough: "< 15 min", rating: "Poor (Do NOT Use)" },
        { material: "Viton", breakthrough: "< 30 min", rating: "Poor (Do NOT Use)" }
      ],
      ppe: {
        respirator: "Positive Pressure SCBA (IDLH / high conc) or Full-face APR with Multi-gas/HF/P100 filter",
        gloves: "Heavy Butyl Rubber or Neoprene outer gloves + Silver Shield inner liner",
        boots: "Heavy Butyl or Neoprene steel-toe HAZMAT chemical boots",
        body: "Tychem TK, Tychem Responder, or Trellchem encapsulated suit"
      },
      materialsAvoid: "Glass, concrete, ceramics, cast iron, titanium (reacts violently). Use Monel 400, Alloy 20, Hastelloy C-276, Teflon, or PVDF.",
      firstAid: "🚨 CRITICAL: Immediate drench wash for 1-2 min, followed by continuous massage of 2.5% CALCIUM GLUCONATE GEL into affected skin until pain stops. For eye splash, irrigate with 1% Calcium Gluconate solution. Immediate hospital transport — HF depletes blood calcium causing fatal cardiac arrhythmias!"
    },
    {
      id: "h2so4",
      name: "Sulfuric Acid (H2SO4 - 98%)",
      formula: "H₂SO₄",
      cas: "7664-93-9",
      un: "UN 1830",
      category: "Acids",
      molWeight: 98.08,
      density: "1.84 g/cm³ (concentrated 98%)",
      boilingPt: "337 °C (639 °F)",
      freezingPt: "10.3 °C (98%)",
      vaporPressure: "< 0.001 kPa @ 20°C",
      flashPoint: "Non-flammable",
      autoignition: "N/A",
      nature: "Extremely corrosive, dense oily liquid with strong oxidizing & dehydrating power",
      ph: "< 0.3",
      nfpa: { health: 3, flammability: 0, instability: 2, special: "W" },
      ghs: ["Corrosion"],
      ghsStatements: "Causes severe skin burns and eye damage. Rapidly dehydrates organic matter with immense exothermic heat.",
      exposure: { pel: "1 mg/m³ TWA", tlv: "0.2 mg/m³ (thoracic particulate)", idlh: "15 mg/m³" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid Splash Tight Encapsulated Suit + SCBA)",
        lineBreak: "Level B or Heavy Chemical Splash Suit with Hood + Face Shield + SCBA",
        sampling: "Level C (PVC/Neoprene acid suit or apron, face shield, heavy butyl gloves)",
        spillResponse: "Level B (Heavy chemical splash suit, resist high dehydration)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "120 - 240 min", rating: "Good (Thick only)" },
        { material: "Natural Rubber", breakthrough: "< 30 min", rating: "Poor" }
      ],
      ppe: {
        respirator: "Full-face APR with Acid Gas / P100 cartridge; SCBA for high mist/confined space",
        gloves: "Heavy Butyl Rubber, Neoprene, or Viton (minimum 20 mil)",
        boots: "Heavy PVC/Neoprene chemical boots with steel toe/shank",
        body: "Acid-resistant PVC, Neoprene, or Tychem splash suit"
      },
      materialsAvoid: "Dilute acid aggressively attacks Carbon Steel! Concentrated (>93%) forms protective FeSO4 on CS at <40°C, but dilute requires Alloy 20, Hastelloy C-276, or lead-lined.",
      firstAid: "Flush skin immediately with copious flowing water for minimum 20 minutes. Note: Water on pure acid generates heat, so use a HIGH-VOLUME deluge shower instantly to overwhelm and quench heat."
    },
    {
      id: "naoh",
      name: "Sodium Hydroxide (Caustic Soda - 50%)",
      formula: "NaOH",
      cas: "1310-73-2",
      un: "UN 1824",
      category: "Bases & Amines",
      molWeight: 40.00,
      density: "1.52 g/cm³ (50% solution)",
      boilingPt: "142 °C (288 °F)",
      freezingPt: "12 °C (50% freezes easily)",
      vaporPressure: "0.2 kPa @ 20°C",
      flashPoint: "Non-flammable",
      autoignition: "N/A",
      nature: "Strong alkali, aggressive saponification of fatty tissues and proteins",
      ph: "14.0",
      nfpa: { health: 3, flammability: 0, instability: 1, special: "ALK" },
      ghs: ["Corrosion"],
      ghsStatements: "Causes severe, irreversible skin burns and permanent blindness. Saponifies tissue without early pain, causing deep penetrating liquefactive necrosis.",
      exposure: { pel: "2 mg/m³ TWA", tlv: "2 mg/m³ Ceiling", idlh: "10 mg/m³" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid splash-tight suit + SCBA)",
        lineBreak: "Level C / Heavy Chemical Splash Suit with Hood + Full Face Shield + Apron",
        sampling: "Level C (Rubber apron, chemical splash goggles, face shield, heavy nitrile gloves)",
        spillResponse: "Level B or Level C (Caustic splash protective coveralls with sealed seams)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Natural Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "PVC", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "< 60 min", rating: "Poor (Degrades in strong alkali)" }
      ],
      ppe: {
        respirator: "Half-mask or full-face APR with N95 or P100 particulate filter for mist; SCBA for vessel entry",
        gloves: "Nitrile, Neoprene, Butyl, or heavy PVC (Avoid Viton!)",
        boots: "PVC or Neoprene chemical safety boots",
        body: "Heavy-duty PVC or Neoprene chemical splash jacket and bib trousers"
      },
      materialsAvoid: "Aluminum, Zinc, Galvanized steel (releases flammable H2 gas violently!). Carbon steel suffers Caustic Stress Corrosion Cracking (CSCC) >46°C unless stress relieved. Use Nickel 200 or 316L SS for high temp.",
      firstAid: "Flush with water continuously for minimum 30 minutes. Caustic feels slippery and penetrates deep — do NOT use vinegar or acid neutralizers on human skin (causes secondary thermal burns)."
    },
    {
      id: "cl2",
      name: "Chlorine (Cl2)",
      formula: "Cl₂",
      cas: "7782-50-5",
      un: "UN 1017",
      category: "Gases & Halogens",
      molWeight: 70.90,
      density: "3.2 g/L (gas, ~2.5x heavier than air)",
      boilingPt: "-34.04 °C (-29.27 °F)",
      freezingPt: "-101.5 °C",
      vaporPressure: "678 kPa @ 20°C (high pressure liquefied gas)",
      flashPoint: "Non-flammable (Powerful Oxidizer)",
      autoignition: "N/A",
      nature: "Greenish-yellow dense toxic gas, severe pulmonary irritant and oxidizer",
      ph: "Acidic in moisture (forms HCl + HOCl)",
      nfpa: { health: 4, flammability: 0, instability: 0, special: "OX" },
      ghs: ["Gas Cylinder", "Skull and Crossbones", "Corrosion", "Environment"],
      ghsStatements: "Fatal if inhaled. Causes severe skin burns and eye damage. Oxidizer may cause or intensify fire.",
      exposure: { pel: "1 ppm Ceiling", tlv: "0.1 ppm TWA / 0.4 ppm STEL", idlh: "10 ppm" },
      suitRecommendations: {
        tankEntry: "Level A (Totally Encapsulated Gas-Tight Suit + SCBA)",
        lineBreak: "Level A (High pressure gas leak risk requires gas-tight protection)",
        sampling: "Level B or Level C (Full-face APR with Chlorine cartridge for low-ppm lab areas)",
        spillResponse: "Level A (Gas-tight encapsulated suit)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "120 - 240 min", rating: "Good" },
        { material: "Nitrile Rubber", breakthrough: "< 15 min", rating: "Poor (Do NOT Use)" }
      ],
      ppe: {
        respirator: "Positive-pressure full-facepiece SCBA or airline respirator with escape bottle",
        gloves: "Butyl Rubber, Viton, or Silver Shield",
        boots: "Chemical-resistant HAZMAT boots integrated with Level A suit",
        body: "Level A totally encapsulating gas-tight suit (NFPA 1991 certified)"
      },
      materialsAvoid: "TITANIUM (ignites and burns spontaneously in dry chlorine!). Carbon steel is fine for dry chlorine <121°C, but wet chlorine requires Hastelloy C-276 or Titanium (wet only).",
      firstAid: "Move victim to fresh air immediately. Keep warm and quiet in semi-upright position. Administer 100% humidified oxygen. Seek immediate medical attention for delayed pulmonary edema (can occur up to 24 hrs later)."
    },
    {
      id: "nh3",
      name: "Anhydrous Ammonia (NH3)",
      formula: "NH₃",
      cas: "7664-41-7",
      un: "UN 1005",
      category: "Gases & Halogens",
      molWeight: 17.03,
      density: "0.86 g/L (gas, lighter than air; cold vapor hugs ground)",
      boilingPt: "-33.34 °C (-28.01 °F)",
      freezingPt: "-77.73 °C",
      vaporPressure: "860 kPa @ 20°C",
      flashPoint: "Flammable Gas (LEL 15% - UEL 28%)",
      autoignition: "651 °C",
      nature: "Pungent alkaline toxic gas, cryogenic liquid causes severe frostbite & alkaline burns",
      ph: "11.6 (1% aqueous solution)",
      nfpa: { health: 3, flammability: 1, instability: 0, special: "N/A" },
      ghs: ["Gas Cylinder", "Corrosion", "Skull and Crossbones", "Environment"],
      ghsStatements: "Fatal if inhaled. Causes severe burns and eye damage. Flammable in high concentrations with oil mists.",
      exposure: { pel: "50 ppm TWA", tlv: "25 ppm TWA / 35 ppm STEL", idlh: "300 ppm" },
      suitRecommendations: {
        tankEntry: "Level A (Totally Encapsulated Gas-Tight Suit + SCBA)",
        lineBreak: "Level A or Level B (Cryogenic splash & vapor protection)",
        sampling: "Level C (Full face APR with Ammonia cartridge + cryogenic/chemical gloves)",
        spillResponse: "Level A (Gas-tight suit with thermal insulation against liquid NH3 cold)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "120 - 240 min", rating: "Good" },
        { material: "Viton", breakthrough: "< 15 min", rating: "Poor (Degrades rapidly in amines/NH3)" },
        { material: "Natural Rubber", breakthrough: "< 30 min", rating: "Poor" }
      ],
      ppe: {
        respirator: "Positive-pressure full-face SCBA (IDLH > 300 ppm); Full-face APR with Green Ammonia canister (<300 ppm)",
        gloves: "Butyl Rubber or heavy Neoprene with thermal cold liner",
        boots: "Chemical and cold-resistant safety boots",
        body: "Level A gas-tight suit certified to NFPA 1991"
      },
      materialsAvoid: "Copper, Brass, Bronze, Zinc (rapid stress corrosion cracking and dissolution!). Carbon steel is standard, but must be PWHT to prevent Ammonia SCC.",
      firstAid: "Immediately flush eyes and skin with water for at least 20 minutes. Do NOT apply dry dressings or ointments. If frozen by liquid NH3, thaw with lukewarm water before removing clothing."
    },
    {
      id: "h2s",
      name: "Hydrogen Sulfide (H2S)",
      formula: "H₂S",
      cas: "7783-06-4",
      un: "UN 1053",
      category: "Gases & Halogens",
      molWeight: 34.08,
      density: "1.4 g/L (~1.19x heavier than air - collects in pits/trenches)",
      boilingPt: "-60.2 °C (-76.4 °F)",
      freezingPt: "-82 °C",
      vaporPressure: "1860 kPa @ 20°C",
      flashPoint: "Flammable Gas (LEL 4% - UEL 44%)",
      autoignition: "260 °C (500 °F)",
      nature: "Extremely toxic, flammable gas. Rotten egg odor deadens olfactory nerve at >100 ppm!",
      ph: "Weakly acidic in water",
      nfpa: { health: 4, flammability: 4, instability: 0, special: "N/A" },
      ghs: ["Gas Cylinder", "Flame", "Skull and Crossbones", "Environment"],
      ghsStatements: "Fatal if inhaled. Extremely flammable gas. Olfactory fatigue occurs rapidly; odor CANNOT be used as a warning!",
      exposure: { pel: "20 ppm Ceiling", tlv: "1 ppm TWA / 5 ppm STEL", idlh: "100 ppm (Knockdown >500 ppm)" },
      suitRecommendations: {
        tankEntry: "Level A or Level B (Supplied air SCBA is absolute requirement)",
        lineBreak: "Level B (Full face SCBA + Anti-static chemical coveralls)",
        sampling: "Closed-loop sample station only; portable H2S monitor + escape SCBA",
        spillResponse: "Level A with intrinsically safe / explosion-proof equipment"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "240 - 480 min", rating: "Good" }
      ],
      ppe: {
        respirator: "Positive-pressure supplied air SCBA or SAR with 10-min escape pack. APR is FORBIDDEN for H2S entry!",
        gloves: "Anti-static Nitrile or Butyl Rubber gloves",
        boots: "Anti-static, ESD-rated chemical safety boots",
        body: "Flame-resistant (FR) anti-static chemical coveralls (Level B/A)"
      },
      materialsAvoid: "Hard carbon and low-alloy steels (causes Sulfide Stress Cracking SSC & HIC). Hardness must be strictly limited to <22 HRC per NACE MR0175 / ISO 15156.",
      firstAid: "RESCUE WITH SCBA ONLY — never enter without air! Move victim to fresh air. If not breathing, start CPR immediately. Administer 100% oxygen via non-rebreather mask. Hospitalization is urgent."
    },
    {
      id: "benzene",
      name: "Benzene",
      formula: "C₆H₆",
      cas: "71-43-2",
      un: "UN 1114",
      category: "Hydrocarbons & Aromatics",
      molWeight: 78.11,
      density: "0.876 g/cm³",
      boilingPt: "80.1 °C (176.2 °F)",
      freezingPt: "5.5 °C",
      vaporPressure: "10 kPa @ 20°C",
      flashPoint: "-11.1 °C (12 °F) - Highly Flammable",
      autoignition: "498 °C",
      nature: "Colorless aromatic hydrocarbon, proven human carcinogen (leukemia)",
      ph: "Neutral (7.0)",
      nfpa: { health: 3, flammability: 3, instability: 0, special: "N/A" },
      ghs: ["Flame", "Health Hazard", "Exclamation Mark"],
      ghsStatements: "May cause cancer (leukemia). May cause genetic defects. Highly flammable liquid and vapor. Causes serious eye irritation.",
      exposure: { pel: "1 ppm TWA / 5 ppm STEL", tlv: "0.5 ppm TWA / 2.5 ppm STEL", idlh: "500 ppm" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid splash tight suit with SCBA, anti-static)",
        lineBreak: "Level C / Level B with full-face APR with Organic Vapor (OV) cartridge",
        sampling: "Level C (Closed sample loop, Silver Shield / Viton gloves, chemical goggles)",
        spillResponse: "Level B with foam suppression"
      },
      permeation: [
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "< 15 min", rating: "Poor (Degrades rapidly)" },
        { material: "Nitrile Rubber", breakthrough: "< 10 min", rating: "Poor (Permeates immediately)" },
        { material: "Neoprene", breakthrough: "< 15 min", rating: "Poor (Do NOT Use)" }
      ],
      ppe: {
        respirator: "Full-face APR with Organic Vapor (OV/P100) cartridge; SCBA for high vapor/entry",
        gloves: "Silver Shield / 4H or Viton gloves ONLY (Standard Nitrile/Neoprene will permeate in minutes!)",
        boots: "Chemical-resistant solvent boots (Viton or specialized polyurethane)",
        body: "Vapor-resistant anti-static chemical coverall (Tychem F or ThermoPro FR)"
      },
      materialsAvoid: "Natural rubber, EPDM, Nitrile (swells and dissolves). Carbon steel and stainless steel are standard.",
      firstAid: "Remove contaminated clothing immediately. Wash skin with soap and warm water. For inhalation, move to fresh air. Oxygen if breathing difficult. Monitor for bone marrow suppression."
    },
    {
      id: "hcl",
      name: "Hydrochloric Acid (Muriatic - 37%)",
      formula: "HCl",
      cas: "7647-01-0",
      un: "UN 1789",
      category: "Acids",
      molWeight: 36.46,
      density: "1.19 g/cm³ (37%)",
      boilingPt: "108.5 °C (37% azeotrope)",
      freezingPt: "-30 °C",
      vaporPressure: "16 kPa @ 20°C (fumes heavily in humid air)",
      flashPoint: "Non-flammable",
      autoignition: "N/A",
      nature: "Aqueous hydrogen chloride, fuming pungent acid that corrodes most common metals",
      ph: "< 0.1",
      nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
      ghs: ["Corrosion", "Exclamation Mark"],
      ghsStatements: "Causes severe skin burns and eye damage. May cause respiratory irritation. Fumes vigorously, creating dense acid mist.",
      exposure: { pel: "5 ppm Ceiling", tlv: "2 ppm Ceiling", idlh: "50 ppm" },
      suitRecommendations: {
        tankEntry: "Level B (Splash tight suit + SCBA)",
        lineBreak: "Level C / Level B with Acid Gas full-face APR or SCBA",
        sampling: "Level C (Acid apron, face shield, Neoprene/Butyl gloves)",
        spillResponse: "Level B (Liquid splash suit with acid gas vapor protection)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "PVC", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" }
      ],
      ppe: {
        respirator: "Full-face APR with Acid Gas cartridge (Cl/HCl); SCBA for confined spaces",
        gloves: "Neoprene, Butyl, or heavy Nitrile gloves",
        boots: "PVC or Neoprene chemical safety boots",
        body: "Acid-resistant PVC or Neoprene chemical suit"
      },
      materialsAvoid: "Standard Carbon Steel and Stainless Steels (304/316 suffer rapid catastrophic pitting and SCC). Use Hastelloy B-3, Tantalum, PTFE-lined pipe, FRP, or glass-lined steel.",
      firstAid: "Flush with water immediately for at least 20 minutes. Move victim to fresh air if mist inhaled. Neutralize splashes on equipment with soda ash or lime."
    },
    {
      id: "hno3",
      name: "Nitric Acid (68%)",
      formula: "HNO₃",
      cas: "7697-37-2",
      un: "UN 2031",
      category: "Acids",
      molWeight: 63.01,
      density: "1.41 g/cm³ (68%)",
      boilingPt: "121 °C (250 °F)",
      freezingPt: "-42 °C",
      vaporPressure: "6 kPa @ 20°C (red/yellow fuming releases toxic NOx)",
      flashPoint: "Non-flammable (Strong Oxidizer)",
      autoignition: "N/A",
      nature: "Violent oxidizer and mineral acid; stains human skin yellow (xanthoproteic reaction)",
      ph: "< 1.0",
      nfpa: { health: 4, flammability: 0, instability: 1, special: "OX" },
      ghs: ["Oxidizer", "Corrosion", "Skull and Crossbones"],
      ghsStatements: "May intensify fire; oxidizer. Causes severe skin burns and eye damage. Fatal if inhaled. Releases brown toxic nitrogen dioxide (NO2) gas on contact with metals.",
      exposure: { pel: "2 ppm TWA", tlv: "2 ppm TWA / 4 ppm STEL", idlh: "25 ppm" },
      suitRecommendations: {
        tankEntry: "Level A (Gas-tight encapsulated suit + SCBA due to toxic NOx gas)",
        lineBreak: "Level B with SCBA and heavy chemical splash suit",
        sampling: "Level C with Acid Gas/NOx APR and Butyl gloves",
        spillResponse: "Level A or Level B (Never use organic sawdust for cleanup!)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "120 - 240 min", rating: "Good" },
        { material: "Neoprene", breakthrough: "< 30 min", rating: "Poor (Degrades with discoloration)" },
        { material: "Nitrile Rubber", breakthrough: "< 15 min", rating: "Poor (Do NOT Use)" }
      ],
      ppe: {
        respirator: "Positive-pressure SCBA for high vapor/spill; APR with Acid Gas / NOx cartridge for low levels",
        gloves: "Butyl Rubber or Silver Shield gloves (Never use Nitrile or Neoprene!)",
        boots: "Heavy PVC or Butyl boots",
        body: "Tychem Responder or heavy Butyl splash suit"
      },
      materialsAvoid: "Sawdust, cellulose, paper, hydrocarbons (causes spontaneous combustion!). Carbon steel is dissolved rapidly; 304L/316L SS is excellent due to passivation; Titanium is good (except red fuming).",
      firstAid: "Flush with water immediately for 20 minutes. If inhaled, treat for pulmonary edema and methemoglobinemia from NOx. Keep victim strictly at rest."
    },
    {
      id: "phenol",
      name: "Phenol (Carbolic Acid)",
      formula: "C₆H₅OH",
      cas: "108-95-2",
      un: "UN 2312 (molten) / UN 1671 (solid)",
      category: "Hydrocarbons & Aromatics",
      molWeight: 94.11,
      density: "1.07 g/cm³",
      boilingPt: "181.7 °C (359 °F)",
      freezingPt: "40.5 °C (kept heated/liquid in refineries)",
      vaporPressure: "0.05 kPa @ 20°C",
      flashPoint: "79 °C (174 °F) - Combustible",
      autoignition: "715 °C",
      nature: "Local anesthetic effect numbs skin while chemical is absorbed rapidly into bloodstream",
      ph: "6.0 (weakly acidic)",
      nfpa: { health: 4, flammability: 2, instability: 0, special: "N/A" },
      ghs: ["Skull and Crossbones", "Corrosion", "Health Hazard"],
      ghsStatements: "Fatal in contact with skin. Toxic if swallowed or inhaled. Causes severe burns. Skin absorption over as little as 60 cm² can cause fatal cardiac/respiratory arrest within minutes.",
      exposure: { pel: "5 ppm TWA (Skin)", tlv: "5 ppm TWA (Skin)", idlh: "250 ppm" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid splash tight suit with SCBA)",
        lineBreak: "Level B or Level C with Polyethylene/Butyl suit and full face shield",
        sampling: "Level C (Butyl gloves, chemical splash apron, full face shield)",
        spillResponse: "Level B with PEG decontamination wash ready"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Silver Shield / 4H", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "120 - 240 min", rating: "Good" },
        { material: "Nitrile Rubber", breakthrough: "< 30 min", rating: "Poor (Degrades)" },
        { material: "Natural Rubber", breakthrough: "< 15 min", rating: "Poor" }
      ],
      ppe: {
        respirator: "Full-face APR with Organic Vapor / P100 cartridge; SCBA for hot liquid transfers",
        gloves: "Butyl Rubber or Silver Shield gloves",
        boots: "Heavy Butyl or Neoprene boots",
        body: "Tychem TK or heavy Butyl splash suit"
      },
      materialsAvoid: "Copper, aluminum alloys. Carbon steel and 304/316 SS are standard.",
      firstAid: "🚨 EMERGENCY: Decontaminate immediately with POLYETHYLENE GLYCOL (PEG 300 or PEG 400) or 70% isopropanol/water solution if available. If not, flush with deluge water for minimum 20 minutes. Phenol deadens nerves so victim may not feel the burning!"
    },
    {
      id: "mea",
      name: "Monoethanolamine (MEA - 15-30%)",
      formula: "C₂H₇NO",
      cas: "141-43-5",
      un: "UN 2491",
      category: "Bases & Amines",
      molWeight: 61.08,
      density: "1.02 g/cm³",
      boilingPt: "170.8 °C (339.4 °F)",
      freezingPt: "10.3 °C",
      vaporPressure: "0.05 kPa @ 20°C",
      flashPoint: "85 °C (185 °F) - Combustible",
      autoignition: "410 °C",
      nature: "Viscous amine solvent used in refinery gas sweetening units (H2S and CO2 removal)",
      ph: "12.0 (strong alkaline)",
      nfpa: { health: 3, flammability: 2, instability: 0, special: "N/A" },
      ghs: ["Corrosion", "Exclamation Mark"],
      ghsStatements: "Harmful if swallowed or in contact with skin. Causes severe skin burns and eye damage. Harmful to aquatic life.",
      exposure: { pel: "3 ppm TWA", tlv: "3 ppm TWA / 6 ppm STEL", idlh: "30 ppm" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid splash tight suit with SCBA)",
        lineBreak: "Level C with face shield, chemical apron, and butyl/nitrile gloves",
        sampling: "Level C (Safety goggles, face shield, heavy nitrile gloves)",
        spillResponse: "Level C or Level B"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Natural Rubber", breakthrough: "120 - 240 min", rating: "Good" },
        { material: "Viton", breakthrough: "< 30 min", rating: "Poor (Degraded by amines)" }
      ],
      ppe: {
        respirator: "Full-face APR with Organic Vapor / Ammonia / Methylamine cartridge; SCBA for vessel entry",
        gloves: "Butyl Rubber or heavy Nitrile (Avoid Viton!)",
        boots: "Chemical-resistant PVC or Neoprene safety boots",
        body: "Chemical splash coveralls or heavy PVC apron"
      },
      materialsAvoid: "Copper, brass, bronze (amines dissolve copper rapidly forming deep blue complex!). Carbon steel experiences Amine Stress Corrosion Cracking (ASCC) unless PWHT stress relieved.",
      firstAid: "Flush skin and eyes immediately with water for at least 20 minutes. Remove contaminated clothes. Seek medical evaluation."
    },
    {
      id: "naocl",
      name: "Sodium Hypochlorite (Bleach 12-15%)",
      formula: "NaOCl",
      cas: "7681-52-9",
      un: "UN 1791",
      category: "Bases & Amines",
      molWeight: 74.44,
      density: "1.2 g/cm³ (15%)",
      boilingPt: "101 °C (decomposes)",
      freezingPt: "-15 °C",
      vaporPressure: "2 kPa @ 20°C",
      flashPoint: "Non-flammable (Strong Oxidizer)",
      autoignition: "N/A",
      nature: "Strong oxidizer and bleaching agent. Contact with acids releases lethal Chlorine gas!",
      ph: "11.5 - 13.0 (alkaline)",
      nfpa: { health: 3, flammability: 0, instability: 1, special: "COR, OX" },
      ghs: ["Corrosion", "Environment"],
      ghsStatements: "Causes severe skin burns and serious eye damage. Very toxic to aquatic life. Contact with acids liberates toxic gas (Cl2).",
      exposure: { pel: "0.5 ppm (as Cl2 equivalent)", tlv: "2 mg/m³ STEL (AIHA WEEL)", idlh: "N/A" },
      suitRecommendations: {
        tankEntry: "Level B (Liquid splash tight suit with SCBA)",
        lineBreak: "Level C with splash face shield and PVC/Nitrile apron",
        sampling: "Level C with chemical splash goggles, face shield, and nitrile gloves",
        spillResponse: "Level C (Ensure acid is NOT nearby!)"
      },
      permeation: [
        { material: "Tychem TK / Responder", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Butyl Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Nitrile Rubber", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Neoprene", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "PVC", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Teflon / PTFE", breakthrough: "> 480 min", rating: "Excellent" },
        { material: "Viton", breakthrough: "> 480 min", rating: "Excellent" }
      ],
      ppe: {
        respirator: "APR with Acid Gas / Chlorine cartridge if fumes present; SCBA for vessel entry",
        gloves: "Nitrile, Neoprene, or PVC heavy chemical gloves",
        boots: "PVC or Rubber chemical safety boots",
        body: "Chemical-resistant splash suit or PVC apron"
      },
      materialsAvoid: "Acids (releases lethal Cl2 gas!), Ammonia (forms explosive/toxic chloramines!), Carbon Steel, Stainless Steel (causes pitting/SCC). Use Titanium, PVDF, or FRP.",
      firstAid: "Flush with water for 15-20 minutes. If mixed with acid and gas inhaled, move to fresh air and administer oxygen."
    }
  ];

  // 2. Pairwise Chemical Reactivity Database (NOAA & NFPA 491M)
  const REACTIVITY_MATRIX = [
    {
      pair: ["hf", "naoh"],
      severity: "danger",
      title: "Extremely Exothermic Acid-Base Neutralization",
      equation: "HF + NaOH ➔ NaF + H₂O  (ΔH = -68 kJ/mol)",
      mechanism: "Rapid, violent heat release. Concentrated solutions will boil instantaneously, creating toxic aerosol spatter of hydrofluoric acid and sodium fluoride.",
      precaution: "Never mix directly. Dilute both streams with large excess of cold water and add alkali slowly with mechanical agitation and chilled cooling coils."
    },
    {
      pair: ["hf", "cl2"],
      severity: "warning",
      title: "Toxic Halogen Mixture / Oxidizing Acid Atmosphere",
      equation: "HF (aq) + Cl₂ (g) ➔ Highly Corrosive Mixed Halogen Gas",
      mechanism: "Increases vapor toxicity drastically. Destroys respiratory tract immediately. Aggressively dissolves standard elastomer gaskets.",
      precaution: "Ensure dedicated relief and flare headers. Level A encapsulated suit required if breach occurs."
    },
    {
      pair: ["h2so4", "naoh"],
      severity: "danger",
      title: "Violent Boiling & Acid-Base Splattering",
      equation: "H₂SO₄ + 2 NaOH ➔ Na₂SO₄ + 2 H₂O  (ΔH = -112 kJ/mol)",
      mechanism: "Extreme exothermic heat release (>112 kJ/mol). Can exceed boiling point (>140°C) within seconds, triggering steam explosion and boiling caustic/acid eruption.",
      precaution: "Requires slow, controlled metering into cold water reservoir with continuous heat exchangers."
    },
    {
      pair: ["h2so4", "benzene"],
      severity: "danger",
      title: "Violent Sulfonation & Charring Oxidation",
      equation: "C₆H₆ + H₂SO₄ (conc) ➔ C₆H₅SO₃H + H₂O",
      mechanism: "Exothermic aromatic sulfonation. In the presence of hot or fuming acid (oleum), violent boiling, polymerization, and foaming fire risk occurs.",
      precaution: "Keep separate in storage and piping. Do not mix hydrocarbon drains with concentrated sulfuric acid drains."
    },
    {
      pair: ["cl2", "nh3"],
      severity: "danger",
      title: "Formation of Shock-Sensitive Explosive Nitrogen Trichloride (NCl3)",
      equation: "3 Cl₂ + NH₃ ➔ NCl₃ (Explosive Oil) + 3 HCl",
      mechanism: "Forms Nitrogen Trichloride (NCl3), an extremely unstable oily liquid that detonates violently upon light mechanical shock, light exposure, or mild heating (>60°C).",
      precaution: "STRICT PROHIBITION: Never connect chlorine and ammonia headers or use ammonia torches for chlorine leak testing in high concentrations."
    },
    {
      pair: ["h2s", "cl2"],
      severity: "danger",
      title: "Spontaneous Ignition & Toxic Gas Formation",
      equation: "H₂S + 4 Cl₂ + 4 H₂O ➔ H₂SO₄ + 8 HCl  (Violent Pyrophoric / Flame)",
      mechanism: "Spontaneous hypergolic reaction. May ignite on contact without an external spark, producing clouds of choking hydrogen chloride and sulfur oxides.",
      precaution: "Absolute isolation. Flare systems for acid gas must never cross-connect with chlorination vents."
    },
    {
      pair: ["naocl", "hcl"],
      severity: "danger",
      title: "Lethal Chlorine Gas (Cl2) Liberation",
      equation: "NaOCl + 2 HCl ➔ NaCl + H₂O + Cl₂ ↑ (Deadly Green Gas)",
      mechanism: "Rapid, quantitative acidification of hypochlorite releases 100% of available chlorine as gas. Multiple industrial fatalities occur annually from accidental truck offloading cross-connections.",
      precaution: "Enforce distinct keyed couplings (PVR connectors) for acid and bleach offloading manifolds to prevent cross-contamination."
    },
    {
      pair: ["naocl", "nh3"],
      severity: "danger",
      title: "Release of Toxic & Explosive Chloramines",
      equation: "NaOCl + NH₃ ➔ NH₂Cl (Monochloramine) + NHCl₂ + NCl₃",
      mechanism: "Forms toxic chloramine vapor that severely irritates eyes and lungs, causing severe pulmonary edema. Can form explosive NCl3 in excess chlorine.",
      precaution: "Never use ammonia solutions to clean bleach spills or vice-versa."
    },
    {
      pair: ["hno3", "benzene"],
      severity: "danger",
      title: "Violent Nitration & Explosive Runaway",
      equation: "C₆H₆ + HNO₃ (conc) ➔ C₆H₅NO₂ (Nitrobenzene) + H₂O",
      mechanism: "Violent exothermic reaction. Uncontrolled mixing can lead to thermal runaway, vessel rupture, and detonation of polynitrated aromatic byproducts.",
      precaution: "Strict temperature-controlled jacketed reactors with emergency quench systems."
    },
    {
      pair: ["hno3", "naoh"],
      severity: "danger",
      title: "Violent Acid-Base Exotherm",
      equation: "HNO₃ + NaOH ➔ NaNO₃ + H₂O  (ΔH = -57 kJ/mol)",
      mechanism: "Rapid temperature spike with potential boiling and release of toxic brown NO2 gas fumes if localized hot spots exceed 90°C.",
      precaution: "Neutralize only in dilute state with abundant water and continuous monitoring."
    }
  ];

  // 3. Chemical Spill Neutralization Stoichiometry Engine
  const NEUTRALIZATION_DATA = {
    h2so4: {
      name: "Sulfuric Acid (H2SO4 - 98%)",
      pureDensity: 1.84, // g/mL
      molMass: 98.08,
      defaultConc: 98,
      type: "acid",
      equivalents: 2, // diprotic
      agents: [
        { id: "caoh2", name: "Hydrated Lime [Ca(OH)2]", molMass: 74.09, eqPerMol: 2, deltaH: -112, formula: "H₂SO₄ + Ca(OH)₂ ➔ CaSO₄↓ + 2 H₂O" },
        { id: "na2co3", name: "Soda Ash [Na2CO3]", molMass: 105.99, eqPerMol: 2, deltaH: -84, formula: "H₂SO₄ + Na₂CO₃ ➔ Na₂SO₄ + CO₂↑ + H₂O" },
        { id: "nahco3", name: "Sodium Bicarbonate [NaHCO3]", molMass: 84.01, eqPerMol: 1, deltaH: -65, formula: "H₂SO₄ + 2 NaHCO₃ ➔ Na₂SO₄ + 2 CO₂↑ + 2 H₂O" },
        { id: "naoh", name: "Caustic Soda [NaOH - pure]", molMass: 40.00, eqPerMol: 1, deltaH: -114, formula: "H₂SO₄ + 2 NaOH ➔ Na₂SO₄ + 2 H₂O" }
      ]
    },
    hcl: {
      name: "Hydrochloric Acid (HCl - 37%)",
      pureDensity: 1.19,
      molMass: 36.46,
      defaultConc: 37,
      type: "acid",
      equivalents: 1,
      agents: [
        { id: "caoh2", name: "Hydrated Lime [Ca(OH)2]", molMass: 74.09, eqPerMol: 2, deltaH: -56, formula: "2 HCl + Ca(OH)₂ ➔ CaCl₂ + 2 H₂O" },
        { id: "na2co3", name: "Soda Ash [Na2CO3]", molMass: 105.99, eqPerMol: 2, deltaH: -42, formula: "2 HCl + Na₂CO₃ ➔ 2 NaCl + CO₂↑ + H₂O" },
        { id: "nahco3", name: "Sodium Bicarbonate [NaHCO3]", molMass: 84.01, eqPerMol: 1, deltaH: -32, formula: "HCl + NaHCO₃ ➔ NaCl + CO₂↑ + H₂O" }
      ]
    },
    hno3: {
      name: "Nitric Acid (HNO3 - 68%)",
      pureDensity: 1.41,
      molMass: 63.01,
      defaultConc: 68,
      type: "acid",
      equivalents: 1,
      agents: [
        { id: "caoh2", name: "Hydrated Lime [Ca(OH)2]", molMass: 74.09, eqPerMol: 2, deltaH: -57, formula: "2 HNO₃ + Ca(OH)₂ ➔ Ca(NO₃)₂ + 2 H₂O" },
        { id: "na2co3", name: "Soda Ash [Na2CO3]", molMass: 105.99, eqPerMol: 2, deltaH: -43, formula: "2 HNO₃ + Na₂CO₃ ➔ 2 NaNO₃ + CO₂↑ + H₂O" },
        { id: "nahco3", name: "Sodium Bicarbonate [NaHCO3]", molMass: 84.01, eqPerMol: 1, deltaH: -33, formula: "HNO₃ + NaHCO₃ ➔ NaNO₃ + CO₂↑ + H₂O" }
      ]
    },
    hf: {
      name: "Hydrofluoric Acid (HF - 48%)",
      pureDensity: 1.15,
      molMass: 20.01,
      defaultConc: 48,
      type: "acid",
      equivalents: 1,
      agents: [
        { id: "caoh2", name: "Hydrated Lime [Ca(OH)2] - Recommended for HF", molMass: 74.09, eqPerMol: 2, deltaH: -68, formula: "2 HF + Ca(OH)₂ ➔ CaF₂↓ (Insoluble Fluorite) + 2 H₂O" }
      ]
    },
    naoh: {
      name: "Sodium Hydroxide (NaOH - 50% Caustic)",
      pureDensity: 1.52,
      molMass: 40.00,
      defaultConc: 50,
      type: "base",
      equivalents: 1,
      agents: [
        { id: "citric", name: "Citric Acid [C6H8O7]", molMass: 192.12, eqPerMol: 3, deltaH: -54, formula: "3 NaOH + C₆H₈O₇ ➔ Na₃C₆H₅O₇ + 3 H₂O" },
        { id: "acetic", name: "Acetic Acid (Vinegar/Glacial) [CH3COOH]", molMass: 60.05, eqPerMol: 1, deltaH: -55, formula: "NaOH + CH₃COOH ➔ CH₃COONa + H₂O" },
        { id: "hcl_dil", name: "Dilute Hydrochloric Acid (10%)", molMass: 36.46, eqPerMol: 1, deltaH: -57, formula: "NaOH + HCl ➔ NaCl + H₂O" }
      ]
    }
  };

  // Expose Global Controller
  window.ChemicalSuite = {
    database: CHEMICAL_DATABASE,
    reactivity: REACTIVITY_MATRIX,
    neutralization: NEUTRALIZATION_DATA,

    init() {
      this.populateChemicalSelects();
      this.renderSuitRecommendations();
      this.renderChemicalDetails(CHEMICAL_DATABASE[0].id);
      this.renderReactivityComparison();
      this.initNeutralizationForm();
    },

    populateChemicalSelects() {
      const suitSelect = document.getElementById("chemSuitSelect");
      const dbSelect = document.getElementById("chemDbSelect");
      const reactSelectA = document.getElementById("reactChemSelectA");
      const reactSelectB = document.getElementById("reactChemSelectB");
      const neutSelect = document.getElementById("neutAcidSelect");

      if (suitSelect) {
        suitSelect.innerHTML = CHEMICAL_DATABASE.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
      }
      if (dbSelect) {
        dbSelect.innerHTML = CHEMICAL_DATABASE.map(c => `<option value="${c.id}">${c.name} [${c.category}]</option>`).join("");
      }
      if (reactSelectA && reactSelectB) {
        const opts = CHEMICAL_DATABASE.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        reactSelectA.innerHTML = opts;
        reactSelectB.innerHTML = opts;
        if (reactSelectB.options.length > 2) reactSelectB.selectedIndex = 2; // Default to NaOH
      }
      if (neutSelect) {
        neutSelect.innerHTML = Object.entries(NEUTRALIZATION_DATA).map(([id, info]) => `<option value="${id}">${info.name}</option>`).join("");
      }
    },

    // 🦺 Module 1: Chemical Protective Suit & PPE Selector
    renderSuitRecommendations() {
      const chemId = document.getElementById("chemSuitSelect")?.value || "hf";
      const scenario = document.getElementById("chemScenarioSelect")?.value || "tankEntry";
      const chem = CHEMICAL_DATABASE.find(c => c.id === chemId) || CHEMICAL_DATABASE[0];

      const heroEl = document.getElementById("chemSuitHeroBox");
      const tableEl = document.getElementById("chemPermeationTableBody");
      const ppeEl = document.getElementById("chemPpeSpecsBox");

      const suitLevel = chem.suitRecommendations[scenario] || chem.suitRecommendations.tankEntry;

      let icon = "🦺";
      let badgeClass = "chem-badge-blue";
      if (suitLevel.includes("Level A")) {
        icon = "🧑‍🚀";
        badgeClass = "chem-badge-red";
      } else if (suitLevel.includes("Level B")) {
        icon = "🥽";
        badgeClass = "chem-badge-amber";
      } else if (suitLevel.includes("Level C")) {
        icon = "🛡️";
        badgeClass = "chem-badge-blue";
      }

      if (heroEl) {
        heroEl.innerHTML = `
          <div class="chem-suit-icon-badge">${icon}</div>
          <div class="chem-suit-details">
            <span class="chem-badge ${badgeClass}" style="margin-bottom: 8px;">${scenario.toUpperCase()} SCENARIO</span>
            <h4>${suitLevel}</h4>
            <p><strong>Hazard Summary for ${chem.name}:</strong> ${chem.nature}. CAS: <code>${chem.cas}</code> | UN: <code>${chem.un}</code></p>
            <div style="font-size: 13px; color: #475569;">
              <strong>Standards Compliance:</strong> NFPA 1991 (Vapor-Protective Ensembles for Hazardous Chemical Emergencies) & OSHA 29 CFR 1910.120 App B.
            </div>
          </div>
        `;
      }

      if (tableEl) {
        tableEl.innerHTML = chem.permeation.map(p => {
          let ratingClass = "rating-good";
          if (p.rating.includes("Excellent")) ratingClass = "rating-excellent";
          else if (p.rating.includes("Fair")) ratingClass = "rating-fair";
          else if (p.rating.includes("Poor")) ratingClass = "rating-poor";

          return `
            <tr>
              <td><strong>${p.material}</strong></td>
              <td>${p.breakthrough}</td>
              <td><span class="${ratingClass}">${p.rating}</span></td>
            </tr>
          `;
        }).join("");
      }

      if (ppeEl) {
        ppeEl.innerHTML = `
          <div class="chem-grid-2">
            <div style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 14px;">
              <h5 style="margin: 0 0 6px 0; color: #0284c7; font-size: 14px;">🫁 Respiratory Protection</h5>
              <p style="margin: 0; font-size: 13px; line-height: 1.5;">${chem.ppe.respirator}</p>
            </div>
            <div style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 14px;">
              <h5 style="margin: 0 0 6px 0; color: #0284c7; font-size: 14px;">🧤 Chemical Glove Barrier</h5>
              <p style="margin: 0; font-size: 13px; line-height: 1.5;">${chem.ppe.gloves}</p>
            </div>
            <div style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 14px;">
              <h5 style="margin: 0 0 6px 0; color: #0284c7; font-size: 14px;">🥾 Chemical Boots / Footwear</h5>
              <p style="margin: 0; font-size: 13px; line-height: 1.5;">${chem.ppe.boots}</p>
            </div>
            <div style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 14px;">
              <h5 style="margin: 0 0 6px 0; color: #0284c7; font-size: 14px;">🧥 Body Enclosure Fabric</h5>
              <p style="margin: 0; font-size: 13px; line-height: 1.5;">${chem.ppe.body}</p>
            </div>
          </div>
          <div style="margin-top: 14px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px; font-size: 13px; color: #9f1239;">
            <strong>Metallurgy & Materials Caution:</strong> ${chem.materialsAvoid}
          </div>
        `;
      }
    },

    // 🧪 Module 2: Chemical Properties & SDS Library
    renderChemicalDetails(chemId) {
      const chem = CHEMICAL_DATABASE.find(c => c.id === chemId) || CHEMICAL_DATABASE[0];
      const target = document.getElementById("chemDetailsContainer");
      if (!target) return;

      const ghsBadges = chem.ghs.map(g => `<span class="ghs-badge-item">⚠️ ${g}</span>`).join("");

      target.innerHTML = `
        <div class="chem-grid-2">
          <!-- Left: Physical & Occupational Constants -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #0284c7; font-size: 22px;">${chem.name}</h3>
              <span class="chem-badge chem-badge-purple">${chem.category}</span>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b;">${chem.nature}</p>

            <table class="chem-table" style="margin-bottom: 16px;">
              <tbody>
                <tr><td><strong>Chemical Formula</strong></td><td><code>${chem.formula}</code></td></tr>
                <tr><td><strong>CAS Registry Number</strong></td><td><code>${chem.cas}</code></td></tr>
                <tr><td><strong>UN / NA Hazmat ID</strong></td><td><code>${chem.un}</code></td></tr>
                <tr><td><strong>Molecular Weight</strong></td><td>${chem.molWeight} g/mol</td></tr>
                <tr><td><strong>Density</strong></td><td>${chem.density}</td></tr>
                <tr><td><strong>Boiling Point</strong></td><td>${chem.boilingPt}</td></tr>
                <tr><td><strong>Freezing Point</strong></td><td>${chem.freezingPt}</td></tr>
                <tr><td><strong>Vapor Pressure @ 20°C</strong></td><td>${chem.vaporPressure}</td></tr>
                <tr><td><strong>Flash Point</strong></td><td>${chem.flashPoint}</td></tr>
                <tr><td><strong>Typical pH</strong></td><td>${chem.ph}</td></tr>
              </tbody>
            </table>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <h5 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; color: #475569;">Occupational Exposure Limits</h5>
              <div style="font-size: 13px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div><span style="color: #64748b;">OSHA PEL:</span><br><strong>${chem.exposure.pel}</strong></div>
                <div><span style="color: #64748b;">ACGIH TLV:</span><br><strong>${chem.exposure.tlv}</strong></div>
                <div><span style="color: #b91c1c;">NIOSH IDLH:</span><br><strong style="color: #b91c1c;">${chem.exposure.idlh}</strong></div>
              </div>
            </div>
          </div>

          <!-- Right: NFPA 704 Diamond & GHS Warnings -->
          <div>
            <h4 style="margin: 0 0 8px 0; text-align: center; font-size: 14px; text-transform: uppercase; color: #64748b;">NFPA 704 Fire Diamond</h4>
            
            <div class="nfpa-diamond-container">
              <div class="nfpa-diamond">
                <div class="nfpa-cell nfpa-top-red" title="Flammability: ${chem.nfpa.flammability}"><span>${chem.nfpa.flammability}</span></div>
                <div class="nfpa-cell nfpa-left-blue" title="Health: ${chem.nfpa.health}"><span>${chem.nfpa.health}</span></div>
                <div class="nfpa-cell nfpa-right-yellow" title="Instability: ${chem.nfpa.instability}"><span>${chem.nfpa.instability}</span></div>
                <div class="nfpa-cell nfpa-bottom-white" title="Special Hazard: ${chem.nfpa.special}"><span>${chem.nfpa.special}</span></div>
              </div>
              <div style="display: flex; gap: 12px; font-size: 11px; margin-top: 10px; color: #64748b;">
                <span style="color: #3b82f6;">■ Health: ${chem.nfpa.health}</span>
                <span style="color: #ef4444;">■ Flammability: ${chem.nfpa.flammability}</span>
                <span style="color: #ca8a04;">■ Instability: ${chem.nfpa.instability}</span>
                <span>□ Special: ${chem.nfpa.special}</span>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <h5 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; color: #64748b;">GHS Hazard Pictograms</h5>
              <div class="ghs-badges-row">${ghsBadges}</div>
              <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.5; color: #dc2626;">${chem.ghsStatements}</p>
            </div>

            <div style="margin-top: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px;">
              <h5 style="margin: 0 0 4px 0; color: #991b1b; font-size: 13px;">🚨 Emergency First Aid Protocol</h5>
              <p style="margin: 0; font-size: 12.5px; line-height: 1.5; color: #7f1d1d;">${chem.firstAid}</p>
            </div>
          </div>
        </div>
      `;
    },

    // 💥 Module 3: Chemical Reactivity & Mixing Checker
    renderReactivityComparison() {
      const chemAId = document.getElementById("reactChemSelectA")?.value || "hf";
      const chemBId = document.getElementById("reactChemSelectB")?.value || "naoh";
      const container = document.getElementById("reactivityResultBox");
      if (!container) return;

      const chemA = CHEMICAL_DATABASE.find(c => c.id === chemAId) || CHEMICAL_DATABASE[0];
      const chemB = CHEMICAL_DATABASE.find(c => c.id === chemBId) || CHEMICAL_DATABASE[1];

      if (chemAId === chemBId) {
        container.innerHTML = `
          <div class="reactivity-alert-card safe">
            <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 16px;">🟢 Identical Substance Selected</h4>
            <p style="margin: 0; font-size: 14px; color: #14532d;">No hazardous cross-reactivity. Material is compatible with itself under standard ambient conditions.</p>
          </div>
        `;
        return;
      }

      // Check predefined matrix
      const match = REACTIVITY_MATRIX.find(m => 
        (m.pair[0] === chemAId && m.pair[1] === chemBId) ||
        (m.pair[0] === chemBId && m.pair[1] === chemAId)
      );

      if (match) {
        const isDanger = match.severity === "danger";
        const alertClass = isDanger ? "reactivity-alert-card" : "reactivity-alert-card warning";
        const icon = isDanger ? "🚨 CRITICAL INCOMPATIBILITY / DANGER" : "⚠️ CAUTION / EXOTHERMIC RISK";

        container.innerHTML = `
          <div class="${alertClass}">
            <h4 style="margin: 0 0 8px 0; font-size: 18px; color: ${isDanger ? '#b91c1c' : '#b45309'};">${icon}: ${match.title}</h4>
            <div class="reaction-equation-box">${match.equation}</div>
            <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;"><strong>Hazard Mechanism:</strong> ${match.mechanism}</p>
            <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: ${isDanger ? '#7f1d1d' : '#78350f'};">
              <strong>Safe Engineering Controls:</strong> ${match.precaution}
            </p>
          </div>
        `;
      } else {
        // Generic categorization check
        let isAcidBase = (chemA.category === "Acids" && chemB.category === "Bases & Amines") || (chemB.category === "Acids" && chemA.category === "Bases & Amines");
        let isOxidizerHydrocarbon = (chemA.nfpa.special?.includes("OX") && chemB.category === "Hydrocarbons & Aromatics") || (chemB.nfpa.special?.includes("OX") && chemA.category === "Hydrocarbons & Aromatics");

        if (isAcidBase) {
          container.innerHTML = `
            <div class="reactivity-alert-card">
              <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #b91c1c;">🚨 Strong Acid-Base Neutralization Hazard</h4>
              <div class="reaction-equation-box">${chemA.name} + ${chemB.name} ➔ Salt + Water + Immense Heat (ΔH ≈ -57 kJ/mol H⁺)</div>
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">Mixing strong acids with strong alkaline bases generates rapid heat of neutralization, potentially boiling the mixture, causing violent foaming, vessel overpressure, and splashing.</p>
              <p style="margin: 0; font-size: 13px; color: #7f1d1d;"><strong>Control:</strong> Do not mix in common sewer or piping headers without dedicated neutralizers and temperature monitoring.</p>
            </div>
          `;
        } else if (isOxidizerHydrocarbon) {
          container.innerHTML = `
            <div class="reactivity-alert-card">
              <h4 style="margin: 0 0 8px 0; font-size: 18px; color: #b91c1c;">💥 Violent Oxidation / Fire Risk</h4>
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">One substance is a powerful oxidizer (${chemA.nfpa.special?.includes("OX") ? chemA.name : chemB.name}) and the other is a combustible organic compound (${chemA.category === "Hydrocarbons & Aromatics" ? chemA.name : chemB.name}). Violent combustion or explosion may occur spontaneously upon mixing.</p>
              <p style="margin: 0; font-size: 13px; color: #7f1d1d;"><strong>Control:</strong> Strictly isolate drainage headers and storage tank containment berms.</p>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="reactivity-alert-card safe">
              <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 16px;">🟢 Compatible / No Violent Reaction Documented</h4>
              <p style="margin: 0; font-size: 14px; color: #14532d;">No direct violent exothermic runaway or lethal gas release identified between <strong>${chemA.name}</strong> and <strong>${chemB.name}</strong> under normal ambient conditions. Always consult full NOAA CAMEO reactivity guidelines for elevated temperature or pressure operations.</p>
            </div>
          `;
        }
      }
    },

    // ⚖️ Module 4: Chemical Spill Neutralization & Stoichiometry Calculator
    initNeutralizationForm() {
      const acidSelect = document.getElementById("neutAcidSelect");
      const agentSelect = document.getElementById("neutAgentSelect");
      if (!acidSelect || !agentSelect) return;

      const updateAgents = () => {
        const acidKey = acidSelect.value;
        const config = NEUTRALIZATION_DATA[acidKey];
        if (!config) return;

        agentSelect.innerHTML = config.agents.map((a, idx) => `<option value="${idx}">${a.name}</option>`).join("");
        const concInput = document.getElementById("neutSpillConc");
        if (concInput) concInput.value = config.defaultConc;
        this.calculateNeutralization();
      };

      acidSelect.addEventListener("change", updateAgents);
      agentSelect.addEventListener("change", () => this.calculateNeutralization());
      updateAgents();
    },

    calculateNeutralization() {
      const acidKey = document.getElementById("neutAcidSelect")?.value || "h2so4";
      const agentIdx = parseInt(document.getElementById("neutAgentSelect")?.value || "0", 10);
      const volumeL = parseFloat(document.getElementById("neutSpillVol")?.value || "1000"); // Liters
      const concPct = parseFloat(document.getElementById("neutSpillConc")?.value || "98"); // %

      const config = NEUTRALIZATION_DATA[acidKey];
      if (!config) return;
      const agent = config.agents[agentIdx] || config.agents[0];

      // Math:
      // Volume (L) -> Total solution mass = Volume (L) * (pureDensity * 1.0 kg/L approx)
      // Pure chemical mass = Total solution mass * (concPct / 100)
      const solutionMassKg = volumeL * config.pureDensity;
      const pureMassKg = solutionMassKg * (concPct / 100);
      const pureMoles = (pureMassKg * 1000) / config.molMass; // mol of pure spilled chemical

      // Equivalents ratio
      // Acid Eq = pureMoles * config.equivalents
      // Base Eq = agentMoles * agent.eqPerMol
      // For neutralization: Acid Eq = Base Eq => agentMoles = Acid Eq / agent.eqPerMol
      const acidEq = pureMoles * config.equivalents;
      const agentMolesReq = acidEq / agent.eqPerMol;
      const agentMassKg = (agentMolesReq * agent.molMass) / 1000;
      const agentMassLbs = agentMassKg * 2.20462;

      // Heat generation (MJ) = agentMolesReq * |deltaH| / 1000
      const totalHeatMJ = (agentMolesReq * Math.abs(agent.deltaH)) / 1000;

      // Render results
      const resMassKg = document.getElementById("neutResMassKg");
      const resMassLbs = document.getElementById("neutResMassLbs");
      const resHeat = document.getElementById("neutResHeat");
      const resEq = document.getElementById("neutResEquation");
      const resAdvice = document.getElementById("neutResAdvice");

      if (resMassKg) resMassKg.textContent = `${agentMassKg.toFixed(1)} kg`;
      if (resMassLbs) resMassLbs.textContent = `${agentMassLbs.toFixed(1)} lbs`;
      if (resHeat) resHeat.textContent = `${totalHeatMJ.toFixed(1)} MJ`;
      if (resEq) resEq.textContent = agent.formula;

      let tempRisk = "🟢 Mild heat release. Ensure safety glasses and face shield.";
      if (totalHeatMJ > 200) {
        tempRisk = "🚨 HIGH EXOTHERMIC HEAT WARNING: Over 200 MJ of heat released! Mixture will boil and spatter aggressively if dumped at once. Dilute with cold water mist first, create containment berms, and add neutralizing agent slowly in thin layers.";
      } else if (totalHeatMJ > 50) {
        tempRisk = "🟠 MODERATE HEAT RELEASE: Significant thermal rise. Do not stand directly over the spill. Wear Level B splash gear with face shield.";
      }

      if (resAdvice) {
        resAdvice.innerHTML = `
          <p style="margin: 0 0 6px 0; font-weight: 700;">${tempRisk}</p>
          <div style="font-size: 13px; line-height: 1.5; color: #475569;">
            <strong>Standard Spill SOP:</strong> 
            1. Dike perimeter with inert sand or synthetic berms to prevent sewer entry.<br>
            2. Verify spill pH using calibrated wide-range pH strips (Target safe pH: 6.5 - 8.5).<br>
            3. Apply neutralizing agent from the outer edge inward toward the center with continuous mixing.<br>
            4. Once bubbling / effervescence ceases, test pH before transferring neutralized slurry for industrial waste disposal.
          </div>
        `;
      }
    }
  };

  // 🔀 Sub-tab Switcher inside Chemistry Suite
  window.switchChemSubTab = function (subTabId) {
    document.querySelectorAll(".chem-nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-chem-tab") === subTabId);
    });

    document.querySelectorAll(".chem-section-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `chemPane_${subTabId}`);
    });

    // Re-render or adjust view if needed
    if (subTabId === "suit") {
      window.ChemicalSuite.renderSuitRecommendations();
    } else if (subTabId === "database") {
      const chemId = document.getElementById("chemDbSelect")?.value || "hf";
      window.ChemicalSuite.renderChemicalDetails(chemId);
    } else if (subTabId === "reactivity") {
      window.ChemicalSuite.renderReactivityComparison();
    } else if (subTabId === "neutralization") {
      window.ChemicalSuite.calculateNeutralization();
    } else if (subTabId === "periodictable") {
      if (window.PeriodicTable && typeof window.PeriodicTable.init === "function") {
        window.PeriodicTable.init();
      }
      if (window.PeriodicTable && typeof window.PeriodicTable.resumeBohrAnimation === "function") {
        window.PeriodicTable.resumeBohrAnimation();
      }
    }

    if (subTabId !== "periodictable" && window.PeriodicTable && typeof window.PeriodicTable.pauseBohrAnimation === "function") {
      window.PeriodicTable.pauseBohrAnimation();
    }
  };

  // 🌐 Main Entrance Function to Show the Suite
  window.showChemicalSuiteTab = function (subTabId = "suit") {
    if (typeof hideAllMainPanels === "function") hideAllMainPanels();
    if (typeof hideWelcomePanel === "function") hideWelcomePanel();

    const suiteTab = document.getElementById("chemicalSuiteTab");
    if (suiteTab) {
      suiteTab.style.display = "block";
      window.switchChemSubTab(subTabId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Initialize on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.ChemicalSuite.init());
  } else {
    window.ChemicalSuite.init();
  }
})();
