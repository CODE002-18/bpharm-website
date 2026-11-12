import { Subject, ResourceItem, BlogPost, DrugFlashcard, QuizQuestion } from '../types';

export const HERO_LAB_IMAGE = '/images/hero_pharma_lab_study_1794398323838.jpg';
export const BLOG_GPAT_IMAGE = '/images/blog_gpat_prep_strategy_1794398326677.jpg';
export const BLOG_NIPER_IMAGE = '/images/blog_niper_career_roadmap_1794398326892.jpg';
export const BLOG_PCI_IMAGE = '/images/blog_pci_syllabus_guide_1794398327615.jpg';

export const INITIAL_SUBJECTS: Subject[] = [
  // Semester 1
  {
    id: 'sub-bp101t',
    code: 'BP101T',
    title: 'Human Anatomy and Physiology I',
    slug: 'human-anatomy-and-physiology-i',
    semester: 1,
    category: 'Pharmacology',
    summary: 'Cellular organization, skeletal system, blood physiology, lymphatic system, and cardiovascular regulation.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp102t',
    code: 'BP102T',
    title: 'Pharmaceutical Analysis I',
    slug: 'pharmaceutical-analysis-i',
    semester: 1,
    category: 'Pharmaceutical Analysis',
    summary: 'Errors in analysis, acid-base titrations, non-aqueous, precipitation, complexometric, and redox titrations.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp103t',
    code: 'BP103T',
    title: 'Pharmaceutics I',
    slug: 'pharmaceutics-i',
    semester: 1,
    category: 'Pharmaceutics',
    summary: 'History of Indian Pharmacopoeia, prescription handling, posology, powders, monophasic & biphasic liquids.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp104t',
    code: 'BP104T',
    title: 'Pharmaceutical Inorganic Chemistry',
    slug: 'pharmaceutical-inorganic-chemistry',
    semester: 1,
    category: 'Medicinal Chemistry',
    summary: 'Limit tests for impurities, gastrointestinal agents, acidifiers, antacids, cathartics, and radiopharmaceuticals.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 2
  {
    id: 'sub-bp201t',
    code: 'BP201T',
    title: 'Human Anatomy and Physiology II',
    slug: 'human-anatomy-and-physiology-ii',
    semester: 2,
    category: 'Pharmacology',
    summary: 'Central nervous system neurotransmission, digestive tract, respiratory mechanics, urinary & endocrine systems.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp202t',
    code: 'BP202T',
    title: 'Pharmaceutical Organic Chemistry I',
    slug: 'pharmaceutical-organic-chemistry-i',
    semester: 2,
    category: 'Medicinal Chemistry',
    summary: 'Structural isomerism, alkanes, alkenes, E1/E2 elimination, SN1/SN2 nucleophilic substitutions, and carbonyls.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp203t',
    code: 'BP203T',
    title: 'Biochemistry',
    slug: 'biochemistry',
    semester: 2,
    category: 'Core & Allied',
    summary: 'Bioenergetics, glycolysis, Krebs cycle, lipid beta-oxidation, amino acid catabolism, and enzyme kinetics.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp204t',
    code: 'BP204T',
    title: 'Pathophysiology',
    slug: 'pathophysiology',
    semester: 2,
    category: 'Pharmacology',
    summary: 'Cell injury, inflammation mediators, hypertension, asthma, diabetes mellitus, peptic ulcer, and oncology.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 3
  {
    id: 'sub-bp301t',
    code: 'BP301T',
    title: 'Pharmaceutical Organic Chemistry',
    slug: 'pharmaceutical-organic-chemistry',
    semester: 3,
    category: 'Medicinal Chemistry',
    summary: 'Benzene electrophilic substitution, phenols, aromatic amines, polynuclear hydrocarbons, and cycloalkanes (Baeyer strain).',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp302t',
    code: 'BP302T',
    title: 'Physical Pharmaceutics I',
    slug: 'physical-pharmaceutics-i',
    semester: 3,
    category: 'Pharmaceutics',
    summary: 'Solubility of drugs, states of matter, surface & interfacial tension, HLB scale, complexation, and pH buffers.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp303t',
    code: 'BP303T',
    title: 'Pharmaceutical Microbiology',
    slug: 'pharmaceutical-microbiology',
    semester: 3,
    category: 'Core & Allied',
    summary: 'Bacterial morphology, staining techniques, autoclave & dry heat sterilization, sterility testing, and cleanroom laminar air flow.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp304t',
    code: 'BP304T',
    title: 'Pharmaceutical Engineering',
    slug: 'pharmaceutical-engineering',
    semester: 3,
    category: 'Pharmaceutics',
    summary: 'Reynold number, Bernoulli theorem, ball & fluid energy mills, rotary drum filters, evaporation, and distillation.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 4
  {
    id: 'sub-bp401t',
    code: 'BP401T',
    title: 'Pharmaceutical Organic Chemistry III',
    slug: 'pharmaceutical-organic-chemistry-iii',
    semester: 4,
    category: 'Medicinal Chemistry',
    summary: 'Optical & geometrical isomerism, R/S and E/Z nomenclature, heterocyclic rings (pyrrole, furan, thiophene, pyridine), and named reactions.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp402t',
    code: 'BP402T',
    title: 'Medicinal Chemistry I',
    slug: 'medicinal-chemistry-i',
    semester: 4,
    category: 'Medicinal Chemistry',
    summary: 'Physicochemical parameters in SAR, cholinergic & adrenergic drugs, sedative-hypnotics, antipsychotics, and general anesthetics.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp403t',
    code: 'BP403T',
    title: 'Physical Pharmaceutics II',
    slug: 'physical-pharmaceutics-ii',
    semester: 4,
    category: 'Pharmaceutics',
    summary: 'Colloidal dispersions, Newtonian & non-Newtonian rheology, coarse emulsions/suspensions, micromeritics, and accelerated stability kinetics.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp404t',
    code: 'BP404T',
    title: 'Pharmacology I',
    slug: 'pharmacology-i',
    semester: 4,
    category: 'Pharmacology',
    summary: 'General pharmacokinetics (ADME), GPCR & ion-channel pharmacodynamics, ANS pharmacology, local anesthetics, and CNS stimulants/depressants.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp405t',
    code: 'BP405T',
    title: 'Pharmacognosy and Phytochemistry I',
    slug: 'pharmacognosy-and-phytochemistry-i',
    semester: 4,
    category: 'Pharmacognosy',
    summary: 'Classification & adulteration of crude drugs, quantitative microscopy, plant tissue culture, and marine pharmacognosy.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 5
  {
    id: 'sub-bp501t',
    code: 'BP501T',
    title: 'Medicinal Chemistry II',
    slug: 'medicinal-chemistry-ii',
    semester: 5,
    category: 'Medicinal Chemistry',
    summary: 'H1/H2 antihistamines, antineoplastic alkylating agents, anti-anginal nitrates, diuretics, oral hypoglycemics, and local anesthetics SAR.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp502t',
    code: 'BP502T',
    title: 'Industrial Pharmacy I',
    slug: 'industrial-pharmacy-i',
    semester: 5,
    category: 'Pharmaceutics',
    summary: 'Preformulation studies, tablet wet/dry granulation & coating defects, hard/soft gelatin capsules, parenterals, and pharmaceutical aerosols.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp503t',
    code: 'BP503T',
    title: 'Pharmacology II',
    slug: 'pharmacology-ii',
    semester: 5,
    category: 'Pharmacology',
    summary: 'Cardiovascular pharmacology (CHF, antihypertensives, antiarrhythmics), diuretics, autocoids, NSAIDs, and endocrine hormones.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp504t',
    code: 'BP504T',
    title: 'Pharmacognosy and Phytochemistry II',
    slug: 'pharmacognosy-and-phytochemistry-ii',
    semester: 5,
    category: 'Pharmacognosy',
    summary: 'Shikimic acid & acetate pathways, isolation and identification of alkaloids (Vinca, Opium), glycosides (Senna, Digitalis), and terpenoids.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp505t',
    code: 'BP505T',
    title: 'Pharmaceutical Jurisprudence',
    slug: 'pharmaceutical-jurisprudence',
    semester: 5,
    category: 'Core & Allied',
    summary: 'Drugs and Cosmetics Act 1940 (Schedules C, G, H, X, M), Pharmacy Act 1948, NDPS Act, DPCO price control, and Intellectual Property Rights.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 6
  {
    id: 'sub-bp601t',
    code: 'BP601T',
    title: 'Medicinal Chemistry III',
    slug: 'medicinal-chemistry-iii',
    semester: 6,
    category: 'Medicinal Chemistry',
    summary: 'Beta-lactam antibiotics, aminoglycosides, tetracyclines, antimalarials, anti-TB agents, antivirals, sulfonamides, and QSAR Hansch analysis.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp602t',
    code: 'BP602T',
    title: 'Pharmacology III',
    slug: 'pharmacology-iii',
    semester: 6,
    category: 'Pharmacology',
    summary: 'Respiratory & GI pharmacology, chemotherapy of microbial infections, tuberculosis DOTS regimen, immunosuppressants, and chronopharmacology.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp603t',
    code: 'BP603T',
    title: 'Herbal Drug Technology',
    slug: 'herbal-drug-technology',
    semester: 6,
    category: 'Pharmacognosy',
    summary: 'Ayurvedic dosage forms (Asava, Arishta, Bhasma), nutraceuticals, WHO stability testing of herbal drugs, and Schedule T GMP.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp604t',
    code: 'BP604T',
    title: 'Biopharmaceutics and Pharmacokinetics',
    slug: 'biopharmaceutics-and-pharmacokinetics',
    semester: 6,
    category: 'Pharmaceutics',
    summary: 'pH-partition hypothesis, BCS classification, Noyes-Whitney dissolution, one & two-compartment open models, bioavailability, and Michaelis-Menten kinetics.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 7
  {
    id: 'sub-bp701t',
    code: 'BP701T',
    title: 'Instrumental Methods of Analysis',
    slug: 'instrumental-methods-of-analysis',
    semester: 7,
    category: 'Pharmaceutical Analysis',
    summary: 'UV-Visible Beer-Lambert law, Woodwards rules, FTIR vibrational modes, Fluorimetry, Flame Photometry, HPLC, and Gas Chromatography.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp702t',
    code: 'BP702T',
    title: 'Industrial Pharmacy II',
    slug: 'industrial-pharmacy-ii',
    semester: 7,
    category: 'Pharmaceutics',
    summary: 'Pilot plant scale-up techniques, SUPAC guidelines, technology transfer, CDSCO regulatory affairs, ISO 9000, and QbD.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp703t',
    code: 'BP703T',
    title: 'Pharmacy Practice',
    slug: 'pharmacy-practice',
    semester: 7,
    category: 'Pharmacology',
    summary: 'Hospital pharmacy organization, therapeutic drug monitoring (TDM), adverse drug reaction (ADR) reporting, and patient counseling.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp704t',
    code: 'BP704T',
    title: 'Novel Drug Delivery Systems',
    slug: 'novel-drug-delivery-systems',
    semester: 7,
    category: 'Pharmaceutics',
    summary: 'Controlled release matrix & reservoir systems, mucoadhesive polymers, transdermal patches, liposomes, niosomes, and ocular inserts.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },

  // Semester 8
  {
    id: 'sub-bp801t',
    code: 'BP801T',
    title: 'Biostatistics and Research Methodology',
    slug: 'biostatistics-and-research-methodology',
    semester: 8,
    category: 'Core & Allied',
    summary: 'Measures of central tendency, Karl Pearson correlation, Student t-test, ANOVA, Chi-square test, and clinical trial factorial design.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp802t',
    code: 'BP802T',
    title: 'Social and Preventive Pharmacy',
    slug: 'social-and-preventive-pharmacy',
    semester: 8,
    category: 'Core & Allied',
    summary: 'National health programs in India (NTEP, NVBDCP, Universal Immunization), pharmacoeconomics, and rural sanitation.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp803et',
    code: 'BP803ET',
    title: 'Pharma Marketing Management',
    slug: 'pharma-marketing-management',
    semester: 8,
    category: 'Core & Allied',
    summary: 'Indian pharmaceutical market segmentation, product life cycle, physician detailing, DPCO pricing strategies, and retail distribution.',
    unitsCount: 5,
    trending: false,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'sub-bp804et',
    code: 'BP804ET',
    title: 'Pharmacovigilance',
    slug: 'pharmacovigilance',
    semester: 8,
    category: 'Pharmacology',
    summary: 'PvPI India, MedDRA dictionary, WHO-UMC causality assessment scale, PSUR submission, and vaccine safety surveillance.',
    unitsCount: 5,
    trending: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  // Featured & Sem 3 Pharmaceutical Organic Chemistry (/sem-3/pharmaceutical-organic-chemistry/notes)
  {
    id: 'res-poc2-notes-u1',
    title: 'Benzene, Electrophilic Substitution & Orientation Directing Groups (Unit 1 Notes)',
    subjectSlug: 'pharmaceutical-organic-chemistry',
    subjectCode: 'BP301T',
    subjectTitle: 'Pharmaceutical Organic Chemistry',
    semester: 3,
    type: 'notes',
    unitNumber: 1,
    university: 'AKTU',
    pages: 28,
    fileSize: '1.8 MB',
    summary: 'Handwritten-clarity digital notes covering Huckel 4n+2 aromaticity rule, Friedel-Crafts alkylation/acylation, and ortho/para vs meta directing groups with resonance structures.',
    previewContent: `UNIT 1: BENZENE AND ITS DERIVATIVES (BP301T - PCI SYLLABUS)
1. Analytical, Synthetic and Other Evidences in the Derivation of Structure of Benzene:
- Molecular Formula: C6H6 (High degree of unsaturation, yet resists addition reactions).
- Kekule Structure (1865): Alternating single and double bonds in a 6-membered hexagonal ring.
- Resonance Hybrid & Molecular Orbital Picture: All 6 carbon atoms are sp2 hybridized with bond angles of 120 degrees and uniform C-C bond length of 1.39 Angstrom. Delocalized pi-electron cloud above and below the ring plane gives 36 kcal/mol resonance stabilization energy.
- Huckel's Rule of Aromaticity: A cyclic, planar, fully conjugated molecule is aromatic if it possesses (4n + 2) pi electrons (where n = 1 for benzene -> 6 pi electrons).

2. Mechanism of Electrophilic Aromatic Substitution (EAS):
Step 1: Generation of Electrophile (E+)
- Nitration: HNO3 + 2H2SO4 -> NO2+ (Nitronium ion) + 2HSO4- + H3O+
- Halogenation: Cl2 + FeCl3 -> Cl+ + FeCl4-
- Sulfonation: 2H2SO4 -> SO3 (Sulfur trioxide electrophile) + H3O+ + HSO4-
- Friedel-Crafts Alkylation: R-Cl + AlCl3 -> R+ (Carbocation) + AlCl4-
Step 2: Formation of Arenium Ion (Sigma Complex / Wheland Intermediate)
Step 3: Loss of Proton (H+) to restore aromaticity.

3. Effect of Substituents on Reactivity and Orientation:
- Ortho/Para Directing & Activating: -OH, -NH2, -OR, -R (Electron donating via +M or +I stabilizes carbocation at ortho and para positions).
- Ortho/Para Directing & Deactivating: Halogens (-F, -Cl, -Br, -I) due to strong -I effect but +M lone pair donation.
- Meta Directing & Deactivating: -NO2, -CN, -CHO, -COOH, -SO3H (Strong -M/-I pulls electron density away from ortho/para).`,
    featured: true,
    downloads: 4820,
    authorUid: 'system-seed',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'res-poc2-notes-u2',
    title: 'Phenols, Acidity Comparison & Aromatic Amines Basicity (Unit 2 & 3 Notes)',
    subjectSlug: 'pharmaceutical-organic-chemistry',
    subjectCode: 'BP301T',
    subjectTitle: 'Pharmaceutical Organic Chemistry',
    semester: 3,
    type: 'notes',
    unitNumber: 2,
    university: 'AKTU',
    pages: 24,
    fileSize: '1.5 MB',
    summary: 'Complete mechanism breakdown of Reimer-Tiemann reaction, Kolbe reaction, Fries rearrangement, and Hinsberg test for amine separation.',
    previewContent: `UNIT 2 & 3: PHENOLS AND AROMATIC AMINES (BP301T)
1. Acidity of Phenols:
- Phenoxide ion (C6H5O-) is stabilized by resonance delocalization of negative charge over the ortho and para carbons of the benzene ring.
- Effect of Substituents on Acidity:
  * Electron Withdrawing Groups (-NO2, -CN, -X) stabilize phenoxide ion -> INCREASE acidity (Picric acid > p-Nitrophenol > Phenol).
  * Electron Donating Groups (-CH3, -OCH3) destabilize phenoxide ion -> DECREASE acidity (Cresol < Phenol).

2. Named Reactions of Phenols:
- Reimer-Tiemann Reaction: Phenol + CHCl3 + aq. NaOH -> Salicylaldehyde (via dichlorocarbene :CCl2 electrophile).
- Kolbe-Schmitt Reaction: Sodium phenoxide + CO2 (4-7 atm, 400K) -> Salicylic acid (Aspirin precursor).

3. Basicity of Aromatic Amines:
- Aniline (pKb ~ 9.38) is weaker base than aliphatic amines because nitrogen lone pair is delocalized into the benzene ring.
- Diazotization & Sandmeyer Reaction: Primary aromatic amine + NaNO2 + HCl (0-5 C) -> Benzene Diazonium Chloride (BDC).`,
    featured: false,
    downloads: 3190,
    authorUid: 'system-seed',
    createdAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'res-poc2-syllabus',
    title: 'BP301T Pharmaceutical Organic Chemistry Official PCI Syllabus & Practical List',
    subjectSlug: 'pharmaceutical-organic-chemistry',
    subjectCode: 'BP301T',
    subjectTitle: 'Pharmaceutical Organic Chemistry',
    semester: 3,
    type: 'syllabus',
    unitNumber: 0,
    university: 'AKTU',
    pages: 6,
    fileSize: '420 KB',
    summary: 'Complete 45-hour PCI syllabus breakdown across Units 1 to 5 plus 4-hour/week laboratory experiments (recrystallization, steam distillation, acid/iodine value).',
    previewContent: `PCI OFFICIAL SYLLABUS: BP301T PHARMACEUTICAL ORGANIC CHEMISTRY (45 HOURS)
Unit I (10 Hours): Benzene and its derivatives - Analytical, synthetic and other evidences in the derivation of structure of benzene, orbital picture, resonance in benzene, aromatic characters, Huckel's rule. Reactions of benzene - nitration, sulphonation, halogenation, Friedelcrafts alkylation & acylation. Substituents, effect of substituents on reactivity and orientation. Structure and uses of DDT, Saccharin, BHC and Chloramine.

Unit II (10 Hours): Phenols - Acidity of phenols, effect of substituents on acidity, qualitative tests, Structure and uses of phenol, cresols, resorcinol, naphthols. Aromatic Amines - Basicity of amines, effect of substituents on basicity, and synthetic uses of aryl diazonium salts.

Unit III (10 Hours): Fats and Oils - Fatty acids reactions. Hydrolysis, Hydrogenation, Saponification and Rancidity of oils, Drying oils. Analytical constants - Acid value, Saponification value, Ester value, Iodine value, Acetyl value, Reichert Meissl (RM) value.

Unit IV (08 Hours): Polynuclear hydrocarbons - Synthesis, reactions, structure and medicinal uses of Naphthalene, Phenanthrene, Anthracene, Diphenylmethane, Triphenylmethane and their derivatives.

Unit V (07 Hours): Cycloalkanes - Stabilities - Baeyer's strain theory, limitation of Baeyer's strain theory, Coulson and Moffitt's modification, Sachse Mohr's theory (Theory of strainless rings), reactions of cyclopropane and cyclobutane.`,
    featured: false,
    downloads: 2940,
    authorUid: 'system-seed',
    createdAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'res-poc2-pyqs',
    title: 'Last 5 Years AKTU Question Papers (PYQ 2021–2025) – BP301T',
    subjectSlug: 'pharmaceutical-organic-chemistry',
    subjectCode: 'BP301T',
    subjectTitle: 'Pharmaceutical Organic Chemistry',
    semester: 3,
    type: 'pyqs',
    unitNumber: 0,
    university: 'AKTU',
    pages: 34,
    fileSize: '2.4 MB',
    summary: 'Complete 10-mark, 7-mark, and 2-mark AKTU end-semester PYQ papers (Section A, B & C) with reaction schemes.',
    previewContent: `PREVIOUS YEAR QUESTION PAPERS (PYQ 2021-2025) - BP301T
SECTION A: 2-MARK SHORT QUESTIONS (Repeated 4+ Times)
Q1. Define Huckel's Rule of Aromaticity with two examples.
Ans: A planar, monocyclic, completely conjugated system is aromatic if it has (4n + 2) delocalized pi-electrons. Examples: Benzene (n=1, 6 pi e-), Naphthalene (n=2, 10 pi e-).

Q2. Define Saponification Value and Iodine Value of fats.
Ans:
- Saponification Value: Number of mg of KOH required to saponify the esters and neutralize free fatty acids in 1g of fat/oil.
- Iodine Value: Grams of iodine absorbed by 100g of fat/oil (measures degree of unsaturation).

SECTION B: 10-MARK LONG ESSAY QUESTIONS
Q3. Discuss Baeyer's Strain Theory of cycloalkanes. Give its limitations and explain Sachse-Mohr's theory of strainless rings.
Q4. Explain the mechanism of Electrophilic Aromatic Substitution in benzene with reference to Nitration and Friedel-Crafts Acylation. Why is Friedel-Crafts acylation preferred over alkylation for synthesizing n-propylbenzene?`,
    featured: true,
    downloads: 5610,
    authorUid: 'system-seed',
    createdAt: '2026-02-04T10:00:00.000Z',
  },
  {
    id: 'res-poc2-imp',
    title: 'AKTU End-Sem Guess Paper & High-Probability Questions – BP301T',
    subjectSlug: 'pharmaceutical-organic-chemistry',
    subjectCode: 'BP301T',
    subjectTitle: 'Pharmaceutical Organic Chemistry',
    semester: 3,
    type: 'important-questions',
    unitNumber: 0,
    university: 'AKTU',
    pages: 12,
    fileSize: '890 KB',
    summary: 'Curated night-before-exam AKTU Guess Paper covering high-probability 10-mark and 7-mark questions across all 5 units.',
    previewContent: `AKTU END-SEMESTER GUESS PAPER (BP301T)
Unit 1 Priority:
1. Give analytical and synthetic evidences for the structure of Benzene. (10 Marks - 95% Probability)
2. Explain activating and deactivating groups with resonance diagrams of Phenol and Nitrobenzene. (7 Marks)
3. Structure, synthesis and uses of Saccharin, DDT, and Chloramine-T. (5 Marks)

Unit 2 Priority:
4. Account for the acidity of phenols and effect of substituents on pKa. (7 Marks)
5. Synthetic versatility of Aryldiazonium salts (Sandmeyer, Gattermann, Coupling reactions). (10 Marks)

Unit 3 Priority:
6. Principle and pharmaceutical significance of Acid Value, Saponification Value, Iodine Value (Wij's Method), and RM Value. (10 Marks)

Unit 4 & 5 Priority:
7. Haworth synthesis of Naphthalene and Phenanthrene with chemical reactions. (10 Marks)
8. Baeyer's Angle Strain Calculation for Cyclopropane (24 deg 44') and Coulson-Moffitt Banana Bond model. (7 Marks)`,
    featured: false,
    downloads: 4120,
    authorUid: 'system-seed',
    createdAt: '2026-02-05T10:00:00.000Z',
  },

  // Sem 1 HAP & Analysis
  {
    id: 'res-hap1-notes',
    title: 'Cardiovascular System, ECG Waves & Blood Coagulation Cascade (Complete Notes)',
    subjectSlug: 'human-anatomy-and-physiology-i',
    subjectCode: 'BP101T',
    subjectTitle: 'Human Anatomy and Physiology I',
    semester: 1,
    type: 'notes',
    unitNumber: 5,
    university: 'AKTU',
    pages: 32,
    fileSize: '2.1 MB',
    summary: 'Labeled anatomical flowcharts of the cardiac conduction system (SA node to Purkinje fibers), cardiac cycle (0.8s), and intrinsic/extrinsic clotting pathways.',
    previewContent: `HUMAN ANATOMY & PHYSIOLOGY I (BP101T) - CARDIOVASCULAR & BLOOD NOTES
1. Cardiac Conduction System (Pacemaker Hierarchy):
- Sinoatrial (SA) Node: Right atrial wall near superior vena cava opening. Fires at 70-80 bpm (Natural Pacemaker).
- Atrioventricular (AV) Node: Interatrial septum; introduces 0.1s physiological delay allowing complete atrial contraction before ventricular systole.
- Bundle of His & Left/Right Bundle Branches -> Purkinje Fibers (Ventricular myocardium contraction).

2. Standard 12-Lead ECG Waveform:
- P Wave (0.08-0.10s): Atrial depolarization.
- PR Interval (0.12-0.20s): AV nodal conduction time (prolonged in 1st-degree heart block).
- QRS Complex (0.08-0.12s): Ventricular depolarization (masks atrial repolarization).
- T Wave: Ventricular repolarization.

3. Coagulation Clotting Factors (I to XIII):
- Prothrombin + Thromboplastin + Ca2+ -> Thrombin
- Fibrinogen (Soluble Factor I) --(Thrombin)--> Fibrin Monomer --(Factor XIIIa)--> Cross-linked Fibrin Clot.`,
    featured: true,
    downloads: 6240,
    authorUid: 'system-seed',
    createdAt: '2026-02-07T10:00:00.000Z',
  },
  {
    id: 'res-pa1-notes',
    title: 'Acid-Base, Non-Aqueous & Redox Titration Curves Master Guide – BP102T',
    subjectSlug: 'pharmaceutical-analysis-i',
    subjectCode: 'BP102T',
    subjectTitle: 'Pharmaceutical Analysis I',
    semester: 1,
    type: 'notes',
    unitNumber: 2,
    university: 'AKTU',
    pages: 26,
    fileSize: '1.6 MB',
    summary: 'Indicator theory (Ostwald & Quinonoid), perchloric acid standardization in glacial acetic acid, and Mohr/Volhard/Fajans argentometric comparisons.',
    previewContent: `PHARMACEUTICAL ANALYSIS I (BP102T) - TITRIMETRY MASTER NOTES
1. Non-Aqueous Titration:
- Used for weakly basic drugs (e.g., Ephedrine HCl, Adrenaline, Metronidazole) or weakly acidic drugs (Barbiturates, Phenytoin) that give poor sharp endpoints in water due to leveling effect of H2O.
- Solvents:
  * Protophilic (Basic): Ethylenediamine, Butylamine (for weak acids).
  * Protogenic (Acidic): Glacial acetic acid (for weak bases).
  * Aprotic: Chloroform, Benzene.
- Titrant for Weak Bases: 0.1N Perchloric Acid (HClO4) in Glacial Acetic Acid; Indicator: Crystal Violet; Primary Standard: Potassium Hydrogen Phthalate (KHP).

2. Precipitation Titrations (Argentometry):
- Mohr's Method: Direct titration with AgNO3; Indicator: K2CrO4 (brick-red Ag2CrO4 precipitate at endpoint); pH 6.5 - 9.0.
- Volhard's Method: Back titration in nitric acid medium with NH4SCN; Indicator: Ferric Alum (ferric thiocyanate blood-red complex).
- Fajans' Method: Adsorption indicator (Fluorescein / Dichlorofluorescein).`,
    featured: false,
    downloads: 3750,
    authorUid: 'system-seed',
    createdAt: '2026-02-08T10:00:00.000Z',
  },

  // Sem 4 Pharmacology I & Med Chem I
  {
    id: 'res-pharm1-notes',
    title: 'ANS Pharmacology: Cholinergic & Adrenergic Receptors Master Chart – BP404T',
    subjectSlug: 'pharmacology-i',
    subjectCode: 'BP404T',
    subjectTitle: 'Pharmacology I',
    semester: 4,
    type: 'notes',
    unitNumber: 2,
    university: 'AKTU',
    pages: 38,
    fileSize: '2.5 MB',
    summary: 'Complete classification, G-protein second messengers (Gs, Gi, Gq), organ-system actions, and clinical antidotes for Organophosphate poisoning (Atropine + Pralidoxime).',
    previewContent: `PHARMACOLOGY I (BP404T) - AUTONOMIC NERVOUS SYSTEM MASTER NOTES
1. Cholinergic Receptor Subtypes (Muscarinic GPCR & Nicotinic Ionotropic):
- M1 (Neural / Gastric Parietal): Gq-coupled -> IP3/DAG -> Increases gastric acid secretion (Blocked by Pirenzepine).
- M2 (Cardiac SA/AV Node): Gi-coupled -> Decreases cAMP & opens K+ channels -> Bradycardia.
- M3 (Smooth Muscle & Exocrine Glands): Gq-coupled -> Bronchoconstriction, bladder detrusor contraction, miosis (sphincter pupillae), and salivation/sweating.

2. Organophosphate (OP) Anticholinesterase Poisoning Management:
- Mechanism: Irreversible phosphorylation of serine-OH group at Acetylcholinesterase esteratic site.
- Specific Antidote Protocol:
  1) Airway & Oxygenation support.
  2) Atropine Sulfate: 2 mg IV repeated every 10 mins until complete atropinization (dry bronchial secretions, mydriasis, tachycardia).
  3) Pralidoxime (2-PAM): Cholinesterase reactivator (1-2 g IV infusion within 24 hours before "aging" of phosphorylated enzyme occurs).`,
    featured: true,
    downloads: 7490,
    authorUid: 'system-seed',
    createdAt: '2026-02-09T10:00:00.000Z',
  },
  {
    id: 'res-medchem1-short',
    title: 'SAR & Chemical Synthesis Book of 35 Starred Drugs (PCI Syllabus) – BP402T',
    subjectSlug: 'medicinal-chemistry-i',
    subjectCode: 'BP402T',
    subjectTitle: 'Medicinal Chemistry I',
    semester: 4,
    type: 'notes',
    unitNumber: 0,
    university: 'AKTU',
    pages: 18,
    fileSize: '1.3 MB',
    summary: 'Every starred (*) drug synthesis required by PCI for Sem 4: Salbutamol, Propranolol, Phenylephrine, Diazepam, Phenytoin, Halothane, and Chlorpromazine.',
    previewContent: `MEDICINAL CHEMISTRY I (BP402T) - STARRED (*) DRUG SYNTHESIS & SAR
1. SAR of Sympathomimetic Beta-Phenylethylamines:
- Benzene ring separated from amino group by 2-carbon chain (-CH(OH)-CH2-NH-R) is essential for optimal agonist activity.
- Catechol OH groups at positions 3 and 4 confer maximal alpha and beta activity but subject the drug to COMT degradation (poor oral bioavailability).
- Replacing 3-OH with -CH2OH (as in Salbutamol) resists COMT and provides selective Beta-2 bronchodilator action.
- Bulky isopropyl or tert-butyl group on nitrogen increases Beta-receptor selectivity over Alpha-receptors.

2. Synthesis of Propranolol:
1-Naphthol + Epichlorohydrin --(NaOH)--> 1-(1-Naphthyloxy)-2,3-epoxypropane --(Isopropylamine)--> Propranolol.

3. Synthesis of Phenytoin (5,5-Diphenylhydantoin):
Benzil + Urea --(Alc. KOH / Benzilic Acid Rearrangement)--> Phenytoin.`,
    featured: true,
    downloads: 5830,
    authorUid: 'system-seed',
    createdAt: '2026-02-10T10:00:00.000Z',
  },

  // Sem 5 Industrial Pharmacy I & Sem 6 Biopharmaceutics
  {
    id: 'res-indpharm1-notes',
    title: 'Tablet Compression, Granulation & Coating Defects Troubleshooting – BP502T',
    subjectSlug: 'industrial-pharmacy-i',
    subjectCode: 'BP502T',
    subjectTitle: 'Industrial Pharmacy I',
    semester: 5,
    type: 'notes',
    unitNumber: 2,
    university: 'AKTU',
    pages: 30,
    fileSize: '1.9 MB',
    summary: 'Excipients table (diluents, binders, disintegrants), capping/lamination/picking/mottling root causes & remedies, and IP QC tests (friability, weight variation, dissolution).',
    previewContent: `INDUSTRIAL PHARMACY I (BP502T) - TABLET TECHNOLOGY
1. Tablet Processing & Coating Defects (Viva & Exam Favorite):
- Capping: Partial or complete separation of top/bottom crowns of a tablet due to air entrapment or over-dried granules. Remedy: Add hygroscopic humectant (PEG 4000/Sorbitol), reduce punch speed, use pre-compression roller.
- Lamination: Separation of tablet into two or more distinct horizontal layers.
- Picking & Sticking: Granule adhesion to punch face/lettering due to excess moisture or low melting point API. Remedy: Increase anti-adherent/lubricant (Magnesium stearate 0.5-1%, Talc), polish punch faces.
- Mottling: Unequal color distribution on tablet surface.
- Orange Peel (Roughness): High viscosity of coating solution or poor atomization pressure during film coating.

2. IP Official Quality Control Standards for Uncoated Tablets:
- Weight Variation Limit (IP):
  * <= 80 mg average weight: +/- 10%
  * > 80 mg to < 250 mg: +/- 7.5%
  * >= 250 mg: +/- 5%
- Friability Test (Roche Friabilator): 20 rpm for 4 minutes (100 revolutions); weight loss must be <= 1.0% w/w.`,
    featured: true,
    downloads: 4920,
    authorUid: 'system-seed',
    createdAt: '2026-02-11T10:00:00.000Z',
  },
  {
    id: 'res-biopharm-notes',
    title: 'BCS Classification, Bioavailability & One-Compartment IV Bolus Kinetics – BP604T',
    subjectSlug: 'biopharmaceutics-and-pharmacokinetics',
    subjectCode: 'BP604T',
    subjectTitle: 'Biopharmaceutics and Pharmacokinetics',
    semester: 6,
    type: 'notes',
    unitNumber: 3,
    university: 'AKTU',
    pages: 29,
    fileSize: '1.7 MB',
    summary: 'Derivations for plasma concentration C = C0*e^(-Ket), elimination half-life t1/2 = 0.693/Ke, AUC trapezoidal rule, and absolute vs relative bioavailability formulas.',
    previewContent: `BIOPHARMACEUTICS & PHARMACOKINETICS (BP604T)
1. Biopharmaceutics Classification System (BCS - Amidon et al.):
- Class I (High Solubility, High Permeability): Propranolol, Metoprolol, Paracetamol. (Absorption rate-limited by gastric emptying).
- Class II (Low Solubility, High Permeability): Phenytoin, Ibuprofen, Griseofulvin, Nifedipine. (Rate-limited by Dissolution).
- Class III (High Solubility, Low Permeability): Ranitidine, Atenolol, Metformin. (Rate-limited by Permeability).
- Class IV (Low Solubility, Low Permeability): Furosemide, Taxol, Hydrochlorothiazide.

2. One-Compartment Open Model (IV Bolus Administration):
- First-Order Elimination Equation: C = C0 * exp(-Ke * t)
- Log10 Form: log C = log C0 - (Ke * t) / 2.303
- Apparent Volume of Distribution (Vd): Vd = Dose (X0) / C0
- Biological Half-Life (t1/2): t1/2 = 0.693 / Ke
- Total Body Clearance (ClT): ClT = Ke * Vd = Dose / [AUC]0-inf`,
    featured: false,
    downloads: 4310,
    authorUid: 'system-seed',
    createdAt: '2026-02-12T10:00:00.000Z',
  },

  // Sem 7 Instrumental Analysis & Sem 8 Pharmacovigilance
  {
    id: 'res-ima-notes',
    title: 'UV-Visible, FTIR Spectroscopy & HPLC Instrumentation Complete Notes – BP701T',
    subjectSlug: 'instrumental-methods-of-analysis',
    subjectCode: 'BP701T',
    subjectTitle: 'Instrumental Methods of Analysis',
    semester: 7,
    type: 'notes',
    unitNumber: 1,
    university: 'AKTU',
    pages: 35,
    fileSize: '2.2 MB',
    summary: 'Electronic transitions (sigma, pi, n), bathochromic/hypsochromic shifts, Woodward-Fieser diene calculations, and reverse-phase C18 HPLC columns.',
    previewContent: `INSTRUMENTAL METHODS OF ANALYSIS (BP701T)
1. UV-Visible Spectroscopy (200-800 nm):
- Beer-Lambert Law: A = log10(I0 / I) = epsilon * b * c
  (where epsilon = Molar absorptivity, b = path length in cm, c = molar concentration).
- Electronic Transitions Energy Order: sigma -> sigma* > n -> sigma* > pi -> pi* > n -> pi*
- Spectral Shifts:
  * Bathochromic (Red Shift): Shift of lambda-max to LONGER wavelength due to conjugation or auxochrome.
  * Hypsochromic (Blue Shift): Shift of lambda-max to SHORTER wavelength (e.g., protonation of aniline to anilinium ion).
  * Hyperchromic: Increase in absorbance intensity (epsilon).
  * Hypochromic: Decrease in absorbance intensity.

2. High Performance Liquid Chromatography (HPLC):
- Normal Phase: Polar stationary phase (Silica) + Non-polar mobile phase (Hexane/IPA). Polar solutes elute last.
- Reverse Phase (RP-HPLC - 85% of Pharma assays): Non-polar octadecylsilane (ODS / C18) stationary phase + Polar mobile phase (Water/Methanol/Acetonitrile). Non-polar solutes elute last.`,
    featured: false,
    downloads: 3980,
    authorUid: 'system-seed',
    createdAt: '2026-02-13T10:00:00.000Z',
  },
  {
    id: 'res-pv-notes',
    title: 'PvPI India, WHO-UMC Causality Scale & MedDRA Coding Guide – BP804ET',
    subjectSlug: 'pharmacovigilance',
    subjectCode: 'BP804ET',
    subjectTitle: 'Pharmacovigilance',
    semester: 8,
    type: 'notes',
    unitNumber: 2,
    university: 'AKTU',
    pages: 22,
    fileSize: '1.4 MB',
    summary: 'Complete breakdown of Indian Pharmacopoeia Commission (IPC Ghaziabad) ADR monitoring centers, Vigiflow, Naranjo algorithm, and clinical trial SAE timelines.',
    previewContent: `PHARMACOVIGILANCE (BP804ET) - SEM 8 ELECTIVE NOTES
1. Pharmacovigilance Programme of India (PvPI):
- National Coordination Centre (NCC): Indian Pharmacopoeia Commission (IPC), Ghaziabad.
- Global WHO Centre for International Drug Monitoring: Uppsala Monitoring Centre (UMC), Sweden (Uses VigiBase / VigiFlow).

2. Classification of Adverse Drug Reactions (Rawlins & Thompson):
- Type A (Augmented): Dose-dependent, predictable from known pharmacology (e.g., Hypoglycemia with Insulin, Bleeding with Warfarin).
- Type B (Bizarre): Dose-independent, idiosyncratic/immunological (e.g., Penicillin anaphylaxis, Aplastic anemia with Chloramphenicol).
- Type C (Chronic): Long-term therapy (e.g., Corticosteroid osteoporosis).
- Type D (Delayed): Teratogenicity (Thalidomide phocomelia) or Carcinogenicity.
- Type E (End of Use): Withdrawal syndrome (Beta-blocker rebound tachycardia).

3. MedDRA Hierarchy (5 Levels):
System Organ Class (SOC) -> High Level Group Term (HLGT) -> High Level Term (HLT) -> Preferred Term (PT) -> Lowest Level Term (LLT).`,
    featured: false,
    downloads: 3120,
    authorUid: 'system-seed',
    createdAt: '2026-02-14T10:00:00.000Z',
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-gpat-2027-strategy',
    title: 'How to Crack GPAT 2027 While Preparing for Your 3rd & 4th Year Semester Exams',
    slug: 'how-to-crack-gpat-2027-strategy',
    category: 'GPAT & NIPER',
    readTime: '6 min read',
    publishedDate: 'November 2026',
    excerpt: 'Stop treating university exams and GPAT as two separate worlds. Learn the 70-20-10 subject weightage rule for Pharmacology, Pharmaceutics, Organic Chemistry, and Pharmacognosy.',
    content: `If you ask any top-100 GPAT ranker their secret, they won't tell you they studied 14 hours a day. Instead, they aligned their B.Pharm Semester 4, 5, 6, and 7 PCI syllabus directly with the NBEMS GPAT blueprint.

1. The Big Four Pillar Subjects (72% of Total Marks)
out of 125 questions (500 marks), nearly 90 questions come directly from four core areas:
- Pharmacology (28–30 questions): Focus heavily on ANS, CVS, Chemotherapy, and Autocoids. Master drug classifications from KD Tripathi and Mechanism of Action (MOA) exceptions.
- Pharmaceutics & Biopharmaceutics (32–35 questions): Tablet defects, Rheology, Micromeritics, Preformulation, Sterilization, and One-Compartment PK formulas are guaranteed scorers.
- Medicinal & Organic Chemistry (18–22 questions): Name reactions (Reimer-Tiemann, Sandmeyer, Beckmann, Fries), stereochemistry (R/S, E/Z), and heterocyclic ring numbering.
- Pharmacognosy & Phytochemistry (10–12 questions): Chemical tests (Dragendorff, Keller-Killiani, Vitali-Morin), biological sources, and microscopy (stomata & calcium oxalate crystals).

2. The Minor High-ROI Subjects (Don't Skip These!)
Students often ignore Pharmaceutical Analysis (UV, IR, NMR, HPLC), Jurisprudence (Schedules & Form Numbers), and Microbiology. Yet 6 hours of revising Schedule H, X, G, C, C1, M, T, and Y can easily fetch you +20 marks with zero negative marking risk.

3. Recommended 90-Day Revision Routine
- Morning (45 mins): Active recall of 1 drug classification family + 5 prescription abbreviations.
- College Free Periods: Solve 25 previous-year GPAT MCQs on BPharmHub's Quick Quiz tool.
- Weekend Mock Analysis: Maintain an "Error Notebook" specifically for negative-marked questions.`,
    imageUrl: BLOG_GPAT_IMAGE,
    authorName: 'Dr. Aarav Deshmukh, M.Pharm (Pharmacology)',
    authorUid: 'system-seed',
    createdAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'blog-niper-career-roadmap',
    title: 'Beyond Retail Pharmacy: High-Growth Career Paths in R&D, Regulatory Affairs & Pharmacovigilance',
    slug: 'niper-mba-regulatory-affairs-career-roadmap',
    category: 'Career Guidance',
    readTime: '5 min read',
    publishedDate: 'November 2026',
    excerpt: 'Confused between M.Pharm, Pharm.D (Post-Baccalaureate), Pharma MBA at NIPER, or direct industry placement? Here is a transparent salary and role comparison for Indian graduates.',
    content: `Every final-year B.Pharm student faces the same crossroads: jump straight into a pharmaceutical company after Sem 8 or qualify GPAT/NIPER JEE for a master's degree? Let's break down the real landscape in India today.

1. Formulation Development (F&D) & Analytical R&D
Located in hubs like Hyderabad (Genome Valley), Ahmedabad, Mumbai, Pune, and Baddi, F&D scientists design generic ANDA formulations for USFDA and EU markets.
- Entry Qualification: M.Pharm in Pharmaceutics / Industrial Pharmacy / Pharmaceutical Analysis (NIPER, ICT Mumbai, BITS, DPSRU, Manipal).
- Typical Starting Package: ₹5.5 LPA to ₹9.5 LPA.

2. Global Regulatory Affairs (GRA) & eCTD Submissions
Every medicine exported to regulated markets requires a Common Technical Document (CTD) dossier (Modules 1 to 5). Regulatory specialists bridge R&D labs and health authorities (CDSCO, USFDA, MHRA, EMA).
- Why Students Love It: Clean corporate desk hours, international exposure, and rapid growth to Manager levels within 5 years.

3. Pharmacovigilance (PV) & Clinical Data Management (CDM)
Global CROs (IQVIA, Parexel, Syneos, TCS, Cognizant) hire B.Pharm graduates directly for ICSR case processing, MedDRA coding, and narrative writing.
- Pro Tip: Master Semester 8's BP804ET Pharmacovigilance notes, WHO-UMC causality scales, and E2B guidelines before your campus interview!`,
    imageUrl: BLOG_NIPER_IMAGE,
    authorName: 'Sneha Kulkarni, NIPER Mohali Alumna',
    authorUid: 'system-seed',
    createdAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'blog-dpharm-to-bpharm-lateral-entry',
    title: 'D.Pharm to B.Pharm Lateral Entry & PCI Syllabus Guide: Everything 2nd-Year Students Need',
    slug: 'dpharm-to-bpharm-lateral-entry-pci-guide',
    category: 'D.Pharm to B.Pharm',
    readTime: '4 min read',
    publishedDate: 'October 2026',
    excerpt: 'Transitioning directly into Semester 3 after D.Pharm? Here is how to bridge Organic Chemistry, Physical Pharmaceutics, and credit-based grading without feeling overwhelmed.',
    content: `Joining B.Pharm directly in the 2nd year (Semester 3) via lateral entry is one of the smartest ways for Diploma in Pharmacy (D.Pharm) holders to upgrade their qualification. However, the shift from annual exams to PCI's credit-based semester system can feel intense at first.

1. Understand the 75 + 25 Grading Split
Under PCI regulations:
- Internal Assessment (25 Marks): 15 marks come from two Sessional Exams (best or average of two) + 10 marks from attendance, assignments, and student-teacher interaction. Never skip sessional exams!
- End-Semester University Theory (75 Marks): Typically consists of 2-mark objective/short defs, 5/7-mark medium notes, and 10-mark comprehensive essays.

2. Bridge Your Organic Chemistry Fundamentals First
In Sem 3, BP301T (Pharmaceutical Organic Chemistry II) assumes you already know hybridization, inductive/mesomeric effects, and SN1/SN2 from Sem 2. Spend your first two weekends reading our Sem 2 Organic Chemistry Short Notes so Benzene and Phenol mechanisms click effortlessly.

3. How to Convert Your SGPA / CGPA to Percentage
Most Indian universities follow the standard PCI conversion formula: Percentage = (CGPA - 0.75) × 10 (or CGPA × 9.5 depending on university ordinance). Use the BPharmHub CGPA Calculator in the Tools tab to track your target grades every semester!`,
    imageUrl: BLOG_PCI_IMAGE,
    authorName: 'Rohan Verma, BPharmHub Academic Lead',
    authorUid: 'system-seed',
    createdAt: '2026-10-28T09:00:00.000Z',
  },
];

export const DRUG_FLASHCARDS: DrugFlashcard[] = [
  {
    id: 'fc-1',
    abbrev: 'p.c.',
    latinOrFull: 'Post cibum',
    meaning: 'After meals',
    category: 'Frequency',
    clinicalExample: 'Metformin 500mg tab p.c. to minimize GI gastric irritation.',
  },
  {
    id: 'fc-2',
    abbrev: 'a.c.',
    latinOrFull: 'Ante cibum',
    meaning: 'Before meals',
    category: 'Frequency',
    clinicalExample: 'Pantoprazole 40mg tab 30 mins a.c. in the morning.',
  },
  {
    id: 'fc-3',
    abbrev: 'h.s. / b.t.',
    latinOrFull: 'Hora somni / Bedtime',
    meaning: 'At bedtime',
    category: 'Frequency',
    clinicalExample: 'Atorvastatin 20mg tab h.s. (peak hepatic cholesterol synthesis occurs at night).',
  },
  {
    id: 'fc-4',
    abbrev: 'p.r.n. / s.o.s.',
    latinOrFull: 'Pro re nata / Si opus sit',
    meaning: 'When required / In emergency',
    category: 'Frequency',
    clinicalExample: 'Paracetamol 650mg p.r.n. for fever > 100.4°F.',
  },
  {
    id: 'fc-5',
    abbrev: 'b.i.d. / b.d.',
    latinOrFull: 'Bis in die',
    meaning: 'Twice a day (every 12 hours)',
    category: 'Frequency',
    clinicalExample: 'Amoxicillin + Clavulanate 625mg b.i.d. for 5 days.',
  },
  {
    id: 'fc-6',
    abbrev: 't.i.d. / t.d.s.',
    latinOrFull: 'Ter in die / Ter die sumendum',
    meaning: 'Three times a day (every 8 hours)',
    category: 'Frequency',
    clinicalExample: 'Metronidazole 400mg t.i.d. for anaerobic infection.',
  },
  {
    id: 'fc-7',
    abbrev: 'q.i.d. / q.d.s.',
    latinOrFull: 'Quater in die',
    meaning: 'Four times a day (every 6 hours)',
    category: 'Frequency',
    clinicalExample: 'Ciprofloxacin eye drops 1 gtt q.i.d. in affected eye.',
  },
  {
    id: 'fc-8',
    abbrev: 'stat.',
    latinOrFull: 'Statim',
    meaning: 'Immediately / At once',
    category: 'Clinical Instruction',
    clinicalExample: 'Inj. Adrenaline 0.5mg IM stat. in anaphylactic shock.',
  },
  {
    id: 'fc-9',
    abbrev: 's.l.',
    latinOrFull: 'Sublingual',
    meaning: 'Under the tongue (bypasses first-pass metabolism)',
    category: 'Route',
    clinicalExample: 'Nitroglycerin (GTN) 0.5mg tab s.l. for acute angina pectoris.',
  },
  {
    id: 'fc-10',
    abbrev: 'q.s.',
    latinOrFull: 'Quantum sufficit',
    meaning: 'A sufficient quantity (to make up volume)',
    category: 'Formulation',
    clinicalExample: 'Purified Water IP q.s. ad 100 mL.',
  },
  {
    id: 'fc-11',
    abbrev: 'gtt.',
    latinOrFull: 'Guttae',
    meaning: 'Drops',
    category: 'Formulation',
    clinicalExample: 'Instill ii gtt. of Timolol 0.5% ophthalmic solution.',
  },
  {
    id: 'fc-12',
    abbrev: 'Rx',
    latinOrFull: 'Recipe (Superscription)',
    meaning: 'Take thou / You take (Symbol of Jupiter)',
    category: 'Clinical Instruction',
    clinicalExample: 'Standard prescription superscription heading.',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    subjectCategory: 'Pharmacology',
    question: 'Which cholinesterase reactivator is contraindicated in Carbamate (Physostigmine/Neostigmine) poisoning?',
    options: ['Atropine sulfate', 'Pralidoxime (2-PAM)', 'N-Acetylcysteine', 'Flumazenil'],
    correctIndex: 1,
    explanation: 'Pralidoxime (2-PAM) itself has weak anti-cholinesterase activity and does not reactivate carbamylated enzyme; it can worsen carbamate toxicity.',
  },
  {
    id: 'q-2',
    subjectCategory: 'Pharmacology',
    question: 'Which selective Beta-1 blocker additionally possesses nitric-oxide (NO) mediated vasodilatory action?',
    options: ['Atenolol', 'Metoprolol', 'Nebivolol', 'Propranolol'],
    correctIndex: 2,
    explanation: 'Nebivolol is a 3rd-generation selective Beta-1 antagonist that stimulates endothelial nitric oxide synthase (eNOS) via Beta-3 agonism.',
  },
  {
    id: 'q-3',
    subjectCategory: 'Pharmaceutics',
    question: 'According to the Indian Pharmacopoeia (IP), what is the maximum permissible weight variation limit for an uncoated tablet weighing 300 mg?',
    options: ['± 10.0%', '± 7.5%', '± 5.0%', '± 2.5%'],
    correctIndex: 2,
    explanation: 'For tablets weighing 250 mg or more under IP standards, the allowed deviation is ± 5.0% (USP limit is ± 5% for >324 mg).',
  },
  {
    id: 'q-4',
    subjectCategory: 'Pharmaceutics',
    question: 'An HLB (Hydrophilic-Lipophilic Balance) value between 8 and 18 indicates which class of surfactant?',
    options: ['Antifoaming agent', 'W/O Emulsifying agent', 'O/W Emulsifying agent', 'Wetting agent only'],
    correctIndex: 2,
    explanation: 'According to Griffin’s HLB scale, surfactants with HLB 8–18 (such as Tween 80, HLB 15) are hydrophilic and form Oil-in-Water (O/W) emulsions.',
  },
  {
    id: 'q-5',
    subjectCategory: 'Medicinal Chemistry',
    question: 'According to Huckel’s rule, how many delocalized pi-electrons are present in Phenanthrene (n = 3)?',
    options: ['6 pi-electrons', '10 pi-electrons', '14 pi-electrons', '18 pi-electrons'],
    correctIndex: 2,
    explanation: 'Using (4n + 2) pi electrons with n = 3 (three fused benzene rings): 4(3) + 2 = 14 pi-electrons.',
  },
  {
    id: 'q-6',
    subjectCategory: 'Medicinal Chemistry',
    question: 'Which reaction converts Phenol into Salicylaldehyde using Chloroform (CHCl3) and aqueous NaOH?',
    options: ['Kolbe-Schmitt reaction', 'Reimer-Tiemann reaction', 'Perkin condensation', 'Cannizzaro reaction'],
    correctIndex: 1,
    explanation: 'Reimer-Tiemann formylation uses CHCl3 + NaOH via an electrophilic dichlorocarbene (:CCl2) intermediate to yield ortho-hydroxybenzaldehyde (Salicylaldehyde).',
  },
  {
    id: 'q-7',
    subjectCategory: 'Pharmaceutical Analysis',
    question: 'Which indicator is most commonly used in the non-aqueous titration of weakly basic drugs with 0.1N Perchloric acid?',
    options: ['Phenolphthalein', 'Methyl orange', 'Crystal violet', 'Eriochrome Black T'],
    correctIndex: 2,
    explanation: 'Crystal violet (0.5% in glacial acetic acid) changes color from violet through blue-green to yellowish-green at the equivalence point in non-aqueous titrimetry.',
  },
  {
    id: 'q-8',
    subjectCategory: 'Pharmacognosy',
    question: 'Keller-Killiani test is the specific chemical identification test for which constituent of Digitalis purpurea?',
    options: ['Tropane alkaloids', 'Digitoxose (2-deoxysugar) in cardiac glycosides', 'Anthraquinone aglycones', 'Hydrolysable tannins'],
    correctIndex: 1,
    explanation: 'Keller-Killiani test (glacial acetic acid + FeCl3 + conc. H2SO4) produces a reddish-brown ring turning bluish-green due to digitoxose (a 2-deoxysugar).',
  },
];
