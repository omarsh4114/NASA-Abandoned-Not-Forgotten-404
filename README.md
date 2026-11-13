# ECHOES OF SILENCE: The Solar System's Living Black Box
**NASA Space Apps Cairo 2026 | Team: Spaghetti Coders**  
**Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars* (Target Audience: Ages 10–14)

## Overview
- **Problem:** Students aged 10–14 often struggle to connect with static historical space data, leaving NASA's discarded equipment feeling like forgotten space junk rather than heroic pioneers.
- **Solution:** *Echoes of Silence* is an interactive web experience that transforms 13 dormant spacecraft into living storytellers. Students tune a virtual `1420 MHz` deep-space receiver across the Moon, Mars, the Asteroid Belt, and Deep Space.
- **Key Features:**
  - **Talking Black-Box Comms:** First-person voice-narrated logs (`window.speechSynthesis`) with an interactive Q&A engine so students can ask each spacecraft how it landed, what it discovered, and why it went silent.
  - **Orbital Before/After Sliders:** Real LROC and HiRISE surface imagery comparing landing sites over time.
  - **Playable Science Mini-Labs:** Hands-on lunar laser ranging, marsquake seismic filtering, and Kepler exoplanet transit detection.

## NASA Open Data & Resources
- **NASA 3D Resources (`nasa.gov/3d-resources`):** Official `.glb` 3D spacecraft and rover models.
- **LROC (Lunar Reconnaissance Orbiter Camera):** High-resolution lunar surface imagery.
- **HiRISE (High Resolution Imaging Science Experiment):** Martian terrain and rover tracking imagery.
- **JPL Small-Body Database:** Orbital parameters and telemetry for Vesta, Ceres, and deep-space missions.

## AI-Use Disclosure
- **Google Antigravity:** Used to bootstrap initial React UI layouts, spatial chapter navigation, and baseline styling.
- **Google Gemini:** Used as a development assistant for FastAPI pipeline structuring, Git workflows, and refining age-appropriate (ages 10–14) monologue scripts for browser text-to-speech.