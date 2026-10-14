import { StudentProfile, StudyPlan, ResourceItem, SkillGap, TodoTask, WeakAreaItem, StudyMaterial } from '../types';

export const SAMPLE_STUDENT: StudentProfile = {
  name: 'Aarav Sharma',
  course: 'Class 12 Senior Secondary (CBSE)',
  branch: 'PCM + Computer Science',
  year: 'Class 12 (Senior)',
  semester: 'Term 2 Board Finals',
  goal: 'Class 12 STEM Finals & Competitive Entrance',
  targetDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyMinutes: 120,
  subjects: [
    { id: 'sub-1', name: 'Physics', proficiency: 2 },
    { id: 'sub-2', name: 'Chemistry', proficiency: 2 },
    { id: 'sub-3', name: 'Mathematics', proficiency: 3 },
    { id: 'sub-4', name: 'Computer Science', proficiency: 4 },
  ],
  isCompleted: true,
  lastUpdated: new Date().toISOString(),
};

export const BLANK_STUDENT: StudentProfile = {
  name: '',
  course: '',
  branch: '',
  year: '',
  semester: '',
  goal: '',
  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyMinutes: 120,
  subjects: [],
  isCompleted: false,
};

export const SAMPLE_TODO_TASKS: TodoTask[] = [
  {
    id: 'todo-1',
    title: 'Solve Faraday Induction numericals (Q1-12)',
    description: 'Focus on Lenz law direction finding and induced EMF equations',
    subject: 'Physics',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue!
    priority: 'Urgent',
    estimatedMinutes: 45,
    completed: false,
  },
  {
    id: 'todo-2',
    title: 'Organic Chemistry: Aldol reaction mechanisms',
    description: 'Practice self-condensation and cross-aldol arrow-pushing mechanisms',
    subject: 'Chemistry',
    deadline: new Date().toISOString().split('T')[0], // Due Today!
    priority: 'High',
    estimatedMinutes: 60,
    completed: false,
  },
  {
    id: 'todo-3',
    title: 'Definite integrals using King property drill',
    description: 'Solve 6 past board questions on symmetric intervals',
    subject: 'Mathematics',
    deadline: new Date().toISOString().split('T')[0], // Due Today!
    priority: 'Medium',
    estimatedMinutes: 45,
    completed: false,
  },
  {
    id: 'todo-4',
    title: 'SQL nested queries & GROUP BY exercises',
    description: 'Complete practice worksheet on subqueries with aggregate filters',
    subject: 'Computer Science',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Upcoming
    priority: 'Low',
    estimatedMinutes: 30,
    completed: true,
    completedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'todo-5',
    title: 'Physics Ray Optics lens combination diagram',
    description: 'Draw 4 ray diagrams for compound lenses and calculate focal power',
    subject: 'Physics',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Upcoming
    priority: 'Medium',
    estimatedMinutes: 40,
    completed: false,
  },
];

export const SAMPLE_WEAK_AREAS: WeakAreaItem[] = [
  {
    id: 'weak-1',
    subject: 'Physics',
    topic: 'Electromagnetic Induction & Lenz Law',
    source: 'assessment',
    severity: 'critical',
    notes: 'Low score in diagnostic numericals; difficulty with magnetic flux variation',
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'weak-2',
    subject: 'Chemistry',
    topic: 'Aldol Condensation & Reaction Pathways',
    source: 'self-reported',
    severity: 'critical',
    notes: 'Student reported struggle with predicting cross-aldol products',
    dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'weak-3',
    subject: 'Mathematics',
    topic: 'Definite Integrals by Parts',
    source: 'assessment',
    severity: 'moderate',
    notes: 'Moderate speed bottleneck during timed questions',
    dateAdded: new Date().toISOString().split('T')[0],
  },
];

