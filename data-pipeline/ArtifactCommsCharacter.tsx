import React, { useState, useEffect } from "react";
import { STORIES } from "./stories";

interface ArtifactCommsProps {
  artifactId: string;
  artifactName: string;
  story?: string;
}

interface ArtifactQA {
  landing: string;
  discovery: string;
  fate: string;
  power: string;
  funFact: string;
}

const ARTIFACT_COMMS_DATA: Record<string, ArtifactQA> = {
  "apollo-11-eagle": {
    landing: "I touched down manually in the Sea of Tranquility on July 20, 1969, with less than 25 seconds of fuel left!",
    discovery: "My crew brought back 21.5 kilograms of the very first Moon rocks ever studied on Earth.",
    fate: "My descent stage stayed on the Moon as a launchpad, while my ascent cabin crashed into the lunar surface after crew transfer.",
    power: "I ran on silver-zinc batteries and hypergolic rocket propellant that ignited on contact.",
    funFact: "My gold foil wasn't real gold—it was Kapton thermal film to protect me from extreme lunar temperatures!"
  },
  "alsep-retroreflector": {
    landing: "Apollo 11 astronauts carried me off the Eagle lander and placed me gently in the lunar dust.",
    discovery: "I proved the Moon is drifting away from Earth at 3.8 centimeters per year and tested Einstein's general relativity.",
    fate: "I am still active today! Because I use corner-cube prisms instead of batteries, I never run out of power.",
    power: "Zero electricity needed—I passively reflect green laser pulses fired from Earth observatories.",
    funFact: "Even if a laser hits me at an angle, my 100 glass prisms bounce the beam straight back to its exact origin!"
  },
  "apollo-lrv": {
    landing: "We rode folded up like origami on the side of Apollo 15, 16, and 17 landers before unfolding with springs and cables.",
    discovery: "We let astronauts travel over 35 kilometers across craters and mountains to collect ancient highland rocks.",
    fate: "All three of us remain parked near our landing sites, preserved forever in the airless lunar vacuum.",
    power: "Two non-rechargeable 36-volt silver-zinc batteries powered four independent quarter-horsepower wheel motors.",
    funFact: "Our wheels weren't rubber—they were woven piano wire with titanium treads so they wouldn't pop in vacuum!"
  },
  "surveyor-3": {
    landing: "I bounced twice on my three shock-absorbing footpads in the Ocean of Storms in April 1967.",
    discovery: "My mechanical claw dug trenches and proved lunar soil was firm enough to support heavy Apollo landers.",
    fate: "Two years after I shut down, Apollo 12 astronauts landed 180 meters away and brought my camera back to Earth!",
    power: "I used a single solar panel mast and rechargeable batteries to survive lunar days.",
    funFact: "I am the only spacecraft in history visited on another world by human astronauts years after landing!"
  },
  "ingenuity-helicopter": {
    landing: "I rode tucked beneath the belly of the Perseverance rover and dropped onto Jezero Crater in April 2021.",
    discovery: "I proved powered, controlled aerodynamic flight is possible in Mars's ultra-thin atmosphere—completing 72 flights!",
    fate: "A rotor blade tip snapped during Flight 72 in January 2024, retiring me as a stationary weather beacon.",
    power: "A solar panel above my rotors charged six lithium-ion batteries to spin my blades at 2,400 RPM.",
    funFact: "I carry a tiny postage-stamp-sized piece of fabric from the Wright brothers' 1903 airplane!"
  },
  "opportunity-rover": {
    landing: "I bounced to a halt inside Eagle Crater wrapped in giant inflatable airbags in January 2004.",
    discovery: "I found tiny mineral spheres called 'blueberries' proving liquid water once flowed across ancient Mars.",
    fate: "A massive global dust storm blocked sunlight in June 2018, draining my batteries permanently after 14 years.",
    power: "Gallium-arsenide solar arrays charged my lithium-ion batteries—until Martian dust devils stopped cleaning them.",
    funFact: "I was designed for 90 days and 1 kilometer, yet I drove 45.16 kilometers—a full Martian marathon!"
  },
  "spirit-rover": {
    landing: "I bounced inside airbags into Gusev Crater three weeks before my twin Opportunity in January 2004.",
    discovery: "My broken right wheel dragged through the soil and uncovered pure silica from ancient Martian hot springs!",
    fate: "My wheels broke through a hidden soft sand trap at Troy in 2009, preventing me from tilting toward the winter Sun.",
    power: "Solar panels powered my six wheels and rock-abrasion tools for over six years.",
    funFact: "I captured the very first photo of Earth ever taken from the surface of another planet!"
  },
  "insight-lander": {
    landing: "I used retrorockets and three shock-absorbing legs to land smoothly on Elysium Planitia in November 2018.",
    discovery: "I detected over 1,300 marsquakes and measured the size of Mars's liquid iron core for the first time.",
    fate: "Thick layers of red dust gradually covered my twin circular solar arrays until I went silent in December 2022.",
    power: "Two giant round solar wings that opened like paper fans on landing day.",
    funFact: "My seismometer was so sensitive it could detect vibrations smaller than the width of a hydrogen atom!"
  },
  "phoenix-lander": {
    landing: "I touched down using pulsed thrusters in Mars's freezing arctic plains in May 2008.",
    discovery: "My robotic scoop uncovered pure white water ice just centimeters below the red soil and watched snow fall!",
    fate: "When arctic winter brought total darkness, heavy carbon dioxide dry ice crushed my solar panels.",
    power: "Octagonal solar arrays powered my miniature chemistry ovens and atomic force microscope.",
    funFact: "I carried a mini-DVD made of silica glass containing sci-fi stories about Mars and messages for future explorers!"
  },
  "sojourner-viking": {
    landing: "Viking used retro-rockets in 1976, while Sojourner bounced in airbags inside Pathfinder in 1997.",
    discovery: "Viking took the first surface photos of Mars, and Sojourner proved wheeled rovers could navigate Martian boulders.",
    fate: "Viking's batteries eventually wore out after 6 years, and Pathfinder's base station lost contact after 83 days.",
    power: "Viking used nuclear plutonium generators, while microwave-sized Sojourner ran on a top-mounted solar panel.",
    funFact: "Sojourner weighed only 11.5 kilograms—about the same as a large house cat or a medium dog!"
  },
  "near-shoemaker": {
    landing: "Even though I had no landing legs, engineers gently touched me down onto asteroid Eros at 6 km/h in 2001!",
    discovery: "I mapped 160,000 images of Eros and measured its surface chemistry right from the asteroid's ground.",
    fate: "I survived the landing and sent bonus gamma-ray data for 16 days before freezing in the asteroid shadow.",
    power: "Four fixed solar paddles powered my instruments 300 million kilometers from the Sun.",
    funFact: "I was the very first spacecraft in human history to orbit and land on an asteroid!"
  },
  "dawn-spacecraft": {
    landing: "I never landed—I used gentle xenon ion thrusters to enter orbit around Vesta and later dwarf planet Ceres.",
    discovery: "I discovered bright sodium-carbonate salt domes in Ceres's Occator Crater left by ancient briny water.",
    fate: "When my hydrazine attitude fuel ran out in 2018, NASA left me in a high, silent quarantine orbit around Ceres.",
    power: "Massive 20-meter solar wings powered my glowing blue xenon ion engines.",
    funFact: "My ion engines accelerated slowly—taking 4 days to go from 0 to 60 mph—but reached top speeds over 38,000 km/h!"
  },
  "pioneer-kepler": {
    landing: "We are deep-space travelers—Pioneer flew past Jupiter into interstellar space, while Kepler orbited the Sun.",
    discovery: "Pioneer braved the asteroid belt first; Kepler discovered over 2,700 confirmed planets orbiting distant stars!",
    fate: "Both of us ran out of fuel and now drift silently through the galaxy as eternal monuments.",
    power: "Pioneer used nuclear RTG generators; Kepler used solar arrays to stare steadily at 150,000 stars.",
    funFact: "Pioneer 10 carries a gold-anodized plaque showing humans and Earth's galactic address for any alien finders!"
  }
};

