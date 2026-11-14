import type { NasaArtifact } from '../types/hardware';

export const OMAR_STORIES: Record<string, string> = {
  'apollo-11-eagle':
    'I am Eagle, the very first ship to carry human beings down to the dust of another world! When Neil and Buzz stepped off my ladder onto the Sea of Tranquility, my engines shut down forever to serve as their launch pad back to Earth. Today, my gold foil blankets still catch the sharp glare of the sun, and the footsteps they pressed around my four silver legs will stay untouched for millions of years.',
  'alsep-retroreflector':
    'I might look like a simple metal tray with 100 glass cubes, but I am the only Apollo experiment still working every single day! I don’t need batteries, computers, or solar power—when giant lasers on Earth fire pulses of light straight at me, my corner crystals bounce the photons right back across 384,000 kilometers. By timing that round trip, Earth scientists know the Moon is drifting away by 3.8 centimeters every year!',
  'apollo-lrv':
    'Call me the ultimate Moon buggy! I zipped across rolling craters and steep boulder slopes with four electric motors, helping Eugene Cernan and Harrison Schmitt explore over 35 kilometers of wild lunar mountains. Gene parked me right here at the "VIP Parking Spot" so my television camera could broadcast their fiery rocket takeoff into space. Now I sit quietly with my wheels in the dirt, keeping watch over Taurus-Littrow.',
  'surveyor-3':
    'Two whole years before humans landed on the Moon, I landed right on the slope of a crater to test if the lunar ground was sturdy enough for Apollo boots! Then, in 1969, Apollo 12 pulled off an incredible pinpoint landing just a short walk away. The astronauts walked over, took photos with me, and even snipped off my camera with pliers to bring home to a museum. I am the only robot on another world ever visited by human explorers!',
  'ingenuity-helicopter':
    'People said flying on Mars was impossible because the air is thinner than at the top of Mount Everest! But my twin carbon-fiber blades spun at 2,400 spins every single minute, lifting my tiny 1.8-kilogram body off the red dust. I was supposed to fly only 5 times, but I flew 72 times across rocky valleys and giant sand dunes. On my final landing, one blade tip clipped a dune—now I rest in the sand, listening to the Martian winds as history\'s first aerial pioneer.',
  'opportunity-rover':
    'My engineers only expected me to survive for 90 days, but I explored Mars for nearly 15 incredible years! I rolled over 45 kilometers on six rugged wheels, climbing into gigantic impact craters and discovering tiny grey minerals nicknamed "blueberries" that proved Mars was once wet and warm. In 2018, a dark dust storm wrapped around the entire planet, blotting out the sun. Before my batteries went to sleep for the last time, I completed my great marathon.',
  'spirit-rover':
    'I am Oppy’s brave twin sister! When my right-front wheel jammed, my drivers taught me to drive backwards, dragging the broken wheel behind me like a plough. That broken wheel ended up making one of our greatest discoveries: it sliced open the ground and revealed bright white silica soil created by ancient volcanic hot springs! When I finally got stuck in a soft sand trap called Troy, I kept doing science until the harsh winter sun set.',
  'insight-lander':
    'Instead of roaming around on wheels, I sat completely still on the flat plain of Elysium Planitia with my ear pressed to the ground! My super-sensitive seismometer was so quiet it could feel vibrations smaller than a single atom. I recorded more than 1,300 "Marsquakes" and listened to space meteorites crashing into the red desert. After four years, a thick blanket of reddish-orange dust covered my circular solar wings, putting me to sleep with my mission gloriously complete.',
  'phoenix-lander':
    'I was sent far to the freezing northern arctic plains of Mars where no rover had ever dared go! Using my long mechanical backhoe arm, I scraped away the dry soil and hit pure, glittering ice. I even watched chunks of that underground ice disappear into vapor right before my camera eyes! When the brutal arctic winter arrived, the sun sank below the horizon, and thousands of pounds of heavy dry ice buried me, sealing my great arctic voyage.',
  'sojourner-viking':
    'I was the size of a microwave oven with six tiny spiked wheels, but I became the very first rover ever to drive on Mars! My mom ship, Pathfinder, opened like a metal flower in a giant dried river valley, and I rolled down the ramps to sniff Martian rocks with my X-ray scanner. Nearby in Chryse Planitia sits Viking 1, the veteran lander that sent Earth its first color photo from Mars. We proved small robots can make history!',
  'near-shoemaker':
    'I flew all the way out to 433 Eros, a giant tumbling space potato 33 kilometers long! After spending a whole year circling it and mapping thousands of giant craters and boulders, my mission was over. Instead of letting me drift away, my team told me to try something crazy: land right on the asteroid! I had no landing gear at all, but I touched down gently at walking speed and kept transmitting radio signals from the surface for two whole weeks.',
  'dawn-spacecraft':
    'I am the only spacecraft in human history ever to orbit two completely different alien worlds! First, I spent a year exploring the giant asteroid Vesta, then I fired up my glowing blue xenon ion engines and flew to Ceres, a dwarf planet made of rock and ice. Inside Ceres\' giant Occator crater, I discovered glowing white spots made of sodium salts from an ancient underground ocean. When my thruster fuel ran dry, NASA left me in a safe, eternal orbit like a silent moon.',
  'pioneer-kepler':
    'We are humanity\'s greatest cosmic wanderers! Pioneer 10 flew through the asteroid belt and past giant Jupiter, carrying Carl Sagan\'s Golden Plaque etched with pictures of Earth into interstellar space. Decades later, Kepler stared unblinkingly at 150,000 stars, catching the tiny dips in starlight caused by orbiting alien worlds and discovering thousands of new planets. Today, we drift silently through the deep cosmic sea, carrying humanity\'s curiosity beyond our solar home.',
};