export const SAMPLE_SKILL_GAPS: SkillGap[] = [
  {
    id: 'gap-1',
    subject: 'Physics',
    proficiency: 2,
    status: 'critical',
    badge: 'Critical Gap',
    explanation: 'Self-rated 2/5. Electromagnetic induction and ray optics numericals require foundational theorem reinforcement.',
    urgencyReason: 'Carries 24% of exam weightage; high likelihood of losing marks without daily problem-solving drill.',
    recommendedWeeklyHours: 4.5,
    suggestedTopics: ["Lenz's Law & Faradays Induction", 'Wave Optics & Interference', 'Rotational Mechanics'],
  },
  {
    id: 'gap-2',
    subject: 'Chemistry',
    proficiency: 2,
    status: 'critical',
    badge: 'Critical Gap',
    explanation: 'Self-rated 2/5. Reaction mechanisms in Organic Chemistry and Equilibrium calculations show recall bottlenecks.',
    urgencyReason: 'Prerequisite for organic conversions and reaction pathway problem types.',
    recommendedWeeklyHours: 4.0,
    suggestedTopics: ['Aldehydes & Ketones Nucleophilic Addition', 'Chemical Equilibrium Le Chatelier', 'Coordination Compounds'],
  },
  {
    id: 'gap-3',
    subject: 'Mathematics',
    proficiency: 3,
    status: 'moderate',
    badge: 'Needs Reinforcement',
    explanation: 'Self-rated 3/5. Solid conceptual understanding of functions, but integration by parts and definite integrals need speed improvement.',
    urgencyReason: 'Direct scoring opportunity: boosting solving speed unlocks 15-20 extra minutes during timed exams.',
    recommendedWeeklyHours: 3.5,
    suggestedTopics: ['Definite Integrals Properties', 'Differential Equations Modeling', 'Probability Distributions'],
  },
  {
    id: 'gap-4',
    subject: 'Computer Science',
    proficiency: 4,
    status: 'strong',
    badge: 'Strong Foundation',
    explanation: 'Self-rated 4/5. Comfortable with Object-Oriented Programming and Data Structures. Regular light revision suffices.',
    urgencyReason: 'Maintain current grade with 1-2 focused coding reviews per week to preserve high confidence.',
    recommendedWeeklyHours: 2.0,
    suggestedTopics: ['Recursion & Binary Trees', 'SQL Complex Queries', 'Time Complexity Analysis'],
  },
];

