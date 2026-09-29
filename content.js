// Content for SIX AXES.
//
// Every paragraph here comes from Jake's own document. The only edits made were
// fixing typos and turning two shorthand notes in Phase 07 into sentences.
// Nothing was rewritten for tone and nothing was invented. Keep it that way.
//
// Body entries are either a string (a paragraph), or one of:
//   { list: [...] }      numbered failure/lesson list
//   { commands: [...] }  the spoken commands in Phase 14
// Inline links use [text](url).

export const meta = {
  title: "SIX AXES",
  tagline: "Building my way into robotics, one failure at a time",
  byline: "Jake C.D. Mancuso",
  org: "Mancuso Intelligence & Defense (MIND) LLC",
  location: "Dayton, Ohio",
  description:
    "Building two six-axis robot arms: Version One, which fell over, and VOLT, " +
    "which runs vision-language-action models on local compute.",
  url: "https://jakecuso.github.io/six-axes/",
  hero: "p10-volt-full",
  logo: "logo-mind",
  links: [
    { label: "GitHub", href: "https://github.com/Jakecuso" },
    { label: "Paper", href: "assets/docs/how-much-does-depth-matter.pdf" },
    { label: "Email", href: "mailto:jakeycuso@gmail.com" },
    // TODO: add LinkedIn here once the URL is known:
    // { label: "LinkedIn", href: "https://www.linkedin.com/in/..." },
    // TODO: drop a resume PDF in assets/docs/ and add it here.
  ],
};

