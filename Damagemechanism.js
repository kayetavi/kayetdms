// DamageMechanism.js - API 571 Damage Mechanism Catalog & Unified Resolver
// Powered by Backend API Engine (/api/damage-mechanisms)

const damageMechanisms = (typeof window !== "undefined" && window.damageMechanisms) ? window.damageMechanisms : {};

if (typeof window !== "undefined") {
  window.damageMechanisms = damageMechanisms;

  // Unified Normalization Helper
  function norm(str) {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  }

  // Alias lookup map
  const aliasMap = {
    "cui": "Corrosion Under Insulation (CUI)",
    "corrosionunderinsulation": "Corrosion Under Insulation (CUI)",
    "corrosionunderinsulationcui": "Corrosion Under Insulation (CUI)",
    "htha": "High-temperature Hydrogen Attack (HTHA)",
    "hightemperaturehydrogenattack": "High-temperature Hydrogen Attack (HTHA)",
    "hightemperaturehydrogenattackhtha": "High-temperature Hydrogen Attack (HTHA)",
    "sulfidation": "Sulfidation",
    "causticembrittlement": "Caustic Stress Corrosion Cracking (Caustic Embrittlement)",
    "causticcracking": "Caustic Stress Corrosion Cracking (Caustic Embrittlement)",
    "aminecracking": "Amine Stress Corrosion Cracking",
    "amineascc": "Amine Stress Corrosion Cracking",
    "ascc": "Amine Stress Corrosion Cracking",
    "clscc": "Chloride Stress Corrosion Cracking",
    "chloridescc": "Chloride Stress Corrosion Cracking",
    "chloridessc": "Chloride Stress Corrosion Cracking",
    "ammoniascc": "Ammonia Stress Corrosion Cracking",
    "carbonatessc": "Carbonate Stress Corrosion Cracking",
    "polythionicacidscc": "Polythionic Acid Stress Corrosion Cracking",
    "ptascc": "Polythionic Acid Stress Corrosion Cracking",
    "causticscc": "Caustic Stress Corrosion Cracking",
    "ammoniumbisulfidecorrosion": "Ammonium Bisulfide Corrosion (Alkaline Sour Water)",
    "ammoniumchloridecorrosion": "Ammonium Chloride and Amine Hydrochloride Corrosion",
    "aqueousorganicacidcorrosion": "Aqueous Organic AcidCorrosion",
    "boilerwatercondensatecorrosion": "Boiler WaterSteam Corrosion",
    "co2corrosion": "CO₂ Corrosion",
    "creepstressrupture": "Creep and Stress Rupture",
    "creepandstressrupture": "Creep and Stress Rupture",
    "shorttermoverheatingstressrupture": "Short-term Overheating-Stress Rupture",
    "dissimilarmetalwelddmwcracking": "Dissimilar Metal Weld Cracking"
  };

  // Synchronous Resolver
  window.getDamageMechanismByName = function(name) {
    if (!name) return null;
    const n = norm(name);
    const catalog = window.damageMechanisms || damageMechanisms;

    // 1. Direct name match
    if (catalog[name]) return catalog[name];

    // 2. Direct code match
    if (catalog[String(name)]) return catalog[String(name)];

    // 3. Alias match
    if (aliasMap[n] && catalog[aliasMap[n]]) {
      return catalog[aliasMap[n]];
    }

    // 4. Normalized exact match
    for (const key of Object.keys(catalog)) {
      if (norm(key) === n) return catalog[key];
      if (catalog[key] && catalog[key].name && norm(catalog[key].name) === n) {
        return catalog[key];
      }
    }

    // 5. Normalized inclusion match
    for (const key of Object.keys(catalog)) {
      const nk = norm(key);
      if (nk.includes(n) || n.includes(nk)) return catalog[key];
    }

    // Check window.data if available
    if (window.data && window.data["Damage Mechanism"]) {
      const dMechs = window.data["Damage Mechanism"];
      if (dMechs[name]) return dMechs[name];
      if (aliasMap[n] && dMechs[aliasMap[n]]) return dMechs[aliasMap[n]];
      for (const k of Object.keys(dMechs)) {
        if (norm(k) === n || norm(k).includes(n) || n.includes(norm(k))) {
          return dMechs[k];
        }
      }
    }

    return null;
  };

  // Asynchronous Backend Resolver (Fetches from server if not cached)
  window.fetchDamageMechanismFromBackend = async function(nameOrCode) {
    const localMatch = window.getDamageMechanismByName(nameOrCode);
    if (localMatch) return localMatch;

    try {
      const res = await fetch(`/api/damage-mechanisms?name=${encodeURIComponent(nameOrCode)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.mechanism) {
          const m = json.mechanism;
          damageMechanisms[m.name] = m;
          if (m.code) damageMechanisms[String(m.code)] = m;
          if (window.data && window.data["Damage Mechanism"]) {
            window.data["Damage Mechanism"][m.name] = m;
          }
          return m;
        }
      }
    } catch (e) {
      console.warn("Backend fetch failed for damage mechanism:", e);
    }
    return null;
  };

  // Synchronize Custom & Modified Damage Mechanisms from Local Cache
  window.loadCustomDamageMechanisms = function() {
    try {
      const stored = localStorage.getItem("custom_damage_mechanisms");
      if (stored) {
        const custom = JSON.parse(stored);
        if (custom && typeof custom === "object") {
          for (const [key, val] of Object.entries(custom)) {
            if (val && typeof val === "object") {
              const name = val.name || key;
              damageMechanisms[name] = val;
              if (val.code) damageMechanisms[String(val.code)] = val;
              if (val.id) damageMechanisms[String(val.id)] = val;
              if (typeof window.data !== "undefined" && window.data && window.data["Damage Mechanism"]) {
                window.data["Damage Mechanism"][name] = val;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not load custom damage mechanisms from localStorage:", e);
    }
  };

  window.loadCustomDamageMechanisms();
}
