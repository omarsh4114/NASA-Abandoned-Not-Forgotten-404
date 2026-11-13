export type CelestialZone =
  | 'Moon'
  | 'Mars'
  | 'Asteroids & Dwarf Planets'
  | 'Deep Space';

export type TargetCelestialBody =
  | 'Moon'
  | 'Mars'
  | 'Eros'
  | 'Ceres'
  | 'Interstellar';

export type TrajectoryType =
  | 'translunar'
  | 'hohmann-mars'
  | 'spiral-belt'
  | 'hyperbolic-escape';

export type StatusCategory =
  | 'Mission Complete'
  | 'Silent'
  | 'Still Useful'
  | 'Drifting';

export type LabType =
  | 'lunar-laser'
  | 'mars-dust-quake'
  | 'kepler-transit';

export type SpatialTier = 'orrery' | 'trajectory' | 'inspector';

export interface MetricDimensions {
  width: number;  // X in meters (1 Three.js unit = 1.0 meter in Tier 3)
  height: number; // Y in meters
  depth: number;  // Z in meters
  wingspan?: number;
  label: string;
  normalizedScaleFactor: number;
}

export interface MechanicalHotspot {
  id: string;
  title: string;
  position: [number, number, number]; // Local 3D coordinates (meters) relative to artifact center
  summary: string;
}

export interface SpatialArtifact {
  id: string;
  name: string;
  zone: CelestialZone;
  targetBody: TargetCelestialBody;
  trajectoryType: TrajectoryType;
  distanceFromEarth: string;
  transferDuration: string;
  launchYear: number;
  endYear: string;
  statusCategory: StatusCategory;
  locationName: string;
  coordinates: string;
  kidFriendlyStory: string;
  labType: LabType;
  glbUrl?: string;
  dimensions: MetricDimensions;
  pedestalPosition: [number, number, number];
  pedestalRotationY: number;
  hotspots: MechanicalHotspot[];
}

export const ASTRONAUT_GLB_URL = '/models/astronaut.glb';

export const MODEL_URLS: Record<string, string | undefined> = {
  'apollo-11-eagle': '/models/Apollo_Lunar_Module.glb',
  'ingenuity-helicopter': '/models/Ingenuity_Mars_Helicopter.glb',
  'insight-lander': '/models/InSight_Cruise_Lander_(arm_deployed).glb',
  'sojourner-viking': '/models/Viking_Lander.glb',
  'dawn-spacecraft': '/models/Dawn.glb',
  'pioneer-kepler': '/models/Pioneer_10.glb',
};

