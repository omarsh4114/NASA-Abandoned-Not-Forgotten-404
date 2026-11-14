# ECHOES OF SILENCE — NASA Open Data 3D Spatial Exhibition

**NASA Space Apps Challenge Cairo 2026**  
**Challenge:** *Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon, Mars, and Beyond*  
**Team:** **Spaghetti Coders**  
- **Omar:** Team Leader, Narrative Designer & Submission Coordinator  
- **Bashar:** NASA Planetary Data, NSSDCA/PDS Telemetry & Archival Research Lead  
- **Youssef:** Principal Frontend, Three.js / React Three Fiber & Spatial UI Architect  

**Target Audience:** Curious students & young space explorers (Ages 10–14), educators, and museum visitors.

---

## 1. Official 150-Word Project Summary

Decades of planetary exploration have left dozens of silent NASA landers, rovers, and probes resting across our Solar System. To students aged 10–14, these inactive machines can seem like forgotten "space junk" rather than priceless scientific monuments. **Echoes of Silence** transforms 13 verified NASA spacecraft across the Moon, Mars, Asteroid 433 Eros, Dwarf Planet Ceres, and Deep Space into a three-tier interactive 3D exhibition. Visitors trace real interplanetary transfer trajectories in the **Solar System Explorer**, compare all 13 spacecraft side-by-side on the **Orbital Museum** deck, and step onto the **1:1 Surface Stage** to inspect hardware beside a true-scale `1.75m` astronaut or in live WebXR AR camera passthrough. Inside each exhibit, students toggle between historic mission photos and modern LROC/HiRISE orbital reconnaissance, inspect 3D engineering hotspots, read one-way radio light-delay telemetry, and interview each spacecraft in first person.

---

## 2. How "Echoes of Silence" Excels Across All 5 NASA Judging Criteria

