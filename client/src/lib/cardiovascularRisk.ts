/**
 * Cardiovascular Risk Calculator — Core Logic
 * Design: "Saúde Humanizada" — Warm Clinical
 * 
 * Based on:
 * - ACC/AHA 2013 Pooled Cohort Equations (ASCVD)
 * - CAC Score risk stratification (JACC 2023)
 * - ApoA-I risk modifiers
 * - Brazilian Cardiovascular Prevention Guidelines 2019
 */

export interface CardioRiskInput {
  // Demographics
  age: number;
  gender: 'male' | 'female';
  race: 'white' | 'black' | 'other';
  
  // Anthropometrics
  heightCm: number;
  weightKg: number;
  
  // Lipid panel
  totalCholesterol: number; // mg/dL
  hdl: number; // mg/dL
  ldl: number; // mg/dL
  triglycerides: number; // mg/dL
  
  // Vital signs
  systolicBP: number; // mmHg
  onBPTreatment: boolean;
  
  // Clinical conditions
  hasDiabetes: boolean;
  hasFamilyHistory: boolean; // premature CVD in 1st degree relative
  hasCKD: boolean; // chronic kidney disease
  
  // Advanced biomarkers
  calciumScore: number; // CAC score (Agatston)
  calciumScoreKnown: boolean;
  apoA1: number | null; // mg/dL — null = unknown
  hsCRP: number | null; // mg/L — null = unknown
  
  // Lifestyle
  isSmoker: boolean;
  exerciseMinutesPerWeek: number;
  consumesAlcohol: boolean; // regular consumption
}

export interface CardioRiskResult {
  baseRisk10yr: number; // percentage
  adjustedRisk10yr: number; // percentage after modifiers
  riskCategory: 'low' | 'borderline' | 'intermediate' | 'high';
  riskLabel: string;
  riskColor: string;
  bmi: number;
  bmiCategory: string;
  nonHDL: number;
  ldlCategory: string;
  hdlCategory: string;
  modifiers: RiskModifier[];
  recommendations: Recommendation[];
  factorBreakdown: FactorScore[];
}

export interface RiskModifier {
  name: string;
  impact: 'increases' | 'decreases' | 'neutral';
  description: string;
  magnitude: 'low' | 'moderate' | 'high';
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  text: string;
  icon: string;
}

export interface FactorScore {
  name: string;
  score: number; // 0-100 scale for visualization
  status: 'good' | 'borderline' | 'poor';
  value: string;
  reference: string;
}

// ─── Pooled Cohort Equations (ACC/AHA 2013) ───────────────────────────────────