export const SPATIAL_ARTIFACTS: SpatialArtifact[] = [
  {
    id: 'apollo-11-eagle',
    name: 'Apollo 11 Lunar Module Descent Stage (Eagle)',
    glbUrl: '/models/Apollo_Lunar_Module.glb',
    zone: 'Moon',
    targetBody: 'Moon',
    trajectoryType: 'translunar',
    distanceFromEarth: '384,400 km (0.0026 AU)',
    transferDuration: '76 Hours (Translunar Injection)',
    launchYear: 1969,
    endYear: '1969',
    statusCategory: 'Mission Complete',
    locationName: 'Mare Tranquillitatis (Sea of Tranquility)',
    coordinates: '0.6741° N, 23.4730° E',
    kidFriendlyStory:
      "I am the four-legged golden base of the Eagle lander! On July 20, 1969, I fired my rocket engine to gently set Neil Armstrong and Buzz Aldrin down on the Sea of Tranquility. When it was time for them to fly home, I acted as their launchpad on the Moon! On my front landing leg, I still hold a shiny stainless-steel plaque that reads: 'Here men from the planet Earth first set foot upon the Moon, July 1969, A.D. We came in peace for all mankind.'",
    labType: 'lunar-laser',
    dimensions: {
      width: 4.2,
      height: 3.2,
      depth: 4.2,
      wingspan: 9.4,
      label: '4.20m W × 4.20m D × 3.20m H (9.40m Diagonal Leg Span)',
      normalizedScaleFactor: 0.45,
    },
    pedestalPosition: [-18, 0, -4],
    pedestalRotationY: 0.4,
    hotspots: [
      {
        id: 'eagle-foil',
        title: 'Amber Kapton Thermal Blankets',
        position: [1.3, 1.5, 0.8],
        summary:
          'Multi-layer aluminized Kapton and Mylar gold foil shielded the descent fuel tanks from blistering +120°C lunar sunlight and -130°C shadow.',
      },
      {
        id: 'eagle-plaque',
        title: 'Egress Ladder & Peace Plaque',
        position: [0, 1.35, 2.25],
        summary:
          'Nine-rung aluminum ladder down which Neil Armstrong climbed, carrying the commemorative stainless-steel plaque signed by the crew.',
      },
      {
        id: 'eagle-footpads',
        title: 'Crushable Honeycomb Landing Struts',
        position: [2.8, 0.25, 2.8],
        summary:
          'Four deployed outrigger legs with 0.94m dish footpads filled with crushable aluminum honeycomb to absorb the lunar touchdown impact.',
      },
    ],
  },
  {
    id: 'alsep-retroreflector',
    name: 'Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
    zone: 'Moon',
    targetBody: 'Moon',
    trajectoryType: 'translunar',
    distanceFromEarth: '384,400 km (0.0026 AU)',
    transferDuration: '76 Hours (Apollo 11 EASEP)',
    launchYear: 1969,
    endYear: 'Still Active (Passive)',
    statusCategory: 'Still Useful',
    locationName: 'Mare Tranquillitatis (Apollo 11 EASEP Site)',
    coordinates: '0.6734° N, 23.4729° E',
    kidFriendlyStory:
      "I don't need a battery, a motor, or a radio to talk to Earth! I am a special tray of 100 ultra-pure quartz corner mirrors left in the Moon dust by Apollo 11. Whenever scientists on Earth fire a green laser pulse at me through a giant telescope, my mirrors catch the light and bounce it straight back to where it came from. By timing that 2.5-second round trip, I proved that the Moon is slowly spiraling away from Earth at 3.8 centimeters every year—about as fast as your fingernails grow!",
    labType: 'lunar-laser',
    dimensions: {
      width: 0.46,
      height: 0.3,
      depth: 0.46,
      label: '0.46m W × 0.46m D × 0.30m H (10×10 Corner-Cube Prism Array)',
      normalizedScaleFactor: 3.2,
    },
    pedestalPosition: [-15, 0, -9],
    pedestalRotationY: 0.5,
    hotspots: [
      {
        id: 'lrrr-prisms',
        title: '100 Fused-Silica Corner-Cube Prisms',
        position: [0, 0.28, 0.05],
        summary:
          'A 10×10 grid of 3.8cm quartz corner-cube prisms that reflect incoming laser photons back along the exact angle they arrived.',
      },
      {
        id: 'lrrr-pallet',
        title: 'Earth-Pointing Elevation Pallet',
        position: [0.22, 0.14, 0],
        summary:
          'Machined aluminum frame tilted so the prism face stays aligned toward Earth across the Moon’s libration cycle.',
      },
      {
        id: 'lrrr-sunshade',
        title: 'Recessed Thermal Cavities',
        position: [-0.18, 0.24, 0.18],
        summary:
          'Each prism sits inside a recessed thermal socket to prevent solar heating from warping the mirror optics.',
      },
    ],
  },
  {
    id: 'apollo-lrv',
    name: 'Apollo 17 Lunar Roving Vehicle (LRV-3 "Moon Buggy")',
    zone: 'Moon',
    targetBody: 'Moon',
    trajectoryType: 'translunar',
    distanceFromEarth: '384,400 km (0.0026 AU)',
    transferDuration: '86 Hours (Apollo 17 Taurus-Littrow)',
    launchYear: 1972,
    endYear: '1972',
    statusCategory: 'Mission Complete',
    locationName: 'Taurus-Littrow Valley (Apollo 17 Landing Site)',
    coordinates: '20.1908° N, 30.7717° E',
    kidFriendlyStory:
      'Beep beep! I am an electric convertible built to drive on another world! Because rubber tires filled with air would pop or freeze on the Moon, my four wheels were woven out of springy zinc-coated piano wire with titanium treads. When I accidentally lost a rear fender in the Taurus-Littrow valley, astronauts Gene Cernan and Jack Schmitt fixed me using laminated Moon maps and grey duct tape! Before they left, they parked me facing their lander so my TV camera could film their rocket blasting off into space.',
    labType: 'lunar-laser',
    dimensions: {
      width: 1.83,
      height: 1.14,
      depth: 3.1,
      label: '3.10m L × 1.83m W × 1.14m H (Foldable Electric Rover)',
      normalizedScaleFactor: 0.85,
    },
    pedestalPosition: [-12, 0, -13],
    pedestalRotationY: 0.65,
    hotspots: [
      {
        id: 'lrv-wheels',
        title: 'Woven Piano-Wire Mesh Wheels',
        position: [0.95, 0.42, 1.1],
        summary:
          'Hand-woven from 800 strands of zinc-coated steel piano wire with titanium chevron treads so they never puncture and float atop soft lunar dust.',
      },
      {
        id: 'lrv-antenna',
        title: 'High-Gain Umbrella Mesh Dish',
        position: [-0.45, 1.55, 0.85],
        summary:
          'Foldable parabolic wire-mesh dish that beamed live color television directly from Taurus-Littrow Valley to Mission Control in Houston.',
      },
      {
        id: 'lrv-controller',
        title: 'T-Bar Joystick & Lawn-Chair Seats',
        position: [0, 0.85, 0.1],
        summary:
          'Because bulky pressurized gloves could not grip a steering wheel, astronauts drove using a center T-bar aircraft stick.',
      },
    ],
  },
  {
    id: 'surveyor-3',
    name: 'Surveyor 3 Robotic Lunar Lander',
    zone: 'Moon',
    targetBody: 'Moon',
    trajectoryType: 'translunar',
    distanceFromEarth: '384,400 km (0.0026 AU)',
    transferDuration: '65 Hours (Direct Ascent)',
    launchYear: 1967,
    endYear: '1967',
    statusCategory: 'Silent',
    locationName: 'Oceanus Procellarum (Ocean of Storms)',
    coordinates: '3.0155° S, 23.4219° W',
    kidFriendlyStory:
      'I arrived on the Moon two and a half years before the first astronauts, testing whether the ground was strong enough to hold a spaceship or if landers would sink into deep dust! With my scissor-like robotic scoop arm, I dug trenches and proved the Moon was firm. Two years after I went to sleep in the freezing lunar night, I got the surprise of a lifetime: Apollo 12 landed right next door! Astronauts Pete Conrad and Alan Bean walked over to say hello and brought my TV camera back to Earth.',
    labType: 'lunar-laser',
    dimensions: {
      width: 4.27,
      height: 3.0,
      depth: 4.27,
      label: '3.00m H × 4.27m Footpad Span (Triangular Spaceframe)',
      normalizedScaleFactor: 0.55,
    },
    pedestalPosition: [-9, 0, -16],
    pedestalRotationY: 0.75,
    hotspots: [
      {
        id: 'surveyor-scoop',
        title: 'Pantograph Surface Sampler Scoop',
        position: [0.95, 0.8, 0.85],
        summary:
          'Accordion-style scissor arm that dug 18cm-deep trenches in the Ocean of Storms to prove the regolith could bear Apollo’s weight.',
      },
      {
        id: 'surveyor-camera',
        title: 'Apollo 12 Retrieved Camera Mount',
        position: [0.3, 1.55, 0.3],
        summary:
          'Where Surveyor 3’s television camera stood before Apollo 12 astronauts Pete Conrad and Alan Bean clipped it off in November 1969.',
      },
      {
        id: 'surveyor-mast',
        title: 'Planar Solar Panel & High-Gain Mast',
        position: [0, 2.85, 0],
        summary:
          'Top-mounted 85-watt solar panel and planar array antenna that transmitted over 6,300 pioneering lunar surface pictures.',
      },
    ],
  },
  {
    id: 'ingenuity-helicopter',
    name: 'Ingenuity Mars Helicopter (Ginny)',
    glbUrl: '/models/Ingenuity_Mars_Helicopter.glb',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '203 Days (Mars 2020 Cruise)',
    launchYear: 2020,
    endYear: '2024',
    statusCategory: 'Still Useful',
    locationName: 'Valinor Hills, Jezero Crater, Mars',
    coordinates: '18.4972° N, 77.3210° E',
    kidFriendlyStory:
      'Everyone wondered if a helicopter could ever fly on Mars, where the air is as thin as a ghost—just 1% as thick as Earth’s! Engineers gave me super-light carbon-fiber blades that spin at 2,400 RPM, five times faster than a passenger helicopter on Earth. I was only supposed to fly 5 times over 30 days, but I flew 72 times over nearly three years, scouting ahead for my big buddy Perseverance! Even after my rotor tip snapped on Flight 72, I still wake up with the sun to record Martian weather data.',
    labType: 'mars-dust-quake',
    dimensions: {
      width: 1.2,
      height: 0.49,
      depth: 1.2,
      wingspan: 1.2,
      label: '0.49m H × 1.20m Carbon-Fiber Rotor Span (1.8 kg Mass)',
      normalizedScaleFactor: 2.2,
    },
    pedestalPosition: [-6, 0, -18],
    pedestalRotationY: 0.25,
    hotspots: [
      {
        id: 'ginny-rotors',
        title: '2,400 RPM Counter-Rotating Blades (Flight 72 Tip)',
        position: [0.45, 0.38, 0.1],
        summary:
          'Ultra-stiff foam-filled carbon-fiber rotors spinning in opposite directions; one blade tip shows the historic Flight 72 touchdown fracture.',
      },
      {
        id: 'ginny-solar',
        title: 'Top Solar Array & Radio Antenna',
        position: [0, 0.48, 0],
        summary:
          'Solar cells mounted above the blades recharge Ginny’s six lithium-ion batteries to survive -90°C Martian nights.',
      },
      {
        id: 'ginny-cube',
        title: 'Kapton Tissue-Box Avionics Core',
        position: [0, 0.22, 0.12],
        summary:
          'A 14cm × 19cm insulated fuselage housing flight computers, inclinometers, laser altimeter, and downward navigation cameras.',
      },
    ],
  },
  {
    id: 'opportunity-rover',
    name: 'Opportunity Mars Exploration Rover (MER-B "Oppy")',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '202 Days (Hohmann Transfer)',
    launchYear: 2003,
    endYear: '2018',
    statusCategory: 'Silent',
    locationName: 'Perseverance Valley, Endeavour Crater, Mars',
    coordinates: '2.2816° S, 5.3636° W',
    kidFriendlyStory:
      "My warrantied mission on Mars was only 90 Martian days, roughly three months. Instead, I kept rolling for almost 15 years! I became the first marathon runner on another planet, driving 45.16 kilometers across plains and crater rims. With my robot arm and rock drill, I found tiny round mineral spheres nicknamed 'blueberries' (hematite) that formed inside ancient liquid water! In 2018, the thickest global dust storm in decades blocked out the sun above Perseverance Valley, and my solar batteries finally went to sleep.",
    labType: 'mars-dust-quake',
    dimensions: {
      width: 2.3,
      height: 1.5,
      depth: 1.6,
      label: '1.60m L × 2.30m W × 1.50m H (Gull-Wing Solar Rover)',
      normalizedScaleFactor: 0.9,
    },
    pedestalPosition: [-2.5, 0, -19],
    pedestalRotationY: 0.1,
    hotspots: [
      {
        id: 'oppy-pancam',
        title: 'Pancam Mast & Mini-TES Eye',
        position: [0, 1.48, 0.45],
        summary:
          'Rising 1.5m to human eye height, dual stereo panoramic cameras and an infrared spectrometer spotted ancient watery rocks across Meridiani Planum.',
      },
      {
        id: 'oppy-solar',
        title: 'Gull-Wing Triple-Junction Solar Deck',
        position: [0.85, 0.72, 0],
        summary:
          'Fold-out photovoltaic wings that generated up to 900 watt-hours per sol until the June 2018 planet-encircling dust storm.',
      },
      {
        id: 'oppy-idd',
        title: 'Robotic Arm & Rock Abrasion Tool (RAT)',
        position: [0.15, 0.42, 0.95],
        summary:
          'Five-jointed robotic arm carrying a diamond-toothed rock grinder, microscopic imager, and Mössbauer/X-ray spectrometers.',
      },
    ],
  },
  {
    id: 'spirit-rover',
    name: 'Spirit Mars Exploration Rover (MER-A)',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '208 Days (Hohmann Transfer)',
    launchYear: 2003,
    endYear: '2010',
    statusCategory: 'Silent',
    locationName: 'Troy Sand Trap, Gusev Crater, Mars',
    coordinates: '14.5993° S, 175.5284° E',
    kidFriendlyStory:
      'I am Opportunity’s twin sister, and I landed on the opposite side of Mars inside giant Gusev Crater! I was the first robot to ever climb a mountain on another planet, reaching the summit of Husband Hill. Even after my right-front wheel stopped working, I didn’t quit: I drove backward for years, dragging my broken wheel like a plow! By pure luck, that dragging wheel scraped away the red top-soil and uncovered bright white pure silica—proof of ancient volcanic hot springs where microbial life could have thrived!',
    labType: 'mars-dust-quake',
    dimensions: {
      width: 2.3,
      height: 1.5,
      depth: 1.6,
      label: '1.60m L × 2.30m W × 1.50m H (Embedded in Troy Sulfate Sand)',
      normalizedScaleFactor: 0.9,
    },
    pedestalPosition: [1.5, 0, -19],
    pedestalRotationY: -0.1,
    hotspots: [
      {
        id: 'spirit-wheel',
        title: 'Canted Right-Front Wheel & Silica Trench',
        position: [0.68, 0.16, 0.56],
        summary:
          'When this wheel motor failed in 2006, Spirit drove backward and dragged it through Home Plate, accidentally uncovering pure hydrothermal silica.',
      },
      {
        id: 'spirit-dust',
        title: 'Gusev Crater Ochre Dust Blanket',
        position: [-0.75, 0.72, -0.1],
        summary:
          'Fine electrostatic iron-oxide dust coated Spirit’s solar panels, preventing her from tilting toward the low winter sun at Troy.',
      },
      {
        id: 'spirit-bogie',
        title: 'Titanium Rocker-Bogie Suspension',
        position: [-0.68, 0.38, -0.35],
        summary:
          'Springless articulated titanium legs that allowed Spirit to climb rocks twice her wheel diameter on the way up Husband Hill.',
      },
    ],
  },
  {
    id: 'insight-lander',
    name: 'InSight Mars Geophysical Lander',
    glbUrl: '/models/InSight_Cruise_Lander_(arm_deployed).glb',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '205 Days (Hohmann Transfer)',
    launchYear: 2018,
    endYear: '2022',
    statusCategory: 'Silent',
    locationName: 'Elysium Planitia, Mars',
    coordinates: '4.5024° N, 135.6234° E',
    kidFriendlyStory:
      "Instead of driving around looking at rocks, I was Mars's first doctor! I stood completely still on the flat plains of Elysium Planitia and used my robotic arm to place a super-sensitive stethoscope—a seismometer called SEIS—right onto the Martian ground. For four years, I listened to the heartbeat of the Red Planet, detecting 1,319 'marsquakes' and meteor impacts! By studying how those quake waves echoed deep underground, I measured the exact size of Mars's liquid metal core before Martian dust covered my round solar fans.",
    labType: 'mars-dust-quake',
    dimensions: {
      width: 6.0,
      height: 1.08,
      depth: 1.56,
      wingspan: 6.0,
      label: '6.00m Solar Span × 1.56m Deck × 1.08m H (+ SEIS Dome)',
      normalizedScaleFactor: 0.45,
    },
    pedestalPosition: [5.5, 0, -18],
    pedestalRotationY: -0.25,
    hotspots: [
      {
        id: 'insight-seis',
        title: 'SEIS Copper-Gold Seismometer Dome',
        position: [0.42, 0.18, 1.3],
        summary:
          'Placed directly on the Martian ground by InSight’s arm, this wind-and-thermal shield protected the ultra-sensitive seismometer that recorded 1,319 marsquakes.',
      },
      {
        id: 'insight-fans',
        title: '2.15m Decagonal UltraFlex Solar Wings',
        position: [-2.05, 0.82, 0],
        summary:
          'Twin circular pleated solar arrays spanning 6 meters tip-to-tip, engineered to gather sunlight on hazy Martian plains.',
      },
      {
        id: 'insight-hp3',
        title: 'HP3 "Mole" Heat Probe & Robotic Arm',
        position: [-0.45, 0.25, 1.18],
        summary:
          'Self-hammering thermal probe deployed alongside SEIS to measure heat escaping from Mars’s interior.',
      },
    ],
  },
  {
    id: 'phoenix-lander',
    name: 'Phoenix Mars Polar Lander',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '295 Days (Polar Trajectory)',
    launchYear: 2007,
    endYear: '2008',
    statusCategory: 'Silent',
    locationName: 'Green Valley, Vastitas Borealis (Martian North Pole)',
    coordinates: '68.2188° N, 125.7492° W',
    kidFriendlyStory:
      'I flew all the way to the freezing Arctic Circle of Mars! Using my 2.3-meter backhoe robotic arm, I scraped away a few inches of reddish dirt and hit a hard, bright white layer underneath. When chunks of that white material sublimated (turned into vapor) over four days, I baked a sample inside my miniature science ovens and tasted real water! I also saw snow falling from Martian clouds before the long, sunless polar winter arrived and encased me in dry-ice frost.',
    labType: 'mars-dust-quake',
    dimensions: {
      width: 5.5,
      height: 2.2,
      depth: 1.5,
      wingspan: 5.5,
      label: '5.50m Solar Span × 1.50m Octagonal Deck × 2.20m Mast H',
      normalizedScaleFactor: 0.5,
    },
    pedestalPosition: [9, 0, -16],
    pedestalRotationY: -0.45,
    hotspots: [
      {
        id: 'phoenix-ice',
        title: 'Backhoe Scoop & Exposed Water-Ice Trench',
        position: [0, 0.25, 1.38],
        summary:
          'A 2.35m titanium robotic arm that scraped away 5cm of arctic dirt in "Dodo-Goldilocks" trench to reveal bright white subsurface water ice.',
      },
      {
        id: 'phoenix-tegas',
        title: 'TEGA Miniature Science Ovens',
        position: [0.35, 0.9, 0.2],
        summary:
          'Eight tiny high-temperature furnaces on the lander deck that heated scooped icy soil and confirmed pure H₂O vapor.',
      },
      {
        id: 'phoenix-mast',
        title: '2.2m Arctic Meteorological Mast & Lidar',
        position: [-0.32, 1.95, -0.25],
        summary:
          'Weather station and upward-firing laser that detected water-ice snow crystals falling from Martian cirrus clouds.',
      },
    ],
  },
  {
    id: 'sojourner-viking',
    name: 'Sojourner Rover & Viking 1 Lander (Mars Pioneers)',
    glbUrl: '/models/Viking_Lander.glb',
    zone: 'Mars',
    targetBody: 'Mars',
    trajectoryType: 'hohmann-mars',
    distanceFromEarth: '225,000,000 km (1.52 AU)',
    transferDuration: '304 Days / 212 Days (Pioneer Transfers)',
    launchYear: 1975,
    endYear: '1982 / 1997',
    statusCategory: 'Mission Complete',
    locationName: 'Chryse Planitia & Ares Vallis, Mars',
    coordinates: '22.48° N, 47.97° W / 19.33° N, 33.55° W',
    kidFriendlyStory:
      'We are the granddaddies of Mars exploration! I am Viking 1, the very first spacecraft in history to successfully land on Mars in 1976 and send back images for over six years. And right beside me is Sojourner (1997)—the very first wheeled rover ever to drive on Mars! Even though Sojourner was only the size of a microwave oven, she proved that six-wheeled robots could explore the Red Planet, paving the way for Spirit, Opportunity, Curiosity, and Perseverance.',
    labType: 'mars-dust-quake',
    dimensions: {
      width: 3.0,
      height: 2.1,
      depth: 2.2,
      label: 'Viking 1 (3.0m × 2.2m × 2.1m) + Sojourner (0.65m × 0.48m × 0.30m)',
      normalizedScaleFactor: 0.65,
    },
    pedestalPosition: [12, 0, -13],
    pedestalRotationY: -0.6,
    hotspots: [
      {
        id: 'viking-dish',
        title: 'Viking 1 S-Band High-Gain Dish & Cameras',
        position: [-0.5, 1.65, -0.1],
        summary:
          'Transmitted humanity’s first clear ground-level panoramas of Chryse Planitia and six years of continuous Martian weather reports.',
      },
      {
        id: 'sojourner-rover',
        title: 'Sojourner Microwave-Sized 6-Wheel Rover',
        position: [1.35, 0.25, 0.45],
        summary:
          'Weighing just 11.5 kg and measuring 65cm long, Sojourner proved that mobile robotic geology was possible on another planet.',
      },
      {
        id: 'sojourner-yogi',
        title: 'APXS Sensor Pressing "Yogi" Rock',
        position: [1.35, 0.2, 0.92],
        summary:
          'Sojourner’s Alpha Proton X-Ray Spectrometer nose-cone bumped up against Martian boulders to analyze their chemical elements.',
      },
    ],
  },
  {
    id: 'near-shoemaker',
    name: 'NEAR Shoemaker Asteroid Orbiter/Lander',
    zone: 'Asteroids & Dwarf Planets',
    targetBody: 'Eros',
    trajectoryType: 'spiral-belt',
    distanceFromEarth: '316,000,000 km (2.11 AU)',
    transferDuration: '4 Years (Earth Gravity Assist to 433 Eros)',
    launchYear: 1996,
    endYear: '2001',
    statusCategory: 'Mission Complete',
    locationName: 'Himeros Saddle, Asteroid 433 Eros',
    coordinates: '35.0° S, 279.0° W (433 Eros)',
    kidFriendlyStory:
      'I was never even designed to land! I was built as an orbiter with no landing legs or wheels at all—just four flat solar panels sticking out like windmills. After spending a whole year orbiting the peanut-shaped asteroid 433 Eros and mapping every crater, my fuel tank was almost empty. Instead of letting me drift away, engineers tried a daring stunt: they fired my thrusters to slow me down to a gentle walking pace (4 mph), and I tip-toed down onto the asteroid’s dusty surface on the tip of my solar panels! I kept beaming gamma-ray science from the ground for two more weeks.',
    labType: 'kepler-transit',
    dimensions: {
      width: 3.8,
      height: 2.75,
      depth: 3.8,
      wingspan: 3.8,
      label: '1.70m Octagonal Bus × 2.75m H × 3.80m Solar Panel Span',
      normalizedScaleFactor: 0.6,
    },
    pedestalPosition: [15, 0, -9],
    pedestalRotationY: -0.5,
    hotspots: [
      {
        id: 'near-dish',
        title: '1.5m Forward High-Gain X-Band Dish',
        position: [0, 1.95, 0],
        summary:
          'Beamed 160,000 close-up images of peanut-shaped Asteroid 433 Eros back across 316 million kilometers.',
      },
      {
        id: 'near-panels',
        title: '4 Gallium-Arsenide Windmill Solar Panels',
        position: [1.45, 1.35, 0],
        summary:
          'Even without landing legs, the tips of two solar panels cushioned NEAR Shoemaker’s 1.6 m/s touchdown on Eros.',
      },
      {
        id: 'near-xgrs',
        title: 'X-Ray / Gamma-Ray Spectrometer (XGRS)',
        position: [0, 0.55, 0.55],
        summary:
          'Resting just centimeters from the asteroid soil after landing, it measured Eros’s primitive chondrite elemental chemistry.',
      },
    ],
  },
  {
    id: 'dawn-spacecraft',
    name: 'Dawn Ion-Propulsion Orbiter (Vesta & Ceres)',
    glbUrl: '/models/Dawn.glb',
    zone: 'Asteroids & Dwarf Planets',
    targetBody: 'Ceres',
    trajectoryType: 'spiral-belt',
    distanceFromEarth: '414,000,000 km (2.77 AU)',
    transferDuration: '3.8 Years to Vesta + 2.5 Years to Ceres',
    launchYear: 2007,
    endYear: '2018',
    statusCategory: 'Drifting',
    locationName: 'Permanent Quarantine Orbit around Dwarf Planet Ceres',
    coordinates: 'Heliocentric Orbit 2.77 AU (Ceres)',
    kidFriendlyStory:
      'Forget noisy chemical rockets—I flew through the Asteroid Belt using futuristic blue-glowing xenon ion engines, just like a TIE Fighter from Star Wars! My gentle ion thrust let me do something no spacecraft in history has ever done: orbit two different worlds beyond Earth! First I orbited the giant rocky protoplanet Vesta, and then I spiraled out to orbit the icy dwarf planet Ceres, discovering bright salt volcanoes from a hidden underground briny ocean. Today I peacefully orbit Ceres forever as a celestial monument.',
    labType: 'kepler-transit',
    dimensions: {
      width: 19.7,
      height: 1.77,
      depth: 1.52,
      wingspan: 19.7,
      label: '19.70m Colossal Solar Wingspan × 1.77m H × 1.64m Bus',
      normalizedScaleFactor: 0.22,
    },
    pedestalPosition: [18, 0, -4],
    pedestalRotationY: -0.4,
    hotspots: [
      {
        id: 'dawn-ion',
        title: '3 Xenon Ion Thrusters (NSTAR)',
        position: [0, 0.25, 0],
        summary:
          'Accelerated ionized xenon gas with electrical grids to 140,000 km/h, delivering 11 km/s of delta-v to orbit both Vesta and Ceres.',
      },
      {
        id: 'dawn-wings',
        title: '19.7-Meter Colossal Dutch Solar Wings',
        position: [4.8, 1.1, 0],
        summary:
          'Twin 8.3m-long solar arrays collected 10 kilowatts of electricity to power the ion engines in the dim sunlight of the Asteroid Belt.',
      },
      {
        id: 'dawn-framing',
        title: 'Framing Cameras & GRaND Detector',
        position: [0, 1.2, 1.1],
        summary:
          'Mapped the blindingly bright sodium-carbonate salt deposits inside Ceres’s Occator Crater, revealing a deep subsurface brine reservoir.',
      },
    ],
  },
  {
    id: 'pioneer-kepler',
    name: 'Pioneer 10/11 & Kepler Space Telescope (Deep Space Drifters)',
    glbUrl: '/models/Pioneer_10.glb',
    zone: 'Deep Space',
    targetBody: 'Interstellar',
    trajectoryType: 'hyperbolic-escape',
    distanceFromEarth: '20.1 Billion km (134 AU) / 150 Million km',
    transferDuration: '54+ Years Interstellar Escape / Heliocentric Drift',
    launchYear: 1972,
    endYear: '2003 / 2018',
    statusCategory: 'Drifting',
    locationName: 'Interstellar Escape Trajectory & Earth-Trailing Solar Orbit',
    coordinates: '134 AU (Taurus) & 1.01 AU Solar Orbit',
    kidFriendlyStory:
      'We are the ultimate deep-space drifters! Pioneer 10 and 11 were the first spaceships to brave the Asteroid Belt and fly past giant Jupiter and Saturn. Bolted to Pioneer’s frame is a gold-anodized aluminum plaque showing a man, a woman, and a map of Earth in case alien explorers ever find us millions of years from now! Meanwhile, Kepler drifts around the Sun after staring at 150,000 stars and discovering over 2,600 exoplanets—proving that our galaxy has more planets than stars!',
    labType: 'kepler-transit',
    dimensions: {
      width: 2.74,
      height: 4.7,
      depth: 2.9,
      label: 'Pioneer Dish (2.74m Dia) + Kepler Photometer (4.70m H × 2.70m Dia)',
      normalizedScaleFactor: 0.45,
    },
    pedestalPosition: [20, 0, 2],
    pedestalRotationY: -0.7,
    hotspots: [
      {
        id: 'pioneer-plaque',
        title: 'Golden Anodized Pioneer Plaque (Carl Sagan)',
        position: [-0.95, 1.45, 0.25],
        summary:
          'A 15cm × 23cm gold-anodized aluminum message card depicting two humans, the hydrogen hyperfine transition, and 14 pulsar vectors to Earth.',
      },
      {
        id: 'pioneer-dish',
        title: '2.74m Parabolic Dish & RTG Nuclear Booms',
        position: [-1.85, 1.8, 0],
        summary:
          'Kept Pioneer 10 in contact with NASA’s Deep Space Network out to 12.2 billion kilometers before its final whisper in January 2003.',
      },
      {
        id: 'kepler-ccd',
        title: 'Kepler 95-Megapixel 42-CCD Photometer Barrel',
        position: [1.2, 2.3, 0],
        summary:
          'Measured tiny 100-parts-per-million dips in starlight as Earth-sized worlds crossed in front of distant suns.',
      },
    ],
  },
];