| Judging Criterion | How Echoes of Silence Delivers Maximum Value |
| :--- | :--- |
| **1. Impact** | Reframes "discarded space hardware" as humanity's off-world archaeological heritage. Bridges STEM physics (radio light-time delay, orbital mechanics, thermal engineering) with emotional first-person storytelling tailored for ages 10–14, complete with an **Explorer Passport** and printable completion certificate for classrooms. |
| **2. Creativity** | Combines three seamless spatial perspectives—**Solar System Orrery**, **Architectural Orbital Museum**, and **1:1 Planetary Surface Stage**—with an interactive **"Ask the Spacecraft"** first-person telemetry Q&A and a **Mission Photo vs. Orbital Recon** comparison viewer. |
| **3. Validity** | Every coordinate, launch/end date, metric dimension (`1 Three.js unit = 1.0 meter`), failure mechanism, and one-way radio light-delay (`1.28 Light-Seconds` to `~18.6 Light-Hours`) is grounded in official NASA NSSDCA, PDS, LROC, and HiRISE archives with direct clickable citations. |
| **4. Relevance** | Directly answers the *"Abandoned but Not Forgotten"* challenge by telling the complete lifecycle of 13 real NASA machines—how they arrived, what science they unlocked, why they fell silent (or still work passively like Apollo 11's LRRR), and how NASA orbiters monitor their resting places today. |
| **5. Presentation** | Unified museum-grade PBR material palette (`kaptonGold`, `thermalWhite`, `titaniumDark`, `solarCellBlue`), custom GLSL atmospheric and solar corona shaders, 3D spherical crater synthesis, responsive touch/keyboard navigation (`Arrow Keys` / `WASD` / `R`), and zero-broken-asset SVG telemetry fallbacks. |

---

## 3. Three-Tier 3D Spatial Architecture & Winning-Edge Features

1. **Mode 1 — Solar System Explorer (`Trajectory & Planetary View`):**
   - Full 3D heliocentric orrery featuring a convecting, sunspot-active Sun with additive Fresnel corona, real continental/cloud/atmospheric Earth, 3D cratered Moon, Mars (with Valles Marineris, Olympus Mons, and polar ice caps), peanut-shaped 433 Eros, Dwarf Planet Ceres (with Occator Crater faculae), and the outer gas/ice giants.
   - Displays color-coded transfer trajectories (`Translunar Injection`, `Hohmann Mars Transfer`, `Low-Thrust Ion Spiral`, and `Interstellar Hyperbolic Escape`) and clickable planetary landing pins.
2. **Mode 2 — Orbital Museum (`Side-by-Side Exhibition Deck`):**
   - Places all 13 spacecraft on illuminated museum pedestals arranged along an architectural exhibition arc so students can compare engineering designs across Moon, Mars, Asteroid Belt, and Deep Space eras.
3. **Mode 3 — 1:1 Surface Stage (`True Metric Scale & AR Mode`):**
   - Renders each landed spacecraft on its authentic planetary terrain (Mare Tranquillitatis regolith, Martian iron-oxide dunes, or 433 Eros chondrite saddle) alongside a **`1.75m` Astronaut scale reference** and **1:1 WebXR AR Camera Passthrough**.
4. **"Ask the Spacecraft" Interactive Q&A Chips:**
   - Inside every artifact's `Story` tab, students can click three curious questions (*"Why did you stop working?"*, *"What was your biggest discovery?"*, *"What does your resting place look like today?"*) to receive a first-person answer backed by a verified NASA telemetry tag.
5. **Real-Time One-Way Radio Light-Delay & Distance Readout:**
   - Displays the exact speed-of-light radio travel time from Earth (`1.28 Light-Seconds` for the Moon, `~14.2 Light-Minutes` for Mars, `~17.6 Light-Minutes` for 433 Eros, `~23.1 Light-Minutes` for Ceres, and `~18.6 Light-Hours` for Pioneer 10 in interstellar space).
6. **Mission Photo vs. Orbital Reconnaissance Switcher & Offline SVG Plate:**
   - Lets visitors switch between close-up surface/mission imagery and overhead LROC / HiRISE orbital reconnaissance, protected by an automatic SVG telemetry blueprint fallback so network hiccups never produce broken images.

---

## 4. Complete Catalog of All 13 Verified NASA Spacecraft

| # | Spacecraft / Artifact | Zone | Active Years | Resting Location & Coordinates | True Metric Scale (`W × D × H`) | One-Way Radio Delay | Official NSSDCA / NASA ID |
| :-: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| 1 | **Apollo 11 Eagle Descent Stage** | Moon | 1969 | Tranquility Base (`0.6741° N, 23.4730° E`) | `4.20m × 4.20m × 3.20m` (9.4m span) | `1.28 Light-Seconds` | [1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C) |
| 2 | **Apollo 11 Laser Retroreflector (LRRR)** | Moon | 1969–Present | Tranquility Base EASEP (`0.6734° N, 23.4729° E`) | `0.46m × 0.46m × 0.30m` (100 prisms) | `1.28 Light-Seconds` | [1969-059C-04](https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04) |
| 3 | **Apollo 17 Lunar Roving Vehicle (LRV-3)** | Moon | 1972 | Taurus-Littrow Valley (`20.1908° N, 30.7717° E`) | `3.10m L × 1.83m W × 1.14m H` | `1.28 Light-Seconds` | [1972-096C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C) |
| 4 | **Surveyor 3 Robotic Lunar Lander** | Moon | 1967 (Visited 1969) | Surveyor Crater, Oceanus Procellarum (`3.0155° S, 23.4219° W`) | `4.27m Span × 3.00m H` | `1.28 Light-Seconds` | [1967-035A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A) |
| 5 | **Ingenuity Mars Helicopter (Ginny)** | Mars | 2020–2024 | Valinor Hills, Jezero Crater (`18.4972° N, 77.3210° E`) | `1.20m Rotor Span × 0.49m H` (1.8 kg) | `~14.2 Light-Minutes` | [Mars 2020 / Ingenuity](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/) |
| 6 | **Opportunity Mars Exploration Rover (MER-B)** | Mars | 2003–2018 | Perseverance Valley, Endeavour Crater (`2.2816° S, 5.3636° W`) | `1.60m L × 2.30m W × 1.50m H` | `~14.2 Light-Minutes` | [2003-032A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A) |
| 7 | **Spirit Mars Exploration Rover (MER-A)** | Mars | 2003–2010 | Site Troy, Gusev Crater (`14.5993° S, 175.5284° E`) | `1.60m L × 2.30m W × 1.50m H` | `~14.2 Light-Minutes` | [2003-027A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A) |
| 8 | **InSight Mars Geophysical Lander** | Mars | 2018–2022 | Elysium Planitia (`4.5024° N, 135.6234° E`) | `6.00m Solar Span × 1.56m × 1.08m H` | `~14.2 Light-Minutes` | [2018-042A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A) |
| 9 | **Phoenix Mars Polar Lander** | Mars | 2007–2008 | Green Valley, Vastitas Borealis (`68.2188° N, 125.7492° W`) | `5.50m Solar Span × 1.50m × 2.20m H` | `~14.2 Light-Minutes` | [2007-034A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A) |
| 10 | **Sojourner Rover & Viking 1 Lander** | Mars | 1975–1982 / 1996–1997 | Chryse Planitia & Ares Vallis (`19.33° N, 33.55° W`) | `3.0m × 2.2m × 2.1m` + `0.65m` Rover | `~14.2 Light-Minutes` | [1996-068A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A) |
| 11 | **NEAR Shoemaker Asteroid Orbiter/Lander** | Asteroids | 1996–2001 | Himeros Saddle, Asteroid 433 Eros (`35.0° S, 279.0° W`) | `3.80m Solar Span × 2.75m H` | `~17.6 Light-Minutes` | [1996-008A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-008A) |
| 12 | **Dawn Ion-Propulsion Orbiter** | Asteroids | 2007–2018 | Permanent Quarantine Orbit around Ceres (`2.77 AU`) | `19.70m Solar Wingspan × 1.77m H` | `~23.1 Light-Minutes` | [2007-043A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A) |
| 13 | **Pioneer 10/11 & Kepler Space Telescope** | Deep Space | 1972–2003 / 2009–2018 | Interstellar Trajectory (`134+ AU`) & `1.01 AU` Solar Orbit | `2.74m Dish` + `4.70m × 2.70m` Barrel | `~18.6 Light-Hours` | [1972-012A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-012A) |

---

## 5. Official NASA Open Data Repositories Cited

1. **[NASA 3D Resources (`nasa3d.arc.nasa.gov`)](https://nasa3d.arc.nasa.gov/):** Official glTF/GLB spacecraft geometry and subsystem proportions for Apollo Lunar Module, Ingenuity, InSight, Viking, Dawn, and Pioneer 10, unified with our procedural PBR museum material pipeline.
2. **[Lunar Reconnaissance Orbiter Camera (`lroc.asu.edu`)](https://www.lroc.asu.edu/):** Narrow Angle Camera (NAC) orbital frames `M175124932R` (Apollo 11 Tranquility Base), `M168000580LR` (Apollo 17 Taurus-Littrow LRV-3), and `M114110397R` (Apollo 12 / Surveyor 3).
3. **[Mars Reconnaissance Orbiter HiRISE (`uahirise.org`)](https://www.uahirise.org/):** High-resolution Martian surface reconnaissance frames `ESP_056972_1775` (Opportunity), `PSP_003688_1650` (Spirit), `PIA26244` (Ingenuity), `PIA23000` (InSight), `PIA13146` (Phoenix), and `PIA09105` (Pathfinder / Sojourner).
4. **[NASA Planetary Data System (`pds.nasa.gov`)](https://pds.nasa.gov/):** Lunar Geotechnical Node (`NASA SP-238`, `NASA SP-284`), InSight SEIS Marsquake Catalog, and Small Bodies Node (NEAR Shoemaker 433 Eros XGRS and Dawn Vesta/Ceres archives).
5. **[NASA Space Science Data Coordinated Archive (`nssdc.gsfc.nasa.gov`)](https://nssdc.gsfc.nasa.gov/):** Official international spacecraft designators, launch/end timestamps, mass/dimension specifications, and trajectory parameters.
6. **[NASA Image and Video Library (`images.nasa.gov`)](https://images.nasa.gov/) & [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/):** Public-domain historical mission photography, Kepler transit light curves, and Deep Space Network records.

---

## 6. Mandatory AI-Use Disclosure (NASA Space Apps Compliance)

In full compliance with the **NASA Space Apps Challenge Judging Guidelines**, Team **Spaghetti Coders** (Omar, Bashar, and Youssef) transparently discloses that **Google Antigravity** and **Google Gemini** were used for 3D Three.js / React Three Fiber code scaffolding, procedural planetary shader tuning, and age-appropriate (10–14) narrative copyediting. All scientific telemetry, landing/orbital coordinates, mission years, metric dimensions, and archival photographs originate from official NASA public-domain datasets and were human-verified against NASA NSSDCA, PDS, LROC, and HiRISE archives.

---

## 7. Technical Stack & Local Setup

- **Engine & Rendering:** Three.js (`r183`), React Three Fiber (`@react-three/fiber`), `@react-three/drei`, custom GLSL atmospheric & corona shaders, and procedural canvas PBR texture/bump/roughness synthesis.
- **Frontend & UI:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, responsive desktop/mobile HUD with keyboard camera controller (`Arrow Keys` / `WASD` / `R`).

```bash
# Install dependencies
npm install

# Launch local development server at http://localhost:5173
npm run dev

# Run TypeScript verification and build production bundle into dist/
npm run build
```