export const phases = [
  {
    n: 1,
    title: "The Decision",
    summary: "I didn't buy a robot arm. I decided to build one, before I knew how.",
    body: [
      "I wanted a machine that could pick something up and put it somewhere else. That sounds simple until you try it. A six-axis arm is a physics problem, a controls problem, a manufacturing problem, and a software problem stacked on top of each other, and I had no formal robotics training.",
      "So I started where everyone starts. A sketch, a parts list I didn't understand yet, and a lot of tabs open.",
      "It didn't have a name yet. It barely had a shape.",
    ],
    images: ["p01-version-one", "p01-step-assembly"],
  },
  {
    // Jake's heading said "Four Tools" but his own summary and body name three.
    // Matched the heading to the text rather than inventing a fourth tool.
    n: 2,
    title: "Three Tools, All at Once",
    summary: "Fusion 360, MATLAB, Blender. Learned in parallel, because the problem needed all three.",
    body: [
      "Fusion 360 for the parts. MATLAB for the kinematics math. Blender for seeing the motion before I committed to printing anything.",
      "I learned each one badly at first, then well enough. That's the honest version. What made it work was that I wasn't learning them for their own sake. Every tool was pointed at the same question:",
      {
        tools: [
          { name: "Fusion 360", role: "the parts" },
          { name: "MATLAB", role: "the kinematics" },
          { name: "Blender", role: "the motion" },
        ],
        question: "Where is the hand, and how do I get it there?",
      },
    ],
    images: [],
  },
  {
    n: 3,
    title: "Why Six Degrees of Freedom",
    summary: "Fewer axes are easier. Six is the number that lets you reach any point at any angle.",
    body: [
      "With three or four axes you can get the gripper to a position. With six, you can get it there in a specific orientation, which is the difference between reaching a bolt and actually turning it.",
      "Six is also where the math stops being friendly. That tradeoff is the entire reason the rest of this page exists.",
    ],
    images: ["p03-gripper-topdown"],
  },
  {
    n: 4,
    title: "Inverse Kinematics First",
    summary: "I solved the math before I designed the metal, on purpose.",
    body: [
      "Forward kinematics asks: if I set all six joints to these angles, where does the hand end up? Inverse kinematics asks the harder question in reverse: I want the hand here, so what does every joint need to do?",
      "That second question has multiple valid answers, sometimes none, and it gets worse near the edges of the arm's reach. I built the solver in MATLAB first and let the results drive the physical design instead of the other way around. Link lengths, joint limits, and the shape of the reachable workspace all came out of the math.",
      "That decision was right. The execution was where I got in trouble.",
    ],
    images: ["p04-dh-table", "p04-frames"],
    quote: "I wanted the arm to be a consequence of the math, not a container for it.",
  },
  {
    n: 5,
    title: "Version One",
    summary: "Orange, six axes, unnamed. My first real arm.",
    body: [
      "Version One was printed, wired, and assembled on my own bench. I pulled CAN bus wiring patterns from the open-source robot arm community and learned how the separate operating modes worked by reading their forums and asking questions. That community taught me more about motor control in a month than any datasheet did.",
      "I never gave it a proper name. It was just the orange one. Version One.",
      "And it worked. It moved, it reached, it picked things up.",
    ],
    gallery: true,
    images: [
      "p05-mounted", "p05-standing", "p05-joint-motor",
      "p05-arm-bench", "p05-base-driver",
    ],
  },
  {
    n: 6,
    title: "Closing the Loop, Alone",
    summary: "I built my own closed-loop control system from scratch, using open-source projects as reference.",
    body: [
      "Open loop means the arm commands a position and hopes. Closed loop means it measures where it actually is and corrects. I wanted the second one, so I built it, leaning on open-source robotics projects to check my assumptions and sanity-check my approach.",
      // Written from Jake's own note: "Add a part where I designed a cyncoloid
      // gearbox for weight". Flagged in the README for him to expand.
      "I designed a cycloidal gearbox of my own for the joints, to get the reduction I needed without carrying the weight a conventional gearbox would have cost me.",
      "It was the most ambitious thing I'd attempted and the place where every small error I'd made upstream finally showed up.",
    ],
    gallery: true,
    images: [
      "p06-closed-loop-diagram", "p06-pcb-layout", "p06-base-boards", "p06-driver-wiring", "p06-cycloidal-disc",
      "p06-cycloidal-print", "p06-cycloidal-hand", "p06-cycloidal-plate", "p06-cycloidal-parts",
    ],
  },
  {
    n: 7,
    title: "What Broke",
    summary: "It tipped over. Then I found out why.",
    redline: true,
    body: [
      "The failure list, in order of how much it cost me:",
      {
        list: [
          "Positioning drifted by quadrant. Accuracy was acceptable in one region of the workspace and noticeably off in another. That's the signature of an IK error, not a hardware error.",
          "The gripper was wrong for the payload. I sized it for the objects I imagined instead of the objects I had.",
          "Materials were under sustained strain. Parts that were fine at rest were not fine holding a load at extension.",
          "It fell over at reach. Push the arm too far out and the center of mass left the base. That's not subtle. That's the whole machine on the floor.",
        ],
      },
      "The root cause was small. My inverse kinematics were off by a fraction. At the shoulder that's invisible. At full extension it compounds into a real distance, and a real moment arm, and then gravity does the rest.",
      // Jake's note: "failure of hall sensors (needed very close persision +- .01 mm"
      "The hall sensors were part of it too. They needed to be positioned to within ±0.01 mm to read correctly, and at that tolerance there is no such thing as close enough.",
      // Jake's note: "erroe had to rewire the whole system to match 5v > 24V while keeping the gripper at 5v"
      "Fixing it meant rewiring the whole system from 5 V to 24 V while keeping the gripper on 5 V.",
    ],
    gallery: true,
    images: ["p07-down", "p07-assembly-strain", "p07-power-switch", "p07-rewire-bench", "p07-power-distribution"],
    quote: "A small error in the math became a large error in the world. That's the lesson, and I only learned it by watching it fall.",
  },
  {
    n: 8,
    title: "What Version One Taught Me",
    summary: "Four lessons, one per failure.",
    body: [
      {
        list: [
          "Verify the solver against the physical arm across the entire workspace, not just the easy middle.",
          "Design the gripper for the actual objects, measured, not imagined.",
          "Material selection is a load calculation, not a preference.",
          "Reach is a stability budget. Every millimeter out costs you.",
        ],
      },
      "Version One did its job. It just did it by failing.",
    ],
    images: ["p08-retired"],
  },
  {
    n: 9,
    title: "PAROL6 and Source Robotics",
    summary: "I stopped designing in isolation and started building on a proven platform.",
    body: [
      "[Source Robotics](https://source-robotics.com/) builds the [PAROL6](https://source-robotics.com/products/parol6-robotic-arm), an open-loop six-axis arm with a real community behind it. The [mechanical files and control software are open](https://github.com/Source-Robotics/PAROL6-Desktop-robot-arm), and there are [proper docs](https://source-robotics.github.io/PAROL-docs/). Building someone else's well-engineered design after failing at my own was the fastest education I've had.",
      "I didn't want to just assemble a kit, though. I wanted to find out what I could add.",
    ],
    images: ["p09-parol-sim"],
  },
  {
    n: 10,
    title: "VOLT",
    summary: "My PAROL6 build, modified. Version Open Loop Transformer.",
    body: [
      "VOLT is what the PAROL6 became once I was done with it. Custom parts, my own additions, and eventually a full local AI stack that the base design never assumed.",
      "Naming it mattered more than I expected. Version One never got a name and never quite became a thing. VOLT did.",
    ],
    gallery: true,
    images: [
      "p10-bench", "p10-build-1", "p10-build-2", "p10-harness",
      "p10-build-3", "p10-camera", "p10-closeup", "p10-software",
    ],
  },
  {
    n: 11,
    title: "The Gripper",
    summary: "I designed the gripper for the PAROL6. It's now a product you can buy.",
    body: [
      "The gripper was the part I got most wrong on Version One, so it's the part I went hardest at. I designed the PAROL6 gripper, iterated it against real objects and real failure modes, and it's now [being sold to other builders](https://source-robotics.com/products/msg-gripper).",
      "Going from “my gripper broke” to “my gripper ships” is the single clearest measure of what changed between Phase 07 and here.",
    ],
    gallery: true,
    images: [
      "p11-fingers", "p11-grasp", "p11-mounted", "p11-in-use",
      "p11-gripper-board", "p11-gripper-pcb", "p11-stepper", "p11-stepper-bench",
    ],
    quote: "The component that failed hardest on my first arm is the one I now sell.",
  },
  {
    n: 12,
    title: "The Brain, Part One",
    summary: "Local compute. Pi, Jetson, ROS2, and deliberately without ROS2.",
    body: [
      "I ran VOLT's intelligence stack three ways on purpose.",
      "On a Raspberry Pi, to see how far minimal compute could go. On a Jetson Nano, for onboard inference with real headroom. With ROS2 for the standard robotics middleware, and without ROS2, direct, to understand what the middleware was actually doing for me and what it was costing.",
      "The controllers I wrote for it are open: [parol6-controller](https://github.com/Jakecuso/parol6-controller) runs headless on a Pi as a self-hosted web controller, and [parol6-cockpit](https://github.com/Jakecuso/parol6-cockpit) is the phone-first version, with thumb joysticks and a deadman-guarded jog.",
      "Nothing here depends on a cloud API. If my internet dies, VOLT still works.",
    ],
    gallery: true,
    images: ["p12-pegboard", "p12-machine-1", "p12-machine-2"],
  },
  {
    n: 13,
    title: "The Brain, Part Two",
    summary: "Vision-Language-Action models, LeRobot, and a distributed GPU cluster for training.",
    body: [
      "VOLT runs on VLA models: architectures that take in what the camera sees plus what you said, and output what the arm should do. I built on [LeRobot](https://github.com/huggingface/lerobot), Hugging Face's open robotics stack, and trained on a cluster of RDMA-networked GPU machines I configured myself.",
      "That cluster is the part people skip. Training robot policies is not a laptop activity. Getting RDMA interconnect working across multiple GPU boxes was its own project inside this project.",
    ],
    images: ["p13-cluster-bench", "p13-node"],
  },
  {
    n: 14,
    title: "Talk to It",
    summary: "Voice in, action out. No scripts, no teach pendant.",
    body: [
      "What VOLT can do when you just say it:",
      {
        commands: [
          "Clean up my desk.",
          "Hand me that tool.",
          "Turn off my computer.",
          "Turn yourself off.",
          "Grab the print off the printer.",
        ],
      },
      "That last one is my favorite. It opens the 3D printer, identifies the finished part, and lifts it off the bed. Nothing about that is a fixed sequence. The part is in a different place and a different shape every time.",
      "This is the difference between a robot that repeats and a robot that understands.",
    ],
    gallery: true,
    images: ["p14-mic-array", "p14-volt-laptop", "hero-volt"],
  },
  {
    n: 15,
    title: "When It Misses",
    summary: "The interesting part isn't the successful grasp. It's what happens after a failed one.",
    body: [
      "A traditional robot that misses a grasp keeps going. It closes on air, lifts nothing, and completes the motion perfectly. It has no idea it failed.",
      "VOLT checks. It verifies whether the object is actually in the gripper, recognizes when it isn't, and recovers. That's error detection built into the policy, not bolted on as a sensor threshold.",
      "This is what I mean when I say it isn't robotics, it's AI. Robotics executes the plan. AI notices the plan didn't work.",
    ],
    images: ["p15-fingers-open", "p15-gripper-closed"],
    quote: "A robot that can't fail is a robot that can't tell you it failed.",
  },
  {
    n: 16,
    title: "The Paper: RGB Over LiDAR",
    summary: "I argued that cameras beat depth sensors for this class of problem, and I had the ablation data to prove it.",
    body: [
      "I wrote a research paper on input-modality ablation for lightweight convolutional grasp detection, testing how much depth information actually contributes versus plain RGB. The short answer: less than the field assumes.",
      "Holding architecture and training protocol fixed across fifteen runs, depth-only reached 92.3%, RGB-only 91.5%, and fused RGB-D 90.8%. Under an identical, modest training budget, no modality difference was statistically significant.",
      "I pushed for RGB cameras over LiDAR on that basis. Plain cameras are cheap and ubiquitous, and the numbers said the sensing stack could lose the depth hardware without a meaningful accuracy tradeoff.",
      "Being right about this was satisfying. Having the numbers to prove it before the decision was made was the part that mattered.",
    ],
    images: ["p16-accuracy", "p16-grasp", "p16-paper-cover"],
    paper: {
      href: "assets/docs/how-much-does-depth-matter.pdf",
      title: "How Much Does Depth Matter? An Input-Modality Ablation Study of Lightweight Convolutional Grasp Detection on the Cornell Grasping Dataset",
    },
  },
  {
    n: 17,
    title: "Selected",
    summary: "Twelve people out of thousands of applicants, chosen for the closed-loop PAR6 beta.",
    body: [
      "I shared my VOLT modifications and AI integration with the Source Robotics engineering team. They opened a beta program for the [PAR6](https://github.com/Source-Robotics/PAR6-Collaborative-Robot-Arm), their closed-loop collaborative arm, and selected twelve builders out of thousands of applicants.",
      "I'm one of them.",
      "My work is on the RCB, the closed-loop control box, and on getting an AI system running on top of true closed-loop feedback. Which is, precisely, the thing Version One proved I couldn't do alone.",
      "The [beta kit](https://source-robotics.com/products/par6-beta-kit) ships with a hall sensor PCB. On Version One, that was the component I could not get within tolerance. This time the tolerance is somebody else's solved problem, and I get to build on top of it.",
      "The arm in Phase 07 fell over because it didn't know where it was. This one knows.",
    ],
    gallery: true,
    images: ["p17-beta-boards", "p17-beta-board", "p17-beta-bench", "p17-beta-volt"],
    quote: "I started by failing to build a closed-loop arm. I'm finishing by helping design one.",
  },
  {
    n: 18,
    title: "Now: Humanoids",
    summary: "Six axes wasn't the ceiling. It was the prerequisite.",
    body: [
      "I'm working on humanoid robotics now, including an InMoov-based build. Current focus is the head: a CAD design for a human face with articulated eyes that actually track.",
      "An arm has to know where its hand is. A face has to decide where to look. Same problem, harder question.",
      "This section is deliberately unfinished.",
    ],
    images: ["p18-face-cad"],
    unfinished: true,
  },
];