export const ArtifactCommsCharacter: React.FC<ArtifactCommsProps> = ({
  artifactId,
  artifactName,
  story,
}) => {
  const resolvedStory = story || STORIES[artifactId] || "";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCaption, setActiveCaption] = useState(resolvedStory);
  const [question, setQuestion] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const profile = ARTIFACT_COMMS_DATA[artifactId] || ARTIFACT_COMMS_DATA["apollo-11-eagle"];

  useEffect(() => {
    const pickWarmVoice = () => {
      if (!("speechSynthesis" in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const warmFemalePriority = [
        "Michelle",
        "Ana",
        "Ava",
        "Aria",
        "Emma",
        "Jenny",
        "Sonia",
        "Google US English",
        "Google UK English Female",
        "Samantha",
        "Zira"
      ];

      const match =
        warmFemalePriority
          .map((name) => voices.find((v) => v.lang.startsWith("en") && v.name.includes(name)))
          .find(Boolean) ||
        voices.find((v) => v.lang.startsWith("en") && !v.name.includes("David")) ||
        voices[0];

      setSelectedVoice(match || null);
    };

    pickWarmVoice();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = pickWarmVoice;
    }
  }, []);

  useEffect(() => {
    setActiveCaption(resolvedStory);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [artifactId, resolvedStory]);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setActiveCaption(text);

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.pitch = 1.0;
    utterance.rate = 0.98;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleAskQuestion = (rawQuery: string) => {
    const q = rawQuery.toLowerCase();
    let reply = "";

    if (q.includes("land") || q.includes("touch") || q.includes("arrive") || q.includes("get there")) {
      reply = profile.landing;
    } else if (q.includes("find") || q.includes("discover") || q.includes("science") || q.includes("learn")) {
      reply = profile.discovery;
    } else if (q.includes("die") || q.includes("silent") || q.includes("end") || q.includes("happen") || q.includes("now")) {
      reply = profile.fate;
    } else if (q.includes("power") || q.includes("battery") || q.includes("solar") || q.includes("fuel") || q.includes("energy")) {
      reply = profile.power;
    } else if (q.includes("fact") || q.includes("secret") || q.includes("cool") || q.includes("special")) {
      reply = profile.funFact;
    } else {
      reply = `Great question! Here is a secret from my black box: ${profile.funFact}`;
    }

    speakText(reply);
    setQuestion("");
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-slate-100 space-y-3">
      {/* Talking Hologram Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isSpeaking ? "border-cyan-400 bg-cyan-500/20 animate-pulse" : "border-slate-600 bg-slate-800"}`}>
            <span className="text-xs font-mono text-cyan-300">{isSpeaking ? "LIVE" : "1420"}</span>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">Black-Box Voice Link</p>
            <h4 className="font-bold text-sm">{artifactName}</h4>
          </div>
        </div>

        <button
          onClick={() => (isSpeaking ? window.speechSynthesis.cancel() : speakText(resolvedStory))}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
        >
          {isSpeaking ? "Stop Audio" : "Play Story Log"}
        </button>
      </div>

      {/* Live Transcript Box */}
      <p className="text-sm leading-relaxed text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        "{activeCaption}"
      </p>

      {/* Instant Question Chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleAskQuestion("landing")} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 text-cyan-200">
          How did you land?
        </button>
        <button onClick={() => handleAskQuestion("discover")} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 text-cyan-200">
          Biggest discovery?
        </button>
        <button onClick={() => handleAskQuestion("silent")} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 text-cyan-200">
          Why did you go silent?
        </button>
        <button onClick={() => handleAskQuestion("power")} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 text-cyan-200">
          What powered you?
        </button>
      </div>

      {/* Custom Kid Question Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) handleAskQuestion(question);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask ${artifactName} a question...`}
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
        <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold">
          Ask
        </button>
      </form>
    </div>
  );
};