function pooledCohortEquations(input: CardioRiskInput): number {
  const { age, gender, race, totalCholesterol, hdl, systolicBP, onBPTreatment, hasDiabetes, isSmoker } = input;

  const lnAge = Math.log(age);
  const lnTC = Math.log(totalCholesterol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(systolicBP);
  const smoker = isSmoker ? 1 : 0;
  const diabetes = hasDiabetes ? 1 : 0;
  const bpTreat = onBPTreatment ? 1 : 0;

  let sum = 0;
  let baselineSurvival = 0;
  let meanCoeffSum = 0;

  if (gender === 'male' && race === 'black') {
    sum =
      2.469 * lnAge +
      0.302 * lnTC +
      (-0.307) * lnHDL +
      1.916 * lnSBP * bpTreat +
      1.809 * lnSBP * (1 - bpTreat) +
      0.549 * smoker +
      0.645 * diabetes;
    baselineSurvival = 0.8954;
    meanCoeffSum = 19.54;
  } else if (gender === 'male') {
    // White/other male
    sum =
      12.344 * lnAge +
      11.853 * lnTC +
      (-2.664) * lnAge * lnTC +
      (-7.99) * lnHDL +
      1.769 * lnAge * lnHDL +
      1.797 * lnSBP * bpTreat +
      1.764 * lnSBP * (1 - bpTreat) +
      7.837 * smoker +
      (-1.795) * lnAge * smoker +
      0.661 * diabetes;
    baselineSurvival = 0.9144;
    meanCoeffSum = 61.18;
  } else if (gender === 'female' && race === 'black') {
    sum =
      17.1141 * lnAge +
      0.9396 * lnTC +
      (-18.9196) * lnHDL +
      4.4748 * lnAge * lnHDL +
      29.2907 * lnSBP * bpTreat +
      (-6.4321) * lnAge * lnSBP * bpTreat +
      27.8197 * lnSBP * (1 - bpTreat) +
      (-6.0873) * lnAge * lnSBP * (1 - bpTreat) +
      0.8738 * smoker +
      0.8738 * diabetes;
    baselineSurvival = 0.9533;
    meanCoeffSum = 86.61;
  } else {
    // White/other female
    sum =
      (-7.574) * lnAge +
      (-13.095) * lnTC +
      3.114 * lnAge * lnTC +
      (-5.119) * lnHDL +
      1.084 * lnAge * lnHDL +
      2.019 * lnSBP * bpTreat +
      (-0.549) * lnAge * lnSBP * bpTreat +
      1.957 * lnSBP * (1 - bpTreat) +
      (-0.479) * lnAge * lnSBP * (1 - bpTreat) +
      7.574 * smoker +
      (-1.665) * lnAge * smoker +
      0.661 * diabetes;
    baselineSurvival = 0.9665;
    meanCoeffSum = (-29.799);
  }

  const risk = 1 - Math.pow(baselineSurvival, Math.exp(sum - meanCoeffSum));
  return Math.min(Math.max(risk * 100, 0.5), 99.9);
}

// ─── BMI Calculation ──────────────────────────────────────────────────────────

export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

// ─── Risk Modifiers ───────────────────────────────────────────────────────────

function applyRiskModifiers(baseRisk: number, input: CardioRiskInput): { adjustedRisk: number; modifiers: RiskModifier[] } {
  let adjustedRisk = baseRisk;
  const modifiers: RiskModifier[] = [];

  // CAC Score
  if (input.calciumScoreKnown) {
    if (input.calciumScore === 0) {
      adjustedRisk *= 0.65; // CAC=0 is a strong negative predictor
      modifiers.push({
        name: 'Score de Cálcio = 0',
        impact: 'decreases',
        description: 'Score de Cálcio zero indica ausência de aterosclerose calcificada, reduzindo significativamente o risco.',
        magnitude: 'high',
      });
    } else if (input.calciumScore >= 1 && input.calciumScore <= 99) {
      adjustedRisk *= 1.25;
      modifiers.push({
        name: `Score de Cálcio: ${input.calciumScore}`,
        impact: 'increases',
        description: 'Presença de calcificação coronariana leve a moderada confirma risco aumentado.',
        magnitude: 'moderate',
      });
    } else if (input.calciumScore >= 100 && input.calciumScore <= 399) {
      adjustedRisk *= 1.6;
      modifiers.push({
        name: `Score de Cálcio: ${input.calciumScore}`,
        impact: 'increases',
        description: 'Score de Cálcio ≥ 100 indica aterosclerose moderada, elevando substancialmente o risco.',
        magnitude: 'high',
      });
    } else if (input.calciumScore >= 400) {
      adjustedRisk *= 2.1;
      modifiers.push({
        name: `Score de Cálcio: ${input.calciumScore}`,
        impact: 'increases',
        description: 'Score de Cálcio ≥ 400 indica aterosclerose extensa, associada a risco muito elevado.',
        magnitude: 'high',
      });
    }
  }

  // ApoA-I
  if (input.apoA1 !== null) {
    const normalApoA1 = input.gender === 'male' ? 120 : 140;
    if (input.apoA1 < normalApoA1 * 0.8) {
      adjustedRisk *= 1.2;
      modifiers.push({
        name: `Apolipoproteína A-I baixa (${input.apoA1} mg/dL)`,
        impact: 'increases',
        description: 'Níveis baixos de ApoA-I reduzem a capacidade de transporte reverso do colesterol, aumentando o risco.',
        magnitude: 'moderate',
      });
    } else if (input.apoA1 > normalApoA1 * 1.2) {
      adjustedRisk *= 0.9;
      modifiers.push({
        name: `Apolipoproteína A-I elevada (${input.apoA1} mg/dL)`,
        impact: 'decreases',
        description: 'Níveis elevados de ApoA-I estão associados a maior proteção cardiovascular.',
        magnitude: 'low',
      });
    }
  }

  // BMI / Obesity
  const bmi = calculateBMI(input.heightCm, input.weightKg);
  if (bmi >= 30) {
    const factor = bmi >= 35 ? 1.2 : 1.1;
    adjustedRisk *= factor;
    modifiers.push({
      name: `Obesidade (IMC: ${bmi.toFixed(1)} kg/m²)`,
      impact: 'increases',
      description: 'Obesidade está associada a resistência insulínica, hipertensão e dislipidemia, elevando o risco cardiovascular.',
      magnitude: bmi >= 35 ? 'high' : 'moderate',
    });
  } else if (bmi >= 25 && bmi < 30) {
    adjustedRisk *= 1.05;
    modifiers.push({
      name: `Sobrepeso (IMC: ${bmi.toFixed(1)} kg/m²)`,
      impact: 'increases',
      description: 'Sobrepeso contribui modestamente para o risco cardiovascular.',
      magnitude: 'low',
    });
  }

  // Exercise
  if (input.exerciseMinutesPerWeek >= 150) {
    const factor = input.exerciseMinutesPerWeek >= 300 ? 0.75 : 0.85;
    adjustedRisk *= factor;
    modifiers.push({
      name: `Atividade física adequada (${input.exerciseMinutesPerWeek} min/sem)`,
      impact: 'decreases',
      description: 'Exercício regular ≥ 150 min/semana reduz significativamente o risco cardiovascular.',
      magnitude: input.exerciseMinutesPerWeek >= 300 ? 'high' : 'moderate',
    });
  } else if (input.exerciseMinutesPerWeek < 60) {
    adjustedRisk *= 1.15;
    modifiers.push({
      name: 'Sedentarismo',
      impact: 'increases',
      description: 'Inatividade física é um fator de risco independente para doenças cardiovasculares.',
      magnitude: 'moderate',
    });
  }

  // Alcohol
  if (input.consumesAlcohol) {
    adjustedRisk *= 1.1;
    modifiers.push({
      name: 'Consumo regular de álcool',
      impact: 'increases',
      description: 'O consumo regular de álcool aumenta a pressão arterial e o risco de arritmias.',
      magnitude: 'low',
    });
  }

  // Family history
  if (input.hasFamilyHistory) {
    adjustedRisk *= 1.3;
    modifiers.push({
      name: 'Histórico familiar de DCV prematura',
      impact: 'increases',
      description: 'Parente de 1º grau com doença cardiovascular antes dos 55 anos (homem) ou 65 anos (mulher) aumenta o risco.',
      magnitude: 'high',
    });
  }

  // CKD
  if (input.hasCKD) {
    adjustedRisk *= 1.4;
    modifiers.push({
      name: 'Doença renal crônica',
      impact: 'increases',
      description: 'A DRC é um intensificador de risco cardiovascular independente.',
      magnitude: 'high',
    });
  }

  // hsCRP
  if (input.hsCRP !== null && input.hsCRP >= 2.0) {
    adjustedRisk *= 1.15;
    modifiers.push({
      name: `PCR-us elevada (${input.hsCRP} mg/L)`,
      impact: 'increases',
      description: 'PCR-us ≥ 2 mg/L indica inflamação sistêmica, um fator de risco cardiovascular emergente.',
      magnitude: 'moderate',
    });
  }

  // LDL very high
  if (input.ldl >= 160) {
    adjustedRisk *= 1.2;
    modifiers.push({
      name: `LDL muito elevado (${input.ldl} mg/dL)`,
      impact: 'increases',
      description: 'LDL ≥ 160 mg/dL é um intensificador de risco independente.',
      magnitude: 'moderate',
    });
  }

  return { adjustedRisk: Math.min(adjustedRisk, 99.9), modifiers };
}

// ─── Risk Category ────────────────────────────────────────────────────────────

function getRiskCategory(risk: number): { category: 'low' | 'borderline' | 'intermediate' | 'high'; label: string; color: string } {
  if (risk < 5) return { category: 'low', label: 'Baixo', color: '#16a34a' };
  if (risk < 7.5) return { category: 'borderline', label: 'Limítrofe', color: '#ca8a04' };
  if (risk < 20) return { category: 'intermediate', label: 'Intermediário', color: '#ea580c' };
  return { category: 'high', label: 'Alto', color: '#dc2626' };
}

// ─── Factor Breakdown ─────────────────────────────────────────────────────────

function buildFactorBreakdown(input: CardioRiskInput): FactorScore[] {
  const factors: FactorScore[] = [];
  const bmi = calculateBMI(input.heightCm, input.weightKg);

  // LDL
  let ldlScore = 0;
  let ldlStatus: 'good' | 'borderline' | 'poor' = 'good';
  if (input.ldl < 100) { ldlScore = 90; ldlStatus = 'good'; }
  else if (input.ldl < 130) { ldlScore = 65; ldlStatus = 'borderline'; }
  else if (input.ldl < 160) { ldlScore = 40; ldlStatus = 'borderline'; }
  else { ldlScore = 15; ldlStatus = 'poor'; }
  factors.push({ name: 'LDL-Colesterol', score: ldlScore, status: ldlStatus, value: `${input.ldl} mg/dL`, reference: 'Ideal: < 100 mg/dL' });

  // HDL
  let hdlScore = 0;
  let hdlStatus: 'good' | 'borderline' | 'poor' = 'good';
  const hdlLow = input.gender === 'male' ? 40 : 50;
  if (input.hdl >= 60) { hdlScore = 90; hdlStatus = 'good'; }
  else if (input.hdl >= hdlLow) { hdlScore = 60; hdlStatus = 'borderline'; }
  else { hdlScore = 20; hdlStatus = 'poor'; }
  factors.push({ name: 'HDL-Colesterol', score: hdlScore, status: hdlStatus, value: `${input.hdl} mg/dL`, reference: `Ideal: ≥ ${input.gender === 'male' ? '40' : '50'} mg/dL` });

  // Blood pressure
  let bpScore = 0;
  let bpStatus: 'good' | 'borderline' | 'poor' = 'good';
  if (input.systolicBP < 120) { bpScore = 90; bpStatus = 'good'; }
  else if (input.systolicBP < 130) { bpScore = 70; bpStatus = 'borderline'; }
  else if (input.systolicBP < 140) { bpScore = 45; bpStatus = 'borderline'; }
  else { bpScore = 15; bpStatus = 'poor'; }
  factors.push({ name: 'Pressão Arterial', score: bpScore, status: bpStatus, value: `${input.systolicBP} mmHg`, reference: 'Ideal: < 120 mmHg' });

  // BMI
  let bmiScore = 0;
  let bmiStatus: 'good' | 'borderline' | 'poor' = 'good';
  if (bmi < 25) { bmiScore = 90; bmiStatus = 'good'; }
  else if (bmi < 30) { bmiScore = 55; bmiStatus = 'borderline'; }
  else { bmiScore = 20; bmiStatus = 'poor'; }
  factors.push({ name: 'IMC', score: bmiScore, status: bmiStatus, value: `${bmi.toFixed(1)} kg/m²`, reference: 'Ideal: 18.5–24.9 kg/m²' });

  // Exercise
  let exScore = 0;
  let exStatus: 'good' | 'borderline' | 'poor' = 'good';
  if (input.exerciseMinutesPerWeek >= 150) { exScore = 85; exStatus = 'good'; }
  else if (input.exerciseMinutesPerWeek >= 60) { exScore = 50; exStatus = 'borderline'; }
  else { exScore = 15; exStatus = 'poor'; }
  factors.push({ name: 'Atividade Física', score: exScore, status: exStatus, value: `${input.exerciseMinutesPerWeek} min/sem`, reference: 'Ideal: ≥ 150 min/semana' });

  // Smoking
  factors.push({ name: 'Tabagismo', score: input.isSmoker ? 5 : 95, status: input.isSmoker ? 'poor' : 'good', value: input.isSmoker ? 'Fumante' : 'Não fumante', reference: 'Ideal: Não fumante' });

  // CAC
  if (input.calciumScoreKnown) {
    let cacScore = 0;
    let cacStatus: 'good' | 'borderline' | 'poor' = 'good';
    if (input.calciumScore === 0) { cacScore = 95; cacStatus = 'good'; }
    else if (input.calciumScore < 100) { cacScore = 50; cacStatus = 'borderline'; }
    else if (input.calciumScore < 400) { cacScore = 25; cacStatus = 'poor'; }
    else { cacScore = 5; cacStatus = 'poor'; }
    factors.push({ name: 'Score de Cálcio', score: cacScore, status: cacStatus, value: `${input.calciumScore}`, reference: 'Ideal: 0 (ausente)' });
  }

  return factors;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function buildRecommendations(input: CardioRiskInput, result: { adjustedRisk: number; riskCategory: string }): Recommendation[] {
  const recs: Recommendation[] = [];
  const bmi = calculateBMI(input.heightCm, input.weightKg);

  if (input.isSmoker) {
    recs.push({ priority: 'high', category: 'Tabagismo', text: 'Cessação do tabagismo é a intervenção isolada de maior impacto na redução do risco cardiovascular. Busque apoio médico para programas de cessação.', icon: '🚭' });
  }

  if (input.ldl >= 130 || (result.riskCategory === 'high' && input.ldl >= 100)) {
    recs.push({ priority: 'high', category: 'Colesterol LDL', text: `Seu LDL de ${input.ldl} mg/dL está acima do ideal para seu perfil de risco. Avalie com seu médico a necessidade de estatinas e/ou mudanças dietéticas.`, icon: '💊' });
  }

  if (input.systolicBP >= 130) {
    recs.push({ priority: 'high', category: 'Pressão Arterial', text: `Pressão sistólica de ${input.systolicBP} mmHg requer atenção. Reduza o consumo de sódio, pratique exercícios e consulte seu médico sobre tratamento.`, icon: '🩺' });
  }

  if (input.exerciseMinutesPerWeek < 150) {
    recs.push({ priority: 'medium', category: 'Atividade Física', text: `Você realiza ${input.exerciseMinutesPerWeek} min/semana de exercício. A meta é ≥ 150 min/semana de atividade moderada. Comece gradualmente com caminhadas.`, icon: '🏃' });
  }

  if (bmi >= 25) {
    recs.push({ priority: 'medium', category: 'Peso Corporal', text: `IMC de ${bmi.toFixed(1)} kg/m² indica ${getBMICategory(bmi)}. Perda de 5-10% do peso reduz significativamente o risco cardiovascular.`, icon: '⚖️' });
  }

  if (input.consumesAlcohol) {
    recs.push({ priority: 'medium', category: 'Álcool', text: 'Reduza ou elimine o consumo de álcool. Não há quantidade segura de álcool para a saúde cardiovascular.', icon: '🍷' });
  }

  if (input.hasDiabetes) {
    recs.push({ priority: 'high', category: 'Diabetes', text: 'Controle rigoroso da glicemia é fundamental. Mantenha HbA1c < 7% e consulte seu endocrinologista regularmente.', icon: '🩸' });
  }

  if (!input.calciumScoreKnown && result.riskCategory === 'intermediate') {
    recs.push({ priority: 'medium', category: 'Score de Cálcio', text: 'Para pacientes com risco intermediário, o Score de Cálcio Coronariano pode refinar a estratificação e guiar decisões terapêuticas.', icon: '🔬' });
  }

  if (input.hdl < (input.gender === 'male' ? 40 : 50)) {
    recs.push({ priority: 'medium', category: 'HDL Baixo', text: `HDL de ${input.hdl} mg/dL está abaixo do ideal. Exercício aeróbico regular e cessação do tabagismo são as melhores formas de elevar o HDL.`, icon: '📈' });
  }

  // General recommendation always
  recs.push({ priority: 'low', category: 'Acompanhamento', text: 'Realize consultas médicas regulares e exames laboratoriais anuais para monitoramento do perfil lipídico e outros fatores de risco.', icon: '📋' });

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculateCardioRisk(input: CardioRiskInput): CardioRiskResult {
  const baseRisk = pooledCohortEquations(input);
  const { adjustedRisk, modifiers } = applyRiskModifiers(baseRisk, input);
  const { category, label, color } = getRiskCategory(adjustedRisk);
  const bmi = calculateBMI(input.heightCm, input.weightKg);
  const nonHDL = input.totalCholesterol - input.hdl;

  // LDL category
  let ldlCategory = '';
  if (input.ldl < 70) ldlCategory = 'Ótimo';
  else if (input.ldl < 100) ldlCategory = 'Desejável';
  else if (input.ldl < 130) ldlCategory = 'Limítrofe alto';
  else if (input.ldl < 160) ldlCategory = 'Alto';
  else ldlCategory = 'Muito alto';

  // HDL category
  let hdlCategory = '';
  const hdlLow = input.gender === 'male' ? 40 : 50;
  if (input.hdl >= 60) hdlCategory = 'Protetor';
  else if (input.hdl >= hdlLow) hdlCategory = 'Normal';
  else hdlCategory = 'Baixo (fator de risco)';

  const factorBreakdown = buildFactorBreakdown(input);
  const recommendations = buildRecommendations(input, { adjustedRisk, riskCategory: category });

  return {
    baseRisk10yr: Math.round(baseRisk * 10) / 10,
    adjustedRisk10yr: Math.round(adjustedRisk * 10) / 10,
    riskCategory: category,
    riskLabel: label,
    riskColor: color,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBMICategory(bmi),
    nonHDL,
    ldlCategory,
    hdlCategory,
    modifiers,
    recommendations,
    factorBreakdown,
  };
}

export function getDefaultApoA1(gender: 'male' | 'female'): number {
  // Default to the lower bound of normal range (minimum risk)
  return gender === 'male' ? 120 : 140;
}