export const SAMPLE_STUDY_PLAN: StudyPlan = {
  id: 'plan-default-1',
  createdAt: new Date().toISOString(),
  goal: 'Class 12 STEM Finals & Competitive Entrance',
  summary: 'Balanced 7-day adaptive schedule focusing 65% of study time on Physics and Organic Chemistry while reinforcing Calculus speed.',
  generatedBy: 'gemini-3.8-flash',
  tasks: [
    {
      id: 'task-1',
      dayNumber: 1,
      dayLabel: 'Day 1 (Mon)',
      subject: 'Physics',
      topic: "Electromagnetic Induction & Faraday's Law",
      durationMinutes: 45,
      priority: 'High',
      activity: 'Solve 10 numerical problems on induced EMF and sketch magnetic flux vs time graphs.',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'task-2',
      dayNumber: 1,
      dayLabel: 'Day 1 (Mon)',
      subject: 'Chemistry',
      topic: 'Aldol Condensation & Cannizzaro Mechanisms',
      durationMinutes: 45,
      priority: 'High',
      activity: 'Draw step-by-step reaction arrow mechanisms on paper and write 5 product predictions.',
      completed: true,
      completedAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'task-3',
      dayNumber: 1,
      dayLabel: 'Day 1 (Mon)',
      subject: 'Mathematics',
      topic: 'Integration by Parts Drill',
      durationMinutes: 30,
      priority: 'Medium',
      activity: 'Complete a 30-minute timed sprint solving 8 ILATE standard integrals without looking at hints.',
      completed: false,
    },
    {
      id: 'task-4',
      dayNumber: 2,
      dayLabel: 'Day 2 (Tue)',
      subject: 'Physics',
      topic: "Lenz's Law and Energy Conservation",
      durationMinutes: 50,
      priority: 'High',
      activity: 'Review concept walkthrough, then solve 6 direction-finding conceptual questions.',
      completed: false,
    },
    {
      id: 'task-5',
      dayNumber: 2,
      dayLabel: 'Day 2 (Tue)',
      subject: 'Chemistry',
      topic: "Chemical Equilibrium & Le Chatelier's Principle",
      durationMinutes: 40,
      priority: 'High',
      activity: 'Calculate equilibrium constants (Kp/Kc) for 5 gaseous systems under temperature shifts.',
      completed: false,
    },
    {
      id: 'task-6',
      dayNumber: 2,
      dayLabel: 'Day 2 (Tue)',
      subject: 'Computer Science',
      topic: 'Binary Search & Big-O Verification',
      durationMinutes: 30,
      priority: 'Low',
      activity: 'Write and test iterative vs recursive binary search implementations in code editor.',
      completed: false,
    },
    {
      id: 'task-7',
      dayNumber: 3,
      dayLabel: 'Day 3 (Wed)',
      subject: 'Mathematics',
      topic: 'Definite Integrals using Symmetry Properties',
      durationMinutes: 60,
      priority: 'High',
      activity: "Apply King's Rule and periodic integral reduction properties on 8 past exam questions.",
      completed: false,
    },
    {
      id: 'task-8',
      dayNumber: 3,
      dayLabel: 'Day 3 (Wed)',
      subject: 'Physics',
      topic: 'AC Circuits: RLC Series Resonance',
      durationMinutes: 60,
      priority: 'High',
      activity: 'Derive impedance phasor diagrams and solve 5 Q-factor and power factor calculations.',
      completed: false,
    },
    {
      id: 'task-9',
      dayNumber: 4,
      dayLabel: 'Day 4 (Thu)',
      subject: 'Chemistry',
      topic: 'Coordination Compounds: Crystal Field Theory',
      durationMinutes: 60,
      priority: 'High',
      activity: 'Predict d-orbital splitting and magnetic moments for octahedral vs tetrahedral complexes.',
      completed: false,
    },
    {
      id: 'task-10',
      dayNumber: 4,
      dayLabel: 'Day 4 (Thu)',
      subject: 'Physics',
      topic: 'Ray Optics: Lens Maker Formula & Prism Deviation',
      durationMinutes: 60,
      priority: 'Medium',
      activity: 'Solve 6 optical bench combination problems and draw clean ray refraction paths.',
      completed: false,
    },
    {
      id: 'task-11',
      dayNumber: 5,
      dayLabel: 'Day 5 (Fri)',
      subject: 'Mathematics',
      topic: 'Differential Equations: Integrating Factor Method',
      durationMinutes: 50,
      priority: 'Medium',
      activity: 'Solve 6 linear differential equations of type dy/dx + Py = Q and verify particular solutions.',
      completed: false,
    },
    {
      id: 'task-12',
      dayNumber: 5,
      dayLabel: 'Day 5 (Fri)',
      subject: 'Chemistry',
      topic: 'Electrochemistry: Nernst Equation & Cell EMF',
      durationMinutes: 40,
      priority: 'High',
      activity: 'Calculate Gibbs free energy change and non-standard cell potentials for 4 galvanic cells.',
      completed: false,
    },
    {
      id: 'task-13',
      dayNumber: 5,
      dayLabel: 'Day 5 (Fri)',
      subject: 'Computer Science',
      topic: 'SQL Joins & Group By Aggregations',
      durationMinutes: 30,
      priority: 'Low',
      activity: 'Practice writing 5 multi-table inner/left join queries with HAVING clauses.',
      completed: false,
    },
    {
      id: 'task-14',
      dayNumber: 6,
      dayLabel: 'Day 6 (Sat)',
      subject: 'Physics & Chemistry',
      topic: 'Weak Topics Active Recall Blitz',
      durationMinutes: 80,
      priority: 'High',
      activity: 'Flashcard drill on organic reagents and physics formula derivation sheet without notes.',
      completed: false,
    },
    {
      id: 'task-15',
      dayNumber: 6,
      dayLabel: 'Day 6 (Sat)',
      subject: 'Mathematics',
      topic: 'Mixed Calculus Speed Challenge',
      durationMinutes: 40,
      priority: 'Medium',
      activity: '10 problems across limits, derivatives, and integrals in 40 minutes.',
      completed: false,
    },
    {
      id: 'task-16',
      dayNumber: 7,
      dayLabel: 'Day 7 (Sun)',
      subject: 'All Subjects',
      topic: 'Weekly Diagnostic Mock & Error Log Review',
      durationMinutes: 90,
      priority: 'High',
      activity: 'Take a timed 60-min mini-mock test, followed by 30 mins documenting reasons for every incorrect answer.',
      completed: false,
    },
    {
      id: 'task-17',
      dayNumber: 7,
      dayLabel: 'Day 7 (Sun)',
      subject: 'All Subjects',
      topic: 'Next Week Goal Calibration',
      durationMinutes: 30,
      priority: 'Low',
      activity: 'Update subject proficiency ratings on EduBridge AI to regenerate adaptive week 2 plan.',
      completed: false,
    },
  ],
};