export const NASA_HARDWARE_DATA: NasaArtifact[] = [
  {
    id: 'apollo-11-eagle',
    name: 'Apollo 11 Eagle Descent Stage',
    zone: 'Moon',
    statusCategory: 'Silent Surface Monument',
    launchYear: 1969,
    endYear: '1969',
    coordinates: '0.67408° N, 23.47297° E',
    locationName: 'Tranquility Base, Mare Tranquillitatis',
    radioLightDelay: '1.28 Light-Seconds from Earth',
    surfaceEnvironment: '0.166 g Lunar Gravity · +120°C Day / -130°C Night · Hard Vacuum',
    kidFriendlyStory: OMAR_STORIES['apollo-11-eagle'],
    whyItStopped: 'The descent stage served as the launch pad for the Apollo 11 Ascent Stage on July 21, 1969. Once Neil Armstrong and Buzz Aldrin lifted off to rendezvous with Columbia, Eagle descent stage batteries and hypergolic systems had fulfilled their design life, leaving the stage permanently stationed on the lunar surface.',
    scienceUnlocked: 'Proved humanity could soft-land on another celestial world, anchored the first lunar surface science package (EASEP), and enabled collection of 21.55 kg of pristine lunar regolith and breccia samples.',
    nasaDataSource: 'NASA Planetary Data System (PDS) Lunar Geotechnical Data, Apollo 11 Mission Report (NASA SP-238), LROC Narrow Angle Camera Frame M175124932R.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
    missionImageUrl: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001880/GSFC_20171208_Archive_e001880~medium.jpg',
    model3dUrl: '/models/Apollo_Lunar_Module.glb',
    glbUrl: '/models/Apollo_Lunar_Module.glb',
    labType: 'lunar-laser',
    hotspots: [
      {
        id: 'apollo-11-eagle-h1',
        label: 'Descent Propulsion System (DPS) Gimbal Nozzle',
        xPercent: 50,
        yPercent: 68,
        functionDescription: 'Throttleable hypergolic rocket engine (Aerozine 50 / N2O4) producing 4,500 to 45,000 N of thrust to gently guide the 15-ton spacecraft from lunar orbit down to a 0.9 m/s soft touchdown.',
        statusNote: 'Engine bell rests 25 cm above Tranquility Base dust; propellant lines isolated and vented, structure permanently intact.'
      },
      {
        id: 'apollo-11-eagle-h2',
        label: 'Modularized Equipment Stowage Assembly (MESA)',
        xPercent: 28,
        yPercent: 44,
        functionDescription: 'Housed lunar surface tools and the Westinghouse Apollo black-and-white camera that televised Neil Armstrong stepping onto the lunar surface to 650 million viewers on Earth.',
        statusNote: 'Hinged quadrant shelf remains latched in the deployed open position, exposed to 55+ years of vacuum and space weathering.'
      },
      {
        id: 'apollo-11-eagle-h3',
        label: 'Commemorative Plaque on Forward Strut',
        xPercent: 62,
        yPercent: 52,
        functionDescription: 'Stainless steel plaque affixed between ladder rungs stating: "Here men from the planet Earth first set foot upon the Moon July 1969, A.D. We came in peace for all mankind."',
        statusNote: 'Mounted securely to the ladder strut beneath Kapton thermal shielding; completely undisturbed.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'eagle-q1',
        question: 'Why did you stop working?',
        answer: 'My job was to land Neil and Buzz safely and then serve as their launchpad home! On July 21, 1969, when their upper cabin blasted off from my shoulders with less than 25 seconds of landing fuel to spare, my silver-zinc batteries went quiet with my mission 100% complete.',
        telemetryTag: 'NASA SP-238 · ASCENT LIFTOFF 17:54 UTC · TRANQUILITY BASE'
      },
      {
        id: 'eagle-q2',
        question: 'What was your biggest discovery?',
        answer: 'I proved human beings could land on another world and helped my crew gather 21.55 kilograms of ancient volcanic basalt rocks—revealing that the Sea of Tranquility was once an ocean of glowing lava 3.8 billion years ago!',
        telemetryTag: 'NSSDCA 1969-059C · 21.55 KG LUNAR BASALT & BRECCIA SAMPLES'
      },
      {
        id: 'eagle-q3',
        question: 'What does your resting place look like today?',
        answer: 'NASA’s Lunar Reconnaissance Orbiter photographed me from just 24 km overhead! My amber Kapton foil still gleams in the sun, and you can clearly see the dark trails of Neil and Buzz’s bootprints circling my four footpads in the airless dust.',
        telemetryTag: 'LROC NAC FRAME M175124932R · 0.6741° N, 23.4730° E'
      }
    ]
  },
  {
    id: 'alsep-retroreflector',
    name: 'Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
    zone: 'Moon',
    statusCategory: 'Still Active Passively',
    launchYear: 1969,
    endYear: 'Present (Operational)',
    coordinates: '0.67337° N, 23.47352° E',
    locationName: 'Tranquility Base Science Sector, Mare Tranquillitatis',
    radioLightDelay: '1.28 Light-Seconds from Earth (2.56s Round-Trip)',
    surfaceEnvironment: '0.166 g Lunar Gravity · Passive Fused-Silica Optical Array',
    kidFriendlyStory: OMAR_STORIES['alsep-retroreflector'],
    whyItStopped: 'It never stopped. Designed with zero electronics, internal wiring, or chemical batteries, the passive fused-silica corner-cube prisms continue to bounce laser pulses sent from Earth observatories back to their origin point after over five decades.',
    scienceUnlocked: 'Determined that the Moon is spiraling away from Earth at 3.8 cm/year, proved the Moon possesses a liquid outer core, and provided rigorous experimental confirmation of Einstein’s General Theory of Relativity (Equivalence Principle).',
    nasaDataSource: 'NASA Goddard Space Flight Center Laser Ranging Data Network, Apollo 11 Science Report (NASA SP-214), Apache Point Observatory Lunar Laser-ranging Operation (APOLLO).',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA13037/PIA13037~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001880/GSFC_20171208_Archive_e001880~medium.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'lunar-laser',
    hotspots: [
      {
        id: 'alsep-retroreflector-h1',
        label: 'Corner-Cube Prisms Array (100 Fused Quartz Cubes)',
        xPercent: 48,
        yPercent: 42,
        functionDescription: 'Precision total-internal-reflection corner cubes that redirect incoming photons back along the exact incident vector regardless of incoming angle.',
        statusNote: 'Actively returning photons; optical throughput is ~10% of pristine levels due to micro-meteoroid pitting and levitated dust deposition.'
      },
      {
        id: 'alsep-retroreflector-h2',
        label: 'Thermal Sunshade & Alignment Housing',
        xPercent: 32,
        yPercent: 65,
        functionDescription: 'Open-face sunshade structure designed to minimize thermal gradients across the prisms during lunar day/night cycles (+120°C to -130°C).',
        statusNote: 'Stable structural alignment maintained facing Earth’s mean libration center.'
      },
      {
        id: 'alsep-retroreflector-h3',
        label: 'Gnomon & Directional Leveling Plate',
        xPercent: 68,
        yPercent: 78,
        functionDescription: 'Shadow-casting pin used by Buzz Aldrin to orient the array azimuth and elevation precisely toward Earth.',
        statusNote: 'Cast shadow continuously rotates across the faceplate with each 29.5-day synodic lunar cycle.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'lrrr-q1',
        question: 'Why did you stop working?',
        answer: 'Surprise—I never stopped working! Because I am made of 100 ultra-pure quartz corner mirrors with zero wires, motors, or batteries to wear out, I still bounce green laser flashes back to Earth observatories every clear night!',
        telemetryTag: 'NSSDCA 1969-059C-04 · PASSIVE OPTICAL ARRAY · ACTIVE 55+ YEARS'
      },
      {
        id: 'lrrr-q2',
        question: 'What was your biggest discovery?',
        answer: 'By timing laser photons making the 2.56-second round trip from Earth to my mirrors and back, I proved that the Moon is slowly spiraling away from Earth by 3.8 centimeters every year—and that a fluid core sloshes deep inside the Moon!',
        telemetryTag: 'APOLLO LASER RANGING · +3.8 CM/YR RECESSION · MILLIMETER PRECISION'
      },
      {
        id: 'lrrr-q3',
        question: 'What does your resting place look like today?',
        answer: 'I sit level in the gray regolith just 18 meters southwest of the Eagle descent stage. A fine whisper of electrostatic Moon dust coats my aluminum frame, but my recessed quartz prisms still catch the blue glow of Earth high in my sky.',
        telemetryTag: 'LROC NAC M175124932R · 0.6734° N, 23.4729° E · EASEP SECTOR'
      }
    ]
  },
  {
    id: 'apollo-lrv',
    name: 'Apollo 17 Lunar Roving Vehicle (LRV-3)',
    zone: 'Moon',
    statusCategory: 'Silent Surface Monument',
    launchYear: 1972,
    endYear: '1972',
    coordinates: '20.1311° N, 30.7773° E',
    locationName: 'Taurus-Littrow Valley VIP Site (Apollo 17)',
    radioLightDelay: '1.28 Light-Seconds from Earth',
    surfaceEnvironment: '0.166 g Lunar Gravity · Sculptured Highlands & Regolith',
    kidFriendlyStory: OMAR_STORIES['apollo-lrv'],
    whyItStopped: 'Parked intentionally by Commander Gene Cernan at the "VIP site" ~140 meters east of the Challenger Lunar Module so its ground-controlled television camera could record the ascent stage liftoff. Its non-rechargeable 36-volt silver-zinc batteries depleted shortly after.',
    scienceUnlocked: 'Dramatically extended astronaut surface exploration range up to 35.7 km, enabling geological sampling across the Taurus-Littrow sculptured hills and the collection of ancient volcanic orange soil beads.',
    nasaDataSource: 'NASA MSFC Lunar Roving Vehicle Operations Handbook (LS006-002-2H), LROC NAC Frame M168000580LR, NASA PDS Apollo Lunar Surface Journal.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C',
    missionImageUrl: 'https://images-assets.nasa.gov/image/as17-147-22527/as17-147-22527~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001882/GSFC_20171208_Archive_e001882~small.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'lunar-laser',
    hotspots: [
      {
        id: 'apollo-lrv-h1',
        label: 'Woven Zinc-Coated Steel Wire Mesh Wheels',
        xPercent: 75,
        yPercent: 72,
        functionDescription: 'Puncture-proof wheels made of woven zinc-coated steel strands with titanium chevrons for traction over soft lunar regolith without risk of vacuum blowouts.',
        statusNote: 'Open-mesh wire structure intact with zero pressure decay; lightly coated in fine regolith.'
      },
      {
        id: 'apollo-lrv-h2',
        label: 'Ground-Controlled Television Assembly (GCTA)',
        xPercent: 28,
        yPercent: 32,
        functionDescription: 'Color TV camera remotely actuated by mission control in Houston to broadcast astronaut EVAs and the Apollo 17 lunar liftoff.',
        statusNote: 'Stationary mast pointed toward the Taurus-Littrow horizon; optics frosted by solar UV and dust.'
      },
      {
        id: 'apollo-lrv-h3',
        label: 'Improvised Chronoflex Map & Duct Tape Fender',
        xPercent: 55,
        yPercent: 58,
        functionDescription: 'Emergency regolith fender extension fabricated by Cernan and Schmitt from laminated lunar photo maps and gray duct tape after an accidental hammer collision.',
        statusNote: 'Historic field repair artifact; tape adhesive brittle from 50+ years of extreme thermal cycling.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'lrv-q1',
        question: 'Why did you stop working?',
        answer: 'Commander Gene Cernan parked me 140 meters east of the Challenger lander so my remote-controlled TV camera could film their rocket blasting off! Once I broadcast that historic liftoff to Earth, my two 36-volt silver-zinc batteries peacefully drained.',
        telemetryTag: 'NASA MSFC LS006-002-2H · 35.74 KM DRIVEN · 72 V SILVER-ZINC'
      },
      {
        id: 'lrv-q2',
        question: 'What was your biggest discovery?',
        answer: 'I carried geologist Harrison Schmitt and Gene Cernan across craters to Shorty Crater, where we found glowing orange volcanic glass beads—proving that fiery lava fountains erupted on the Moon 3.6 billion years ago!',
        telemetryTag: 'APOLLO 17 SAMPLE 74220 · PYROCLASTIC ORANGE GLASS BEADS'
      },
      {
        id: 'lrv-q3',
        question: 'What does your resting place look like today?',
        answer: 'I sit parked in the majestic Taurus-Littrow mountain valley, flanked by peaks taller than the Grand Canyon! My twin parallel wheel tracks still wind across the valley floor exactly where we drove in December 1972.',
        telemetryTag: 'LROC NAC M168000580LR · 20.1908° N, 30.7717° E · VIP PARKING SITE'
      }
    ]
  },
  {
    id: 'surveyor-3',
    name: 'Surveyor 3 Robotic Lander (Apollo 12 Visit Site)',
    zone: 'Moon',
    statusCategory: 'Silent Surface Monument',
    launchYear: 1967,
    endYear: '1967 (Visited 1969)',
    coordinates: '3.015° S, 23.418° W',
    locationName: 'Surveyor Crater, Oceanus Procellarum',
    radioLightDelay: '1.28 Light-Seconds from Earth',
    surfaceEnvironment: '0.166 g Lunar Gravity · Inside 200m Crater Slope',
    kidFriendlyStory: OMAR_STORIES['surveyor-3'],
    whyItStopped: 'Batteries discharged after surviving the freezing two-week lunar night in May 1967 following transmission of 6,315 television frames. In November 1969, Apollo 12 executed a pinpoint landing 160 meters away, and Pete Conrad and Alan Bean retrieved key components for forensic analysis.',
    scienceUnlocked: 'Conducted the first robotic mechanical trenching on lunar soil, verifying load-bearing capacity for human Apollo landings; returned components delivered the only human forensic study of multi-year space environmental exposure on hardware.',
    nasaDataSource: 'NASA JPL Surveyor 3 Mission Report (JPL-TR-32-1177), Analysis of Surveyor 3 Materials (NASA SP-284), LROC NAC Frame M114110397R.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/as12-48-7121/as12-48-7121~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001881/GSFC_20171208_Archive_e001881~medium.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'lunar-laser',
    hotspots: [
      {
        id: 'surveyor-3-h1',
        label: 'Surface Sampler Mechanism & Soil Scoop',
        xPercent: 34,
        yPercent: 62,
        functionDescription: 'Motorized scissor-arm pantograph with a motorized scoop used to dig trenches up to 17.5 cm deep to measure shear strength and soil cohesion.',
        statusNote: 'Scoop mechanism remains partially resting in its final excavated trench inside Surveyor Crater.'
      },
      {
        id: 'surveyor-3-h2',
        label: 'Solar Panel & Planar High-Gain Antenna Mast',
        xPercent: 52,
        yPercent: 24,
        functionDescription: 'Rotatable mast containing 792 solar cells producing 89 W of power and high-gain antenna for real-time video transmission.',
        statusNote: 'Discolored by Apollo 12 descent rocket dust impingement; tracking motors frozen.'
      },
      {
        id: 'surveyor-3-h3',
        label: 'Retrieved Vidicon TV Camera Mounting Frame',
        xPercent: 65,
        yPercent: 48,
        functionDescription: 'Original structural mount that held the vidicon optical camera tube and color filter wheel.',
        statusNote: 'Cut with bolt cutters by Apollo 12 astronauts; camera returned to Earth and now displayed at the Smithsonian National Air and Space Museum.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'surveyor-q1',
        question: 'Why did you stop working?',
        answer: 'After sending 6,315 television pictures and digging trenches for two weeks in April 1967, the sun sank below the horizon. During the freezing 14-day lunar night (-150°C), my battery heaters ran out of energy and I went to sleep.',
        telemetryTag: 'JPL-TR-32-1177 · 6,315 TV FRAMES · LUNAR NIGHT TERMINATION'
      },
      {
        id: 'surveyor-q2',
        question: 'What was your biggest discovery?',
        answer: 'With my motorized scissor scoop, I dug 18-centimeter trenches in the Ocean of Storms and proved the Moon was firm enough to hold heavy spaceships—clearing the way for Apollo astronauts to land safely!',
        telemetryTag: 'NASA SP-284 · SOIL BEARING STRENGTH 0.7 KG/CM² VERIFIED'
      },
      {
        id: 'surveyor-q3',
        question: 'What does your resting place look like today?',
        answer: 'I rest on the inner slope of Surveyor Crater, surrounded by two sets of footprints—my own trench marks from 1967 and the bootprints of Apollo 12 astronauts Pete Conrad and Alan Bean, who walked over in 1969 to bring my camera home!',
        telemetryTag: 'LROC NAC M114110397R · 3.0155° S, 23.4219° W · OCEANUS PROCELLARUM'
      }
    ]
  },
  {
    id: 'ingenuity-helicopter',
    name: 'Ingenuity Mars Helicopter',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 2020,
    endYear: '2024',
    coordinates: '18.4446° N, 77.4508° E',
    locationName: 'Valinor Hills, Jezero Crater',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · 1% Earth Atmosphere Density · -90°C Nights',
    kidFriendlyStory: OMAR_STORIES['ingenuity-helicopter'],
    whyItStopped: 'During Flight 72 on January 18, 2024, navigating featureless sandy terrain caused optical navigation imaging errors; during an emergency landing, one or more carbon-fiber rotor blades struck the surface and fractured, rendering sustained aerodynamic flight impossible.',
    scienceUnlocked: 'First powered, controlled flight on another planet (72 flights, 17.0 km traveled, 128.8 cumulative flight minutes in an atmosphere only 1% of Earth’s density); revolutionized planetary robotics by proving aerial scouting for rovers.',
    nasaDataSource: 'NASA JPL Mars Helicopter Technology Demonstration Archive, PDS Mars 2020 Mission Archive, HiRISE Jezero Crater Orthoimagery.',
    nasaSourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA24486/PIA24486~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA26244/PIA26244~small.jpg',
    model3dUrl: '/models/Ingenuity_Mars_Helicopter.glb',
    glbUrl: '/models/Ingenuity_Mars_Helicopter.glb',
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'ingenuity-helicopter-h1',
        label: 'Counter-Rotating Carbon-Fiber Rotor Blades',
        xPercent: 50,
        yPercent: 25,
        functionDescription: 'Twin 1.2-meter coaxial counter-rotating blades designed with high tip Mach numbers to generate aerodynamic lift in Mars’ 0.006-bar thin carbon dioxide atmosphere.',
        statusNote: 'One rotor blade severed at the tip during touchdown on Valinor Hills; rotors permanently immobilized.'
      },
      {
        id: 'ingenuity-helicopter-h2',
        label: 'Top-Mounted Solar Photovoltaic Cell',
        xPercent: 50,
        yPercent: 12,
        functionDescription: 'High-efficiency solar array that charged six Sony lithium-ion cells each sol and powered internal electric heaters to survive freezing Martian nights (-90°C).',
        statusNote: 'Still generates standby electrical power; internal software continues collecting environmental temperature logs.'
      },
      {
        id: 'ingenuity-helicopter-h3',
        label: 'Downward-Facing Optical Navigation Camera & Altimeter',
        xPercent: 50,
        yPercent: 72,
        functionDescription: 'Black-and-white downward camera tracking surface feature displacement at 30 fps combined with a 54-meter laser altimeter.',
        statusNote: 'Lens intact and pointed down at the rippled sand of Valinor Hills.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'ginny-q1',
        question: 'Why did you stop working?',
        answer: 'On Flight 72 in January 2024, I flew over smooth sand dunes with almost no rocks for my downward camera to track. When I made a hard touchdown, my spinning rotor blade tips clipped the slope and snapped—ending my flying days!',
        telemetryTag: 'JPL FLIGHT 72 LOG · JAN 18, 2024 · ROTOR TIP FRACTURE'
      },
      {
        id: 'ginny-q2',
        question: 'What was your biggest discovery?',
        answer: 'I proved that heavier-than-air aircraft can fly in an alien atmosphere 100 times thinner than Earth’s! Instead of just 5 test flights, I completed 72 flights over 17 kilometers, scouting ancient river delta cliffs for Perseverance.',
        telemetryTag: 'NASA PDS MARS 2020 · 72 FLIGHTS · 128.8 CUMULATIVE FLIGHT MINUTES'
      },
      {
        id: 'ginny-q3',
        question: 'What does your resting place look like today?',
        answer: 'I stand upright on the sandy ripples of Valinor Hills inside Jezero Crater! Even though I can never fly again, my solar panel still wakes up my computer each morning to record Martian temperatures like a weather station.',
        telemetryTag: 'HIRISE PIA26244 · 18.4972° N, 77.3210° E · VALINOR HILLS'
      }
    ]
  },
  {
    id: 'opportunity-rover',
    name: 'Opportunity Mars Exploration Rover (MER-B / Oppy)',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 2003,
    endYear: '2018',
    coordinates: '2.348° S, 354.674° E',
    locationName: 'Perseverance Valley, Endeavour Crater',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · Hematite Plains & Crater Rim',
    kidFriendlyStory: OMAR_STORIES['opportunity-rover'],
    whyItStopped: 'A catastrophic planet-encircling dust storm in June 2018 blocked out sunlight (atmospheric opacity tau exceeded 10.8), preventing solar panels from recharging its lithium-ion batteries and driving the rover into permanent low-power sleep.',
    scienceUnlocked: 'Traveled 45.16 km over 14.8 years (original mission: 90 days); discovered hematite "blueberries" and sulfate rock veins proving persistent liquid water once flowed on ancient Mars.',
    nasaDataSource: 'NASA PDS Mars Exploration Rover (MER) Opportunity Archive, JPL MER Science Reports, HiRISE Frame ESP_056972_1775.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA20285/PIA20285~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA22728/PIA22728~medium.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'opportunity-rover-h1',
        label: 'Triple-Junction Solar Cell Deck',
        xPercent: 52,
        yPercent: 45,
        functionDescription: 'Generates up to 140 W of peak electrical power to drive wheels, instruments, and survival electronics across Martian seasons.',
        statusNote: 'Heavily blanketed by iron-oxide dust from the 2018 global dust storm; power output dropped below mission operating threshold.'
      },
      {
        id: 'opportunity-rover-h2',
        label: 'Rock Abrasion Tool (RAT) & Instrument Arm',
        xPercent: 25,
        yPercent: 75,
        functionDescription: 'Diamond-tipped grinding bit mounted on an articulated robotic arm to grind through rock rind to expose pristine minerals.',
        statusNote: 'Grinding wheels worn down through dozens of targets; arm safely stowed in transit latch position.'
      },
      {
        id: 'opportunity-rover-h3',
        label: 'Panoramic Camera (Pancam) Stereo Mast',
        xPercent: 70,
        yPercent: 25,
        functionDescription: 'Dual multispectral color camera assembly standing 1.5 meters tall providing 360-degree stereo views of the Martian terrain.',
        statusNote: 'Perched high overlooking the sweeping floor of Endeavour Crater.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'oppy-q1',
        question: 'Why did you stop working?',
        answer: 'In June 2018, the worst planet-wide dust storm ever recorded wrapped around Mars and turned day into pitch-black night (tau > 10.8). Without sunlight to charge my solar wings or run my survival heaters, I fell into a deep sleep.',
        telemetryTag: 'JPL MER-B SOL 5111 · OPACITY TAU > 10.8 · JUNE 10, 2018'
      },
      {
        id: 'oppy-q2',
        question: 'What was your biggest discovery?',
        answer: 'I discovered millions of tiny iron-rich mineral spheres nicknamed "blueberries" (hematite) and ancient clay veins along Endeavour Crater—proving that warm, drinkable liquid water once pooled across Mars!',
        telemetryTag: 'NASA PDS MER-B · 45.16 KM MARATHON · HEMATITE & CLAY VEINS'
      },
      {
        id: 'oppy-q3',
        question: 'What does your resting place look like today?',
        answer: 'I rest partway down Perseverance Valley on the western rim of giant 22-kilometer-wide Endeavour Crater, dusted in rust-red iron oxide and looking out over the ancient basin I spent years exploring.',
        telemetryTag: 'HIRISE ESP_056972_1775 · 2.2816° S, 5.3636° W · ENDEAVOUR CRATER'
      }
    ]
  },
  {
    id: 'spirit-rover',
    name: 'Spirit Mars Exploration Rover (MER-A)',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 2003,
    endYear: '2010',
    coordinates: '14.5684° S, 175.4726° E',
    locationName: 'Troy, West Valley, Gusev Crater',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · Volcanic Basalt & Sulfate Sand',
    kidFriendlyStory: OMAR_STORIES['spirit-rover'],
    whyItStopped: 'In May 2009, Spirit\'s wheels broke through a crusty sulfur surface layer and became ensnarled in hidden soft sand at site "Troy". Unable to tilt its dust-coated solar arrays toward the low winter sun, it ceased communication on March 22, 2010.',
    scienceUnlocked: 'Discovered 90% pure silica deposits in Home Plate volcanic soils—unequivocal evidence of ancient hydrothermal fumaroles or hot springs conducive to microbial life.',
    nasaDataSource: 'NASA PDS MER Spirit Science Archive, JPL Mars Exploration Reports, HiRISE Frame PSP_003688_1650.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA05500/PIA05500~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA08802/PIA08802~medium.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'spirit-rover-h1',
        label: 'Seized Right-Front Drive Wheel',
        xPercent: 78,
        yPercent: 72,
        functionDescription: 'Independent motor drive wheel that failed in sol 779, forcing engineers to turn Spirit around and drag the locked wheel across the surface.',
        statusNote: 'Deeply embedded in the powdery sulfate soil at site Troy; exposed pristine silica beneath the surface crust.'
      },
      {
        id: 'spirit-rover-h2',
        label: 'Miniature Thermal Emission Spectrometer (Mini-TES)',
        xPercent: 62,
        yPercent: 28,
        functionDescription: 'Infrared spectrometer analyzing mineral thermal signatures from rock and soil targets at long distance.',
        statusNote: 'Internal mirror shielded, dormant since power loss in Martian winter.'
      },
      {
        id: 'spirit-rover-h3',
        label: 'High-Gain Gimbaled Dish Antenna',
        xPercent: 35,
        yPercent: 35,
        functionDescription: 'Steerable directional antenna pointing directly toward NASA Deep Space Network receiver dishes on Earth.',
        statusNote: 'Frozen in its final orientation facing the northern sky of Gusev Crater.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'spirit-q1',
        question: 'Why did you stop working?',
        answer: 'While driving beside Home Plate in 2009, my wheels broke through a thin crust into hidden powdery sand called "Troy." Stuck at an angle, I couldn’t tilt my dusty solar wings toward the weak winter sun, and I sent my last message in March 2010.',
        telemetryTag: 'JPL MER-A SOL 2210 · LAST SIGNAL MARCH 22, 2010 · SITE TROY'
      },
      {
        id: 'spirit-q2',
        question: 'What was your biggest discovery?',
        answer: 'When my right-front wheel jammed, I had to drive backward and drag it like a plow! That dragging wheel scraped away the red dirt and uncovered 90% pure white silica—proof of ancient volcanic hot springs where tiny microbes could have lived!',
        telemetryTag: 'NASA PDS MER-A · HOME PLATE OPALINE SILICA · HYDROTHERMAL EVIDENCE'
      },
      {
        id: 'spirit-q3',
        question: 'What does your resting place look like today?',
        answer: 'I sit nestled in the soft sulfate sand on the western edge of the Home Plate plateau inside Gusev Crater, with the Columbia Hills—the very first mountain ever climbed by a robot on Mars—rising right behind me.',
        telemetryTag: 'HIRISE PSP_003688_1650 · 14.5684° S, 175.4726° E · GUSEV CRATER'
      }
    ]
  },
  {
    id: 'insight-lander',
    name: 'InSight Mars Geophysical Lander',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 2018,
    endYear: '2022',
    coordinates: '4.502° N, 135.623° E',
    locationName: 'Elysium Planitia',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · Equatorial Plain · 1,319 Marsquakes Logged',
    kidFriendlyStory: OMAR_STORIES['insight-lander'],
    whyItStopped: 'Four years of relentless atmospheric dust accumulation thick as a coin on its dual 2.2-meter solar panels reduced electrical output from 5,000 watt-hours to under 285 watt-hours per sol until contact was lost in December 2022.',
    scienceUnlocked: 'Detected over 1,319 Marsquakes, mapped Mars\' crust thickness (24–72 km), confirmed a liquid iron-nickel core radius of ~1,830 km, and measured real-time meteorite impact acoustic shockwaves.',
    nasaDataSource: 'NASA PDS InSight Geophysical Data Node, IPGP SEIS Seismology Data Archive, HiRISE Elysium Planitia Series.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA22872/PIA22872~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA23000/PIA23000~small.jpg',
    model3dUrl: '/models/InSight_Cruise_Lander_(arm_deployed).glb',
    glbUrl: '/models/InSight_Cruise_Lander_(arm_deployed).glb',
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'insight-lander-h1',
        label: 'Seismic Experiment for Interior Structure (SEIS) Dome',
        xPercent: 22,
        yPercent: 65,
        functionDescription: 'Ultra-sensitive three-axis seismometer sealed inside a vacuum sphere and protected by an aerodynamic wind and thermal shield to sense ground tremors.',
        statusNote: 'Rests undisturbed on Elysium Planitia soil, sheltered beneath its copper-colored thermal dome.'
      },
      {
        id: 'insight-lander-h2',
        label: 'Dual 2.2-Meter UltraFlex Solar Arrays',
        xPercent: 82,
        yPercent: 40,
        functionDescription: 'Fan-folded decagonal photovoltaic arrays that generated 4.5 kWh/sol upon landing to power scientific sensors.',
        statusNote: 'Fully coated in a thick, uniform layer of reddish iron-oxide dust; arrays are intact but optically blocked.'
      },
      {
        id: 'insight-lander-h3',
        label: 'Heat Flow and Physical Properties Package (HP3 "Mole")',
        xPercent: 38,
        yPercent: 75,
        functionDescription: 'Self-hammering mechanical spike designed to burrow 3 to 5 meters underground to measure core heat escaping from Mars.',
        statusNote: 'Partially buried ~30 cm down due to unexpectedly clumping cohesive soil duricrust.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'insight-q1',
        question: 'Why did you stop working?',
        answer: 'Instead of turning off my seismometer early to save battery, my scientists asked me to keep listening to Marsquakes until my very last drop of energy! By December 2022, red dust covered my round solar fans so thickly that I peacefully powered down.',
        telemetryTag: 'JPL INSIGHT SOL 1440 · DEC 15, 2022 · SOLAR OUTPUT < 285 WH/SOL'
      },
      {
        id: 'insight-q2',
        question: 'What was your biggest discovery?',
        answer: 'By feeling 1,319 Marsquakes rumble through the planet, I took the first "ultrasound" of Mars’s deep interior—revealing a layered rocky crust and a giant liquid iron-alloy core 1,830 kilometers in radius!',
        telemetryTag: 'PDS SEIS CATALOG · 1,319 MARSQUAKES · CORE RADIUS 1,830 KM'
      },
      {
        id: 'insight-q3',
        question: 'What does your resting place look like today?',
        answer: 'I stand on the quiet, flat volcanic plain of Elysium Planitia with my robotic arm stretched out in front of me and my shiny copper-gold SEIS dome resting right on the ground like a stethoscope.',
        telemetryTag: 'HIRISE PIA23000 · 4.5024° N, 135.6234° E · ELYSIUM PLANITIA'
      }
    ]
  },
  {
    id: 'phoenix-lander',
    name: 'Phoenix Mars Polar Lander',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 2007,
    endYear: '2008',
    coordinates: '68.2188° N, 234.2508° E',
    locationName: 'Green Valley, Vastitas Borealis',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · Martian Arctic Permafrost (-120°C Winter)',
    kidFriendlyStory: OMAR_STORIES['phoenix-lander'],
    whyItStopped: 'Designed for Martian polar summer; as winter approached, sunlight vanished and temperatures dropped below -120°C. Vast amounts of carbon dioxide frozen into dry ice encased the lander, and the weight of the ice sheet snapped its solar arrays.',
    scienceUnlocked: 'Dug into the arctic Martian permafrost and directly imaged chunks of water-ice sublimating in sunlight; identified perchlorate salts and calcium carbonate indicating liquid water past.',
    nasaDataSource: 'NASA PDS Mars Phoenix Lander Archive, University of Arizona Lunar and Planetary Laboratory, HiRISE Polar Imaging Series.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/KSC-07PD-1085/KSC-07PD-1085~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA13146/PIA13146~medium.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'phoenix-lander-h1',
        label: 'Robotic Trenching Arm & TEGA Thermal Oven',
        xPercent: 28,
        yPercent: 68,
        functionDescription: '2.35-meter titanium-aluminum arm with a motorized rasp scoop that delivered arctic permafrost soil into tiny 1000°C miniature ovens.',
        statusNote: 'Extended downward into "Snow White" trench; samples delivered and analyzed.'
      },
      {
        id: 'phoenix-lander-h2',
        label: 'Decagonal Solar Array Wings',
        xPercent: 75,
        yPercent: 35,
        functionDescription: 'Twin circular solar panels generating 130 W of power during the 24-hour continuous arctic polar summer daylight.',
        statusNote: 'HiRISE orbital imagery confirms the eastern solar array collapsed under the immense load of winter CO2 ice.'
      },
      {
        id: 'phoenix-lander-h3',
        label: 'Meteorological Station (MET) LiDAR Mast',
        xPercent: 52,
        yPercent: 22,
        functionDescription: 'Laser radar system that pulsed green laser beams into the sky to detect high-altitude Martian water-ice cirrus clouds and falling snow.',
        statusNote: 'Mast intact; verified snow falling from Martian clouds before the polar night set in.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'phoenix-q1',
        question: 'Why did you stop working?',
        answer: 'I landed near Mars’s freezing North Pole during arctic summer. After 5 months of non-stop science, the polar sun sank below the horizon for winter, temperatures plunged below -120°C, and hundreds of kilograms of heavy dry-ice frost buried me.',
        telemetryTag: 'JPL PHOENIX SOL 152 · NOV 2, 2008 · POLAR WINTER CO2 FROST'
      },
      {
        id: 'phoenix-q2',
        question: 'What was your biggest discovery?',
        answer: 'I dug just 5 centimeters beneath the red soil and struck a solid sheet of glittering white water ice! I baked that ice in my miniature TEGA ovens to taste real Martian water and watched snow fall from Martian clouds with my laser.',
        telemetryTag: 'NASA PDS PHOENIX TEGA · SUBSURFACE H2O ICE & CALCIUM CARBONATE'
      },
      {
        id: 'phoenix-q3',
        question: 'What does your resting place look like today?',
        answer: 'Every Martian winter, a thick blanket of frozen carbon dioxide encases me on the polygonal permafrost plains of Green Valley, and HiRISE orbital photos show one of my round solar wings bowed down into the arctic soil.',
        telemetryTag: 'HIRISE PIA13146 · 68.2188° N, 125.7492° W · VASTITAS BOREALIS'
      }
    ]
  },
  {
    id: 'sojourner-viking',
    name: 'Sojourner Rover & Viking 1 Lander',
    zone: 'Mars',
    statusCategory: 'Silent Surface Monument',
    launchYear: 1996,
    endYear: '1997 / 1982',
    coordinates: '19.33° N, 326.45° E',
    locationName: 'Ares Vallis Floodplain & Chryse Planitia',
    radioLightDelay: '~14.2 Light-Minutes from Earth',
    surfaceEnvironment: '0.38 g Mars Gravity · Outflow Floodplain Boulders',
    kidFriendlyStory: OMAR_STORIES['sojourner-viking'],
    whyItStopped: 'Mars Pathfinder / Sojourner ceased transmission on September 27, 1997 due to a dead lander main battery causing cold-induced electronics failure. Sojourner dutifully circled the silent base station. Viking 1 Lander operated until November 1982 when a human uplink command accidentally overwrote antenna telemetry.',
    scienceUnlocked: 'First micro-rover to explore Mars; conducted Alpha Proton X-ray Spectrometer (APXS) analysis of Martian rocks (e.g., "Barnacle Bill"), confirming ancient cataclysmic water outflow channels in Ares Vallis.',
    nasaDataSource: 'NASA PDS Mars Pathfinder Archive, NASA Ames Viking Science Archive, JPL Deep Space Historical Data.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA01122/PIA01122~small.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA09105/PIA09105~medium.jpg',
    model3dUrl: '/models/Viking_Lander.glb',
    glbUrl: '/models/Viking_Lander.glb',
    labType: 'mars-dust-quake',
    hotspots: [
      {
        id: 'sojourner-viking-h1',
        label: 'Alpha Proton X-ray Spectrometer (APXS)',
        xPercent: 32,
        yPercent: 72,
        functionDescription: 'Sensor containing radioactive Curium-244 placed against rock faces to identify chemical elements by bombarding them with alpha particles.',
        statusNote: 'Positioned facing rock "Yogi"; alpha source has decayed harmlessly over decades.'
      },
      {
        id: 'sojourner-viking-h2',
        label: 'Rocker-Bogie 6-Wheel Suspension Assembly',
        xPercent: 65,
        yPercent: 78,
        functionDescription: 'Unsprung differential mechanical suspension allowing the 10.6 kg rover to climb over rocks bigger than its wheels without tipping over.',
        statusNote: 'Resting beside the Carl Sagan Memorial Station on the Ares Vallis floodplain.'
      },
      {
        id: 'sojourner-viking-h3',
        label: 'Pathfinder Solar Petal & Low-Gain Antenna',
        xPercent: 50,
        yPercent: 30,
        functionDescription: 'Triangular lander base petal that unfolded after airbag impact, housing primary radio relay transmitters.',
        statusNote: 'Solar cells permanently dark; structure fully visible in HiRISE orbital imagery.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'sojourner-q1',
        question: 'Why did you stop working?',
        answer: 'After 83 Martian days, my base station Pathfinder’s rechargeable battery wore out in the freezing cold. Because my safety instructions told me to circle my base station if it ever went quiet, I dutifully drove in circles around Pathfinder waiting for a signal!',
        telemetryTag: 'NSSDCA 1996-068A · SOL 83 FINAL SIGNAL · SEPT 27, 1997'
      },
      {
        id: 'sojourner-q2',
        question: 'What was your biggest discovery?',
        answer: 'Viking 1 sent humanity’s first ground-level photos of Mars in 1976, and I became the very first wheeled rover on Mars in 1997—using my X-ray nose to inspect rounded boulders swept down Ares Vallis by ancient mega-floods!',
        telemetryTag: 'PDS PATHFINDER APXS · "BARNACLE BILL" & "YOGI" ROCK ANALYSIS'
      },
      {
        id: 'sojourner-q3',
        question: 'What does your resting place look like today?',
        answer: 'I rest beside the unfolded solar petals of the Carl Sagan Memorial Station in the boulder-strewn Ares Vallis valley, while Viking 1 stands upright across the plain in Chryse Planitia.',
        telemetryTag: 'HIRISE PIA09105 · 19.33° N, 33.55° W · ARES VALLIS & CHRYSE PLANITIA'
      }
    ]
  },
  {
    id: 'near-shoemaker',
    name: 'NEAR Shoemaker (Asteroid 433 Eros)',
    zone: 'Asteroids & Dwarf Planets',
    statusCategory: 'Silent Surface Monument',
    launchYear: 1996,
    endYear: '2001',
    coordinates: '43.0° S, 279.0° E',
    locationName: 'Himeros Depression Saddle, Asteroid 433 Eros',
    radioLightDelay: '~17.6 Light-Minutes from Earth',
    surfaceEnvironment: '0.0006 g Microgravity · Stony Chondrite Asteroid Surface',
    kidFriendlyStory: OMAR_STORIES['near-shoemaker'],
    whyItStopped: 'After completing its orbital survey of near-Earth asteroid 433 Eros, mission controllers directed the spacecraft to make a gentle 1.9 m/s descent onto the rocky surface on February 12, 2001. Though never designed as a lander, it survived and transmitted surface X-ray spectrometry until its signal was terminated on February 28, 2001.',
    scienceUnlocked: 'First spacecraft to orbit and land on an asteroid; mapped 433 Eros\' irregular shape, gravity field, and composition, revealing it to be an un-differentiated primitive stony chondrite from the birth of the Solar System.',
    nasaDataSource: 'NASA PDS Small Bodies Node (SBN) NEAR Archive, Johns Hopkins Applied Physics Laboratory (JHU/APL) Mission Data.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-008A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA18177/PIA18177~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA02474/PIA02474~small.jpg',
    model3dUrl: '',
    glbUrl: undefined,
    labType: 'kepler-transit',
    hotspots: [
      {
        id: 'near-shoemaker-h1',
        label: 'X-Ray / Gamma-Ray Spectrometer (XGRS)',
        xPercent: 45,
        yPercent: 55,
        functionDescription: 'Detected elemental abundance ratios (Mg/Si, Fe/Si) of surface rocks while descending through Eros’ microgravity field.',
        statusNote: 'Resting directly in contact with regolith on Eros’ southern hemisphere.'
      },
      {
        id: 'near-shoemaker-h2',
        label: 'Four Fixed Gallium-Arsenide Solar Panels',
        xPercent: 80,
        yPercent: 35,
        functionDescription: 'Fixed wing-like solar arrays generating 1,800 W at 1 AU from the Sun to power sensors and reaction wheels.',
        statusNote: 'Two solar wings partially resting against surface boulders in vacuum.'
      },
      {
        id: 'near-shoemaker-h3',
        label: 'Near-Infrared Spectrometer & Laser Rangefinder',
        xPercent: 25,
        yPercent: 65,
        functionDescription: 'Laser diode altimeter that bounced light off the asteroid surface to construct 3D elevation maps of Eros with meter accuracy.',
        statusNote: 'Optics preserved in cold space vacuum on the asteroid surface.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'near-q1',
        question: 'Why did you stop working?',
        answer: 'I wasn’t even built with landing legs! After orbiting Asteroid 433 Eros for a year, my fuel was nearly gone, so engineers gently touched me down on the tips of my solar panels on February 12, 2001. I beamed bonus surface data for 16 days before freezing.',
        telemetryTag: 'JHU/APL NEAR LOG · 1.6 M/S TOUCHDOWN · FEB 28, 2001 FINAL SIGNAL'
      },
      {
        id: 'near-q2',
        question: 'What was your biggest discovery?',
        answer: 'I took 160,000 close-up photos of peanut-shaped 433 Eros and used my gamma-ray sensor right on the ground to prove Eros is an ancient, unmelted stony building block from the birth of the Solar System 4.5 billion years ago!',
        telemetryTag: 'PDS SMALL BODIES NODE · 160,000 IMAGES · PRIMITIVE CHONDRITE'
      },
      {
        id: 'near-q3',
        question: 'What does your resting place look like today?',
        answer: 'I sit perched on the edge of a dusty boulder pond inside the Himeros saddle on 433 Eros, riding a 33-kilometer-long space rock that tumbles end-over-end every 5.27 hours as it orbits the Sun!',
        telemetryTag: 'NSSDCA 1996-008A · 35.0° S, 279.0° W · ASTEROID 433 EROS'
      }
    ]
  },
  {
    id: 'dawn-spacecraft',
    name: 'Dawn Spacecraft (Ceres Orbit)',
    zone: 'Asteroids & Dwarf Planets',
    statusCategory: 'Perpetual Orbit & Deep Space Drifter',
    launchYear: 2007,
    endYear: '2018',
    coordinates: 'Perpetual Stable Orbit: 35 km to 4,000 km altitude',
    locationName: 'Frozen Orbit around Dwarf Planet Ceres (Asteroid Belt)',
    radioLightDelay: '~23.1 Light-Minutes from Earth',
    surfaceEnvironment: 'Zero-G Quarantine Orbit Above Dwarf Planet Ceres (2.77 AU)',
    kidFriendlyStory: OMAR_STORIES['dawn-spacecraft'],
    whyItStopped: 'On October 31, 2018, Dawn exhausted its hydrazine attitude-control propellant, losing the ability to orient its solar panels to the sun or aim its high-gain antenna to Earth. Planetary protection protocols placed Dawn in an ultra-stable gravitational orbit around Ceres, guaranteed not to collide for at least 50+ years.',
    scienceUnlocked: 'First spacecraft to orbit two separate extraterrestrial destinations (Vesta and Ceres); discovered ancient subsurface brine reservoirs, organic molecules, and the famous glowing sodium-carbonate salt deposits in Occator Crater.',
    nasaDataSource: 'NASA PDS Dawn Mission to Vesta & Ceres Node, JPL Dawn Flight Science Reports, Ceres Occator Crater High-Resolution Mapping.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/PIA12033/PIA12033~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA22477/PIA22477~medium.jpg',
    model3dUrl: '/models/Dawn.glb',
    glbUrl: '/models/Dawn.glb',
    labType: 'kepler-transit',
    hotspots: [
      {
        id: 'dawn-spacecraft-h1',
        label: 'NSTAR Xenon Ion Propulsion Engines (3 Thrusters)',
        xPercent: 50,
        yPercent: 82,
        functionDescription: 'High-efficiency electrostatic ion thrusters that ionized xenon gas and accelerated it through 1,000-volt grids, delivering 11 km/s total velocity change.',
        statusNote: 'Thrusters dormant after expending 425 kg of xenon propellant during its 6.9-billion km voyage.'
      },
      {
        id: 'dawn-spacecraft-h2',
        label: 'Dual 8.3-Meter Solar Array Wings (19.8-Meter Wingspan)',
        xPercent: 88,
        yPercent: 40,
        functionDescription: 'Massive solar wings providing 10,000 W at Earth distance and over 1,300 W in the dim sunlight of the distant Asteroid Belt.',
        statusNote: 'Drifting slowly as the spacecraft tumbles through Ceres\' gravitational field.'
      },
      {
        id: 'dawn-spacecraft-h3',
        label: 'Framing Cameras & Visible-Infrared Spectrometer (VIR)',
        xPercent: 35,
        yPercent: 35,
        functionDescription: 'German Aerospace Center (DLR) cameras that mapped the geomorphology of Vesta and the glowing bright faculae of Ceres.',
        statusNote: 'Optics intact, peering out into deep space around Ceres.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'dawn-q1',
        question: 'Why did you stop working?',
        answer: 'After 11 years flying across 6.9 billion kilometers, I used up the last drop of my hydrazine thruster fuel on October 31, 2018. Without it, I could no longer point my antenna toward Earth or turn my giant solar wings toward the Sun.',
        telemetryTag: 'JPL DAWN MISSION END · OCT 31, 2018 · HYDRAZINE DEPLETION'
      },
      {
        id: 'dawn-q2',
        question: 'What was your biggest discovery?',
        answer: 'Powered by blue-glowing xenon ion engines, I became the only spacecraft ever to orbit two alien worlds—Vesta and Ceres! Inside Ceres’s Occator Crater, I discovered dazzling white salt domes left behind by an underground briny ocean.',
        telemetryTag: 'PDS DAWN ARCHIVE · OCCATOR CRATER FACULAE · SUBSURFACE BRINE'
      },
      {
        id: 'dawn-q3',
        question: 'What does your resting place look like today?',
        answer: 'To protect Ceres’s icy world from contamination, NASA placed me in a safe quarantine orbit! Today I glide silently around dwarf planet Ceres as a permanent artificial moon with my 19.7-meter solar wings outstretched.',
        telemetryTag: 'NSSDCA 2007-043A · CERES QUARANTINE ORBIT · 2.77 AU'
      }
    ]
  },
  {
    id: 'pioneer-kepler',
    name: 'Pioneer 10/11 & Kepler Space Telescope',
    zone: 'Deep Space',
    statusCategory: 'Perpetual Orbit & Deep Space Drifter',
    launchYear: 1972,
    endYear: '2003 / 2018',
    coordinates: 'Pioneer: 130+ AU outward toward Aldebaran | Kepler: Heliocentric Earth-Trailing Orbit (1 AU)',
    locationName: 'Interstellar Deep Space & Heliocentric Drift Orbit',
    radioLightDelay: '~18.6 Light-Hours from Earth (Pioneer 10 at 134 AU)',
    surfaceEnvironment: 'Interstellar Medium & Heliocentric Drift · 2.7 K Cosmic Background',
    kidFriendlyStory: OMAR_STORIES['pioneer-kepler'],
    whyItStopped: 'Pioneer 10\'s Radioisotope Thermoelectric Generators (RTGs) gradually decayed past functional threshold; its last faint whisper was received January 23, 2003 as it coasted toward Taurus. Kepler ran completely out of onboard attitude thruster fuel in October 2018 after surveying over 530,500 stars, and was placed into a safe, permanent heliocentric drift orbit.',
    scienceUnlocked: 'Pioneer 10 was the first spacecraft to navigate the asteroid belt, fly past Jupiter, and achieve Solar System escape velocity, carrying Carl Sagan\'s iconic Golden Plaque. Kepler revolutionized astrophysics by detecting 2,662 confirmed exoplanets using high-precision transit photometry, proving planets outnumber stars in the galaxy.',
    nasaDataSource: 'NASA Exoplanet Archive (Kepler Mission Data), NASA Ames Research Center Kepler Light Curve Archive, NASA PDS Pioneer 10/11 Deep Space Trajectory Data.',
    nasaSourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-012A',
    missionImageUrl: 'https://images-assets.nasa.gov/image/ARC-1972-AC72-2135/ARC-1972-AC72-2135~medium.jpg',
    orbitalImageUrl: 'https://images-assets.nasa.gov/image/PIA01402/PIA01402~small.jpg',
    model3dUrl: '/models/Pioneer_10.glb',
    glbUrl: '/models/Pioneer_10.glb',
    labType: 'kepler-transit',
    hotspots: [
      {
        id: 'pioneer-kepler-h1',
        label: 'Kepler 0.95-Meter Schmidt Telescope & 95-Megapixel CCD Array',
        xPercent: 48,
        yPercent: 30,
        functionDescription: 'Ultra-sensitive space photometer capable of detecting 10 parts-per-million dips in stellar brightness as exoplanets crossed the faces of their stars.',
        statusNote: 'Optics preserved in cold solar orbit ~150 million km from Earth.'
      },
      {
        id: 'pioneer-kepler-h2',
        label: 'Pioneer 2.74-Meter High-Gain Parabolic Reflector Dish',
        xPercent: 62,
        yPercent: 55,
        functionDescription: 'Aluminum honeycomb antenna dish focused to send 8-watt S-band radio transmissions back to NASA\'s 70-meter Deep Space Network antennas.',
        statusNote: 'Traveling outward at 11.9 km/s (2.5 AU/year) toward the red star Aldebaran.'
      },
      {
        id: 'pioneer-kepler-h3',
        label: 'Pioneer Gold-Anodized Aluminum Plaque & RTG Booms',
        xPercent: 25,
        yPercent: 70,
        functionDescription: '6x9 inch plaque designed by Carl Sagan showing human figures, hydrogen spin-transition benchmark, and pulsar time map pointing back to Earth.',
        statusNote: 'Shielded from interstellar cosmic rays, remaining legible for billions of years.'
      }
    ],
    askSpacecraftQA: [
      {
        id: 'pioneer-q1',
        question: 'Why did you stop working?',
        answer: 'Pioneer 10’s nuclear RTG power source slowly faded after 30 years in deep space, sending its last faint radio whisper from 12.2 billion km away in January 2003. Kepler retired in October 2018 after using its last drop of fuel hunting alien worlds.',
        telemetryTag: 'DSN 70M ANTENNA · JAN 23, 2003 FINAL WHISPER · KEPLER OCT 30, 2018'
      },
      {
        id: 'pioneer-q2',
        question: 'What was your biggest discovery?',
        answer: 'Pioneer 10 was the first ship to cross the Asteroid Belt and fly past giant Jupiter! Decades later, Kepler stared at 530,500 stars and discovered over 2,662 confirmed exoplanets—proving our galaxy has more planets than stars!',
        telemetryTag: 'NASA EXOPLANET ARCHIVE · 2,662 CONFIRMED EXOPLANETS · JUPITER FLYBY'
      },
      {
        id: 'pioneer-q3',
        question: 'What does your resting place look like today?',
        answer: 'We never stopped moving! Pioneer 10 is hurtling through interstellar darkness at 43,000 km/h over 20 billion km from Earth, carrying Carl Sagan’s Golden Plaque toward the red star Aldebaran as a message in a bottle from humanity.',
        telemetryTag: 'NSSDCA 1972-012A · 134+ AU INTERSTELLAR TRAJECTORY · TAURUS'
      }
    ]
  }
];

export const NASA_HARDWARE_ARTIFACTS = NASA_HARDWARE_DATA;
export const BASHAR_HARDWARE_DATA = NASA_HARDWARE_DATA;
