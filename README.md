# ECHOES OF SILENCE: The Solar System's Living Black Box

**NASA Space Apps Challenge Cairo 2026**  
**Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*  
**Team:** Spaghetti Coders  
- **Youssef:** Lead Frontend & Interactive Systems Architect  
- **Bashar:** NASA Planetary Data & Open-Source Research Lead  
- **Omar:** Team Leader, Narrative Designer & Submission Coordinator  
**Target Audience:** School-age space explorers (Ages 10–14)

---

## Official 150-Word Project Summary (English)

Decades of planetary exploration have left dozens of silent NASA landers, rovers, and probes across our Solar System. To students aged 10–14, these inactive machines often seem like forgotten "space junk" rather than priceless scientific monuments. **ECHOES OF SILENCE: The Solar System's Living Black Box** transforms 13 verified NASA artifacts across the Moon, Mars, the Asteroid Belt, and Deep Space into an interactive archival telemetry console and field notebook. Students tune across real Deep Space Network frequencies to unlock first-person machine memoirs, compare historic landing photos against modern LROC and HiRISE orbital imagery, inspect engineering hotspots, and run three hands-on physics labs: bouncing lasers off passive Apollo retroreflectors, simulating Martian dust storms and InSight Marsquakes, and detecting Kepler exoplanet transits. Powered by NASA PDS, LROC, HiRISE, and the NASA Image API, our platform turns silent hardware into living classrooms that inspire future space archaeologists.

---

## Art Direction: NASA 1970s Apollo Flight Manual + Tactile Spacecraft Console

- **Typography:** `Space Grotesk` (mission headings), `IBM Plex Mono` (coordinates, frequency bands, subsystem callouts), and `Plus Jakarta Sans` (kid-friendly field stories).
- **Color System:** Deep Cosmic Void (`#0A0B0E`), Archival Warm Paper (`#F4F1EA`) with dark ink (`#141619`) for first-person field journals, NASA Worm International Orange (`#FC3D21`), Apollo Kapton Gold (`#E5A93C`), and Phosphor CRT Amber/Green (`#FFB000` / `#33FF66`).
- **Spatial Celestial Distance Track:** Artifacts are organized progressively outward from Earth (`Moon -> Mars -> Asteroid Belt -> Deep Space`) with corner brackets (`┌ ┐ └ ┘`), scanline overlays, and status LEDs.

---

## Mandatory Explicit AI-Use Disclosure (NASA Space Apps Compliance)

In full compliance with the **NASA Space Apps Cairo 2026 Judging Guidelines**, Team **Spaghetti Coders** (Omar, Bashar, and Youssef) explicitly discloses that AI coding and research assistants—specifically **Google Antigravity** and LLM writing/research assistants—were used to assist with React/TypeScript UI engineering, interactive physics mini-lab simulations, and age-appropriate (10–14) narrative copyediting. Every mission coordinate, launch/end date, failure mode, and NASA image URL was human-verified against official NASA Open Data repositories.

---

## Deduplicated Official NASA Open Data Sources Used (Bashar Archive Log)

1. **NASA Image and Video Library API (`images-api.nasa.gov`):** Direct HTTPS surface & orbital photography (`AS11-40-5922`, `AS11-40-5952`, `AS17-147-22527`, `AS12-48-7134`, `PIA24486`, `PIA05215`, `PIA05500`, `PIA22872`, `PIA10744`, `PIA01122`, `PIA03175`, `PIA21924`, `PIA14457`).
2. **Lunar Reconnaissance Orbiter Camera (LROC) & NASA PDS Lunar Geotechnical Node:** NAC frames `M175124932R` (Apollo 11), `M168000580LR` (Apollo 17 LRV-3), `M114110397R` (Apollo 12 / Surveyor 3), Apollo 11 Mission Report (`NASA SP-238`), and `NASA SP-284`.
3. **Apache Point Observatory Lunar Laser-ranging Operation (APOLLO) & GSFC Laser Ranging Network:** Passive corner-cube retroreflector ranging data (`NASA SP-214`).
4. **Mars Reconnaissance Orbiter (MRO) HiRISE & NASA PDS Geosciences Node:** Orbital frames `ESP_056972_1775` (Opportunity), `PSP_003688_1650` (Spirit), Jezero Crater orthoimagery (`PIA26244`), Elysium Planitia (`PIA23000`), Vastitas Borealis (`PIA13146`), and Chryse Planitia (`PIA09105`).
5. **NASA PDS InSight Geophysical Data Node & IPGP SEIS Marsquake Service Catalog:** Martian seismic waveform arrival data and crust/core interior models.
6. **NASA PDS Small Bodies Node (SBN):** JHU/APL NEAR Shoemaker 433 Eros XGRS archive (`PIA03175`/`PIA02474`) and JPL Dawn Vesta & Ceres Occator Crater high-resolution archive (`PIA21924`/`PIA22477`).
7. **NASA Exoplanet Archive (Caltech/IPAC) & NASA Ames Kepler / Pioneer 10/11 Archive:** Kepler transit photometry light curves (`Kepler-186f`, `Kepler-452b`, `Kepler-16b`) and Pioneer Deep Space Network escape trajectories.

---

## Local Development & Production Build

```bash
cd echoes-of-silence
npm install
npm run dev      # Start local dev server at http://localhost:5173
npm run build    # TypeScript check + production bundle into dist/
```