export const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    subject: 'Physics',
    topic: "Electromagnetic Induction & Lenz's Law",
    type: 'Video Lecture',
    platform: 'YouTube',
    description: 'Visual animations of magnetic flux changes and right-hand rule applications.',
    searchUrl: 'https://www.youtube.com/results?search_query=electromagnetic+induction+lenz+law+visual+explanation',
  },
  {
    id: 'res-2',
    subject: 'Physics',
    topic: 'RLC Circuits & Resonance',
    type: 'Practice Problems',
    platform: 'Khan Academy',
    description: 'Interactive step-by-step circuit impedance and resonance problem sets.',
    searchUrl: 'https://www.khanacademy.org/search?page_search_query=RLC+series+circuit+resonance',
  },
  {
    id: 'res-3',
    subject: 'Chemistry',
    topic: 'Organic Reaction Mechanisms & Carbonyls',
    type: 'Revision Notes',
    platform: 'Google Search',
    description: 'Comprehensive nucleophilic addition cheatsheet and Aldol reaction flowcharts.',
    searchUrl: 'https://www.google.com/search?q=aldol+condensation+mechanism+step+by+step+summary+notes',
  },
  {
    id: 'res-4',
    subject: 'Chemistry',
    topic: 'Chemical Equilibrium & Le Chatelier',
    type: 'Interactive Simulator',
    platform: 'Google Search',
    description: 'PhET interactive simulation for reversible reaction equilibrium shifts with temperature and pressure.',
    searchUrl: 'https://www.google.com/search?q=phet+simulation+reversible+reactions+chemical+equilibrium',
  },
  {
    id: 'res-5',
    subject: 'Mathematics',
    topic: 'Integration by Parts & ILATE Method',
    type: 'Video Lecture',
    platform: 'Khan Academy',
    description: 'Conceptual intuition behind product rule integration and common pitfalls to avoid.',
    searchUrl: 'https://www.khanacademy.org/search?page_search_query=integration+by+parts+technique',
  },
  {
    id: 'res-6',
    subject: 'Mathematics',
    topic: 'Definite Integrals Properties',
    type: 'Formula Sheet',
    platform: 'Google Search',
    description: "High-yield reference cheat sheet on King's property, even-odd integrals, and periodic transformations.",
    searchUrl: 'https://www.google.com/search?q=definite+integrals+properties+formula+cheat+sheet+pdf',
  },
  {
    id: 'res-7',
    subject: 'Computer Science',
    topic: 'Recursion and Tree Traversals',
    type: 'Practice Problems',
    platform: 'Google Search',
    description: 'LeetCode and GeeksforGeeks beginner-friendly binary tree in-order and pre-order traversal practice.',
    searchUrl: 'https://www.google.com/search?q=binary+tree+traversal+inorder+preorder+practice+problems',
  },
];

export const SAMPLE_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-sample-1',
    fileName: 'Class_12_Physics_Electromagnetic_Induction.pdf',
    fileSize: 1048576, // 1.0 MB
    fileType: 'pdf',
    subject: 'Physics',
    uploadedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    extractedText: `Chapter 6: Electromagnetic Induction

1. Magnetic Flux (ΦB):
Magnetic flux through a planar area A held in a uniform magnetic field B is defined as the dot product: ΦB = B · A = B A cos(θ), where θ is the angle between B and the normal to the surface. SI unit: Weber (Wb) or Tesla-meter squared (T·m²).

2. Faraday's Experiments & Law of Induction:
The magnitude of induced EMF in a circuit equals the time rate of change of magnetic flux through the circuit:
E = -dΦB / dt
For a coil having N tightly wound turns: E = -N (dΦB / dt).
The induced EMF can be produced by:
(i) changing the magnitude of magnetic field B with time.
(ii) changing the area of the coil within the magnetic field.
(iii) changing the relative orientation θ between the magnetic field and the coil plane.

3. Lenz's Law and Conservation of Energy:
The polarity of the induced electromotive force is always such that it produces an induced current whose magnetic field opposes the change in magnetic flux that produced it.
Explanation: If the north pole of a bar magnet approaches a loop, the face of the loop develops a north polarity to repel the magnet, requiring mechanical work. This mechanical energy is transformed into electrical energy. If it attracted instead, energy would be created from nothing, violating the First Law of Thermodynamics.

4. Motional Electromotive Force:
When a conducting rod of length L moves with constant velocity v perpendicular to a uniform magnetic field B through a frictionless U-shaped track:
The induced motional EMF between the rod terminals is:
E = B * L * v
If the total resistance of the circuit loop is R, the induced current is:
I = E / R = (B * L * v) / R
The mechanical power needed to pull the rod equals the thermal rate of electrical power dissipation:
P = F * v = (I * L * B) * v = (B² * L² * v²) / R.

5. Eddy Currents & Damping:
When bulk pieces of conductors are subjected to changing magnetic flux, circulating induced currents are produced throughout the volume. These are called eddy currents (or Foucault currents).
Applications: Magnetic braking in trains, electromagnetic damping in galvanometers, induction furnaces, and electric power meters.
Minimization: Eddy current energy loss is minimized by using laminated core structures insulated with lacquer instead of solid magnetic blocks.

6. Self-Inductance (L) and Mutual Inductance (M):
Magnetic flux linked with a single coil is proportional to the current flowing through it:
N * Φ = L * I
Induced back-EMF: E = -L * (dI / dt).
For a long solenoid with n turns per unit length, area A, and length l:
L = μ0 * n² * A * l.
The magnetic energy stored in an inductor carrying steady current I is:
U_B = 1/2 * L * I².

Mutual Inductance between two coaxial solenoids:
M = μ0 * n1 * n2 * π * r1² * l.
Coupling coefficient: k = M / sqrt(L1 * L2), where 0 <= k <= 1.

7. AC Generator:
Converts mechanical energy into electrical energy by rotating a rectangular coil of N turns in a uniform magnetic field with angular velocity ω.
Flux at time t: ΦB = B * A * cos(ωt).
Induced EMF: E = -N * d(B A cos(ωt))/dt = N * B * A * ω * sin(ωt) = E0 * sin(ωt), where E0 = N * B * A * ω is the peak EMF amplitude.`,
    wordCount: 540,
    pageCount: 6,
    title: 'Class 12 Physics: Electromagnetic Induction & Alternating Currents',
    summary: 'Comprehensive notes covering magnetic flux, Faraday’s law, Lenz’s law, motional EMF, eddy current damping, inductance, and AC generator principles.',
    topics: [
      {
        id: 'top-1',
        title: "Faraday's Law of Electromagnetic Induction",
        chapterTitle: 'Chapter 6: Electromagnetic Induction',
        summary: 'Governs how a time-varying magnetic flux produces an induced electromotive force in closed loops or coils.',
        subtopics: [
          'Magnetic Flux Definition (Φ = B · A)',
          'Rate of Flux Change & Induced EMF',
          'Multi-turn Solenoids (E = -N dΦ/dt)',
        ],
        keyConcepts: [
          'Magnetic flux is the scalar product of field and surface vector.',
          'Induced EMF depends strictly on the time rate of flux change.',
          'Flux variation can occur via field intensity, loop area, or orientation angle.',
        ],
        definitions: [
          {
            term: 'Magnetic Flux (ΦB)',
            definition: 'The scalar product of uniform magnetic field B and planar surface area vector A (ΦB = B A cos θ). Measured in Webers (Wb).',
          },
          {
            term: 'Induced Electromotive Force (EMF)',
            definition: 'Potential difference generated across a closed conductor loop caused by time-varying magnetic flux linkages.',
          },
        ],
        formulas: [
          {
            name: "Faraday's Law Equation",
            formula: 'E = -N * (dΦ_B / dt)',
            explanation: 'Induced EMF equals negative time derivative of total linked magnetic flux across N turns.',
          },
        ],
        examples: [
          'A coil of 100 turns experiences a flux change from 0.05 Wb to 0.01 Wb in 0.2 seconds. Calculate induced EMF: E = -100 * (-0.04 / 0.2) = +20 V.',
        ],
        status: 'learning',
        sourceSection: 'Pages 1-2',
      },
      {
        id: 'top-2',
        title: "Lenz's Law & Energy Conservation",
        chapterTitle: 'Chapter 6: Electromagnetic Induction',
        summary: 'Determines the polarity and direction of induced currents, establishing that electromagnetic induction strictly obeys energy conservation.',
        subtopics: [
          'Opposition Principle in Direction Finding',
          'Bar Magnet & Loop Work Equivalence',
          'First Law of Thermodynamics Derivation',
        ],
        keyConcepts: [
          'Induced current magnetic field always opposes the external flux variation.',
          'Mechanical work done overcoming magnetic repulsion transforms into electrical Joule heating.',
          'Attraction without mechanical work would violate thermodynamic conservation.',
        ],
        definitions: [
          {
            term: "Lenz's Law",
            definition: 'The polarity of induced EMF always produces a current whose magnetic field opposes the change in flux that induced it.',
          },
        ],
        formulas: [
          {
            name: 'Directional Negative Sign in Induction',
            formula: 'E = - (dΦ / dt)',
            explanation: 'The negative sign is the mathematical manifestation of Lenz’s Law indicating directional opposition.',
          },
        ],
        examples: [
          'When the North pole of a magnet is plunged into a solenoid, the front face acts as a North pole, resisting the incoming motion.',
        ],
        status: 'needs-revision',
        sourceSection: 'Page 3',
        lastQuizScore: 50,
      },
      {
        id: 'top-3',
        title: 'Motional EMF & Power Dissipation',
        chapterTitle: 'Chapter 6: Electromagnetic Induction',
        summary: 'Analytical derivation of potential differences induced across a straight conductor moving transversely through a magnetic field.',
        subtopics: [
          'Conductor Rod on U-Shaped Track',
          'Lorentz Force on Free Electrons',
          'Mechanical Input Power vs Electrical Thermal Loss',
        ],
        keyConcepts: [
          'Charge separation reaches steady state when magnetic Lorentz force balances electrostatic force.',
          'Induced current creates an opposing magnetic retarding force F = I L B.',
          'Mechanical power P = F v perfectly balances thermal Joule dissipation P = I² R.',
        ],
        definitions: [
          {
            term: 'Motional EMF',
            definition: 'Electromotive force induced in a conductor solely due to its relative motion across static magnetic field lines.',
          },
        ],
        formulas: [
          {
            name: 'Motional EMF Formula',
            formula: 'E = B * L * v',
            explanation: 'Induced potential across a conductor of length L moving at velocity v perpendicular to field B.',
          },
          {
            name: 'Mechanical Power Dissipated',
            formula: 'P = (B² * L² * v²) / R',
            explanation: 'Rate of work needed to maintain steady rod velocity against magnetic drag.',
          },
        ],
        examples: [
          'A 1m metal rod moves at 5 m/s perpendicular to a 0.4 T magnetic field in a circuit of resistance 2 Ω. E = 0.4 * 1 * 5 = 2.0 V, Current I = 1.0 A.',
        ],
        status: 'not-started',
        sourceSection: 'Pages 4-5',
      },
      {
        id: 'top-4',
        title: 'Eddy Currents, Inductance & AC Generator',
        chapterTitle: 'Chapter 6: Electromagnetic Induction',
        summary: 'Circulating currents in bulk conductors, self/mutual inductance of solenoids, and rotational EMF production in AC power generators.',
        subtopics: [
          'Eddy Current Damping & Laminated Cores',
          'Self-Inductance (L) and Magnetic Energy (1/2 L I²)',
          'Mutual Inductance (M = μ0 n1 n2 A l)',
          'AC Generator Sinusoidal EMF (E = E0 sin ωt)',
        ],
        keyConcepts: [
          'Bulk metallic masses develop swirling eddy currents that cause magnetic braking and thermal heating.',
          'Laminated insulated sheets disrupt eddy current loops.',
          'Inductors oppose instantaneous current changes via back-EMF.',
          'Rotating a coil in a magnetic field converts mechanical shaft rotation into alternating sinusoidal electrical potential.',
        ],
        definitions: [
          {
            term: 'Self-Inductance (L)',
            definition: 'The ratio of total magnetic flux linked through a circuit to the current flowing through it (N Φ = L I). Unit: Henry (H).',
          },
          {
            term: 'AC Generator Peak EMF (E0)',
            definition: 'Maximum voltage produced when coil plane is parallel to field lines: E0 = N B A ω.',
          },
        ],
        formulas: [
          {
            name: 'Stored Magnetic Energy',
            formula: 'U_B = 1/2 * L * I²',
            explanation: 'Energy stored in the magnetic field of an inductor carrying current I.',
          },
          {
            name: 'AC Generator Output EMF',
            formula: 'E(t) = N * B * A * ω * sin(ωt)',
            explanation: 'Instantaneous sinusoidal voltage generated by rotating coil at angular frequency ω.',
          },
        ],
        examples: [
          'An aircraft with 20m wingspan flies horizontally at 250 m/s in vertical Earth field of 4 x 10^-5 T. Motional EMF = 20 * 250 * 4e-5 = 0.2 Volts.',
        ],
        status: 'understood',
        sourceSection: 'Pages 5-6',
        lastQuizScore: 100,
      },
    ],
  },
];
