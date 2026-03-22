/**
 * Home Page — Cardiovascular Risk Calculator
 * Design: "Saúde Humanizada" — Warm Clinical
 * 
 * Layout: Asymmetric split — Form (left, 55%) + Results (right, 45%)
 * Colors: Burgundy primary (#8b1a4a), warm beige background, coral alerts
 * Typography: Playfair Display for headings, DM Sans for body
 */

import { useState, useCallback } from 'react';
import { calculateCardioRisk, getDefaultApoA1, type CardioRiskInput, type CardioRiskResult } from '@/lib/cardiovascularRisk';
import { RiskGauge } from '@/components/RiskGauge';
import { FactorRadarChart } from '@/components/FactorRadarChart';
import { RiskModifiersList } from '@/components/RiskModifiersList';
import { RecommendationsList } from '@/components/RecommendationsList';
import { FormSection } from '@/components/FormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Heart, ChevronDown, ChevronUp, Activity, BarChart3, AlertCircle, Printer, Share2, RefreshCw } from 'lucide-react';

const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663391132540/3i7hXpLtKVzLhi8b9JviLs/hero-heart-health-HSjnyqDybbdySViPPmed3V.webp';

const defaultInput: CardioRiskInput = {
  age: 50,
  gender: 'male',
  race: 'white',
  heightCm: 170,
  weightKg: 75,
  totalCholesterol: 200,
  hdl: 50,
  ldl: 130,
  triglycerides: 150,
  systolicBP: 125,
  onBPTreatment: false,
  hasDiabetes: false,
  hasFamilyHistory: false,
  hasCKD: false,
  calciumScore: 0,
  calciumScoreKnown: false,
  apoA1: null,
  hsCRP: null,
  isSmoker: false,
  exerciseMinutesPerWeek: 120,
  consumesAlcohol: false,
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help ml-1 inline-block" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function NumericInput({ label, value, onChange, min, max, unit, tooltip, step = 1 }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
  tooltip?: string;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const inputValue = e.target.value.trim();
            if (inputValue === '' || inputValue === '-') {
              onChange(min);
              return;
            }
            const v = parseFloat(inputValue);
            if (!isNaN(v)) {
              const clampedValue = Math.min(max, Math.max(min, v));
              onChange(clampedValue);
            }
          }}
          className="pr-12 bg-white border-border/60 focus:border-primary/50 focus:ring-primary/20 text-sm"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleGroup({ label, value, onChange, options, tooltip }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </Label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-white text-foreground/70 border-border/60 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwitchField({ label, value, onChange, tooltip }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white border border-border/40 hover:border-border/70 transition-colors">
      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1 cursor-pointer">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState<CardioRiskInput>(defaultInput);
  const [result, setResult] = useState<CardioRiskResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'modifiers' | 'recommendations'>('overview');
  const [hasCalculated, setHasCalculated] = useState(false);

  const update = useCallback(<K extends keyof CardioRiskInput>(key: K, value: CardioRiskInput[K]) => {
    setInput(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    const inputWithDefaults: CardioRiskInput = {
      ...input,
      apoA1: input.apoA1 ?? getDefaultApoA1(input.gender),
    };
    const r = calculateCardioRisk(inputWithDefaults);
    setResult(r);
    setHasCalculated(true);
    setActiveTab('overview');
    // Scroll to results on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [input]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
    setInput(defaultInput);
    setResult(null);
    setHasCalculated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const riskBgClass = result
    ? result.riskCategory === 'low' ? 'from-emerald-50 to-green-50 border-emerald-200'
    : result.riskCategory === 'borderline' ? 'from-amber-50 to-yellow-50 border-amber-200'
    : result.riskCategory === 'intermediate' ? 'from-orange-50 to-amber-50 border-orange-200'
    : 'from-red-50 to-rose-50 border-red-200'
    : '';

  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.98 0.005 60)' }}>
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.38 0.12 0)' }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Calculadora de Risco Cardiovascular
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Baseada nas Equações de Coorte Agrupadas ACC/AHA 2013</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Saúde cardiovascular"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, oklch(0.98 0.005 60 / 0.95) 0%, oklch(0.98 0.005 60 / 0.85) 40%, oklch(0.98 0.005 60 / 0.3) 100%)' }} />
        </div>
        <div className="relative container py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: 'oklch(0.38 0.12 0 / 0.1)', color: 'oklch(0.38 0.12 0)' }}>
              <Activity className="w-3.5 h-3.5" />
              Avaliação Clínica Validada
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Avalie seu risco<br />
              <span style={{ color: 'oklch(0.38 0.12 0)' }}>cardiovascular</span> em 10 anos
            </h2>
            <p className="text-base text-foreground/70 leading-relaxed">
              Preencha os dados abaixo para obter uma estimativa personalizada do seu risco de infarto, AVC ou morte cardiovascular, com base em indicadores clínicos validados.
            </p>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Esta calculadora é uma ferramenta educacional. Consulte sempre um médico para avaliação clínica.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* ── Form Column ── */}
          <div className="space-y-5">
            
            {/* Demographics */}
            <FormSection title="Dados Pessoais" icon="👤" defaultOpen>
              <div className="grid grid-cols-2 gap-4">
                <NumericInput label="Idade" value={input.age} onChange={v => update('age', v)} min={30} max={79} unit="anos" tooltip="Idade entre 30 e 79 anos. O modelo ASCVD foi validado para esta faixa etária." />
                <ToggleGroup label="Gênero" value={input.gender} onChange={v => update('gender', v as 'male' | 'female')} options={[{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Feminino' }]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumericInput label="Altura" value={input.heightCm} onChange={v => update('heightCm', v)} min={140} max={220} unit="cm" />
                <NumericInput label="Peso" value={input.weightKg} onChange={v => update('weightKg', v)} min={30} max={200} unit="kg" step={0.1} />
              </div>
              <ToggleGroup
                label="Etnia"
                value={input.race}
                onChange={v => update('race', v as 'white' | 'black' | 'other')}
                options={[{ value: 'white', label: 'Branca/Outra' }, { value: 'black', label: 'Negra' }]}
                tooltip="A etnia afeta os coeficientes das equações de risco. Selecione a que melhor representa sua origem."
              />
            </FormSection>

            {/* Lipid Panel */}
            <FormSection title="Perfil Lipídico" icon="🧪" defaultOpen>
              <div className="grid grid-cols-2 gap-4">
                <NumericInput label="Colesterol Total" value={input.totalCholesterol} onChange={v => update('totalCholesterol', v)} min={100} max={400} unit="mg/dL" tooltip="Colesterol total em jejum. Inclui HDL, LDL e VLDL." />
                <NumericInput label="HDL-Colesterol" value={input.hdl} onChange={v => update('hdl', v)} min={20} max={100} unit="mg/dL" tooltip="Colesterol 'bom'. Valores altos são protetores. Ideal: ≥ 60 mg/dL." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumericInput label="LDL-Colesterol" value={input.ldl} onChange={v => update('ldl', v)} min={30} max={300} unit="mg/dL" tooltip="Colesterol 'ruim'. Principal alvo terapêutico. Ideal: < 100 mg/dL." />
                <NumericInput label="Triglicerídeos" value={input.triglycerides} onChange={v => update('triglycerides', v)} min={30} max={1000} unit="mg/dL" tooltip="Ideal: < 150 mg/dL. Valores elevados indicam risco metabólico." />
              </div>
            </FormSection>

            {/* Blood Pressure */}
            <FormSection title="Pressão Arterial" icon="💓" defaultOpen>
              <NumericInput
                label="Pressão Sistólica"
                value={input.systolicBP}
                onChange={v => update('systolicBP', v)}
                min={80}
                max={220}
                unit="mmHg"
                tooltip="Primeiro número da medição de pressão arterial. Ex: 120/80 mmHg → sistólica = 120."
              />
              <SwitchField
                label="Em tratamento para hipertensão"
                value={input.onBPTreatment}
                onChange={v => update('onBPTreatment', v)}
                tooltip="Uso atual de medicamentos anti-hipertensivos (mesmo que a pressão esteja controlada)."
              />
            </FormSection>

            {/* Lifestyle */}
            <FormSection title="Hábitos de Vida" icon="🏃" defaultOpen>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
                  Exercício físico por semana
                  <InfoTooltip text="Inclua caminhadas, corrida, natação, academia, ciclismo, etc. A OMS recomenda ≥ 150 min/semana de atividade moderada." />
                </Label>
                <div className="px-1">
                  <Slider
                    value={[input.exerciseMinutesPerWeek]}
                    onValueChange={([v]) => update('exerciseMinutesPerWeek', v)}
                    min={0}
                    max={600}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>0 min</span>
                    <span className="font-semibold" style={{ color: input.exerciseMinutesPerWeek >= 150 ? '#16a34a' : '#ea580c' }}>
                      {input.exerciseMinutesPerWeek} min/semana
                    </span>
                    <span>600 min</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-1">
                <SwitchField label="Fumante" value={input.isSmoker} onChange={v => update('isSmoker', v)} tooltip="Fumante atual (cigarro, charuto, cachimbo, cigarro eletrônico)." />
                <SwitchField label="Consumo regular de álcool" value={input.consumesAlcohol} onChange={v => update('consumesAlcohol', v)} tooltip="Consumo de bebidas alcoólicas de forma regular (≥ 3 doses/semana)." />
              </div>
            </FormSection>

            {/* Clinical Conditions */}
            <FormSection title="Condições Clínicas" icon="🩺" defaultOpen>
              <div className="grid grid-cols-1 gap-2">
                <SwitchField label="Diabetes mellitus" value={input.hasDiabetes} onChange={v => update('hasDiabetes', v)} tooltip="Diagnóstico confirmado de diabetes tipo 1 ou tipo 2." />
                <SwitchField label="Histórico familiar de DCV prematura" value={input.hasFamilyHistory} onChange={v => update('hasFamilyHistory', v)} tooltip="Parente de 1º grau (pai, mãe, irmão) com doença cardiovascular antes dos 55 anos (homem) ou 65 anos (mulher)." />
                <SwitchField label="Doença renal crônica" value={input.hasCKD} onChange={v => update('hasCKD', v)} tooltip="Diagnóstico confirmado de DRC (TFG < 60 mL/min/1,73m²)." />
              </div>
            </FormSection>

            {/* Advanced Biomarkers */}
            <div className="rounded-xl border border-border/50 overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔬</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Biomarcadores Avançados</p>
                    <p className="text-xs text-muted-foreground">Opcional — refina a estimativa de risco</p>
                  </div>
                </div>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showAdvanced && (
                <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4 animate-slide-up">
                  {/* CAC Score */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
                        Score de Cálcio Coronariano (CAC)
                        <InfoTooltip text="Escore de Agatston obtido por tomografia computadorizada sem contraste. É um dos melhores preditores de risco cardiovascular disponíveis. Se não realizou o exame, deixe marcado como 'Não sei'." />
                      </Label>
                      <Switch
                        checked={input.calciumScoreKnown}
                        onCheckedChange={v => update('calciumScoreKnown', v)}
                      />
                    </div>
                    {input.calciumScoreKnown ? (
                      <NumericInput
                        label="Valor do Score de Cálcio"
                        value={input.calciumScore}
                        onChange={v => update('calciumScore', v)}
                        min={0}
                        max={5000}
                        unit="Agatston"
                        tooltip="0 = ausente, 1-99 = leve, 100-399 = moderado, ≥ 400 = extenso."
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        Score de Cálcio não informado. Será considerado como zero (sem impacto no cálculo).
                      </p>
                    )}
                  </div>

                  {/* ApoA-I */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
                        Apolipoproteína A-I (ApoA-I)
                        <InfoTooltip text="Principal proteína do HDL. Valores normais: homens ≥ 120 mg/dL, mulheres ≥ 140 mg/dL. Se não souber, deixe em branco — será usado o valor de referência mínimo." />
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Padrão: ${getDefaultApoA1(input.gender)} mg/dL`}
                        value={input.apoA1 ?? ''}
                        min={50}
                        max={300}
                        onChange={(e) => {
                          const v = e.target.value === '' ? null : parseFloat(e.target.value);
                          update('apoA1', v);
                        }}
                        className="flex-1 bg-white border-border/60 text-sm"
                      />
                      <span className="flex items-center text-xs text-muted-foreground px-2">mg/dL</span>
                    </div>
                    {input.apoA1 === null && (
                      <p className="text-xs text-muted-foreground">
                        Não informado — será usado o valor de referência ({getDefaultApoA1(input.gender)} mg/dL).
                      </p>
                    )}
                  </div>

                  {/* hsCRP */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/80 flex items-center gap-1">
                      PCR de alta sensibilidade (PCR-us)
                      <InfoTooltip text="Marcador inflamatório. Valores ≥ 2 mg/L indicam risco aumentado. Opcional." />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Opcional"
                        value={input.hsCRP ?? ''}
                        min={0}
                        max={100}
                        step={0.1}
                        onChange={(e) => {
                          const v = e.target.value === '' ? null : parseFloat(e.target.value);
                          update('hsCRP', v);
                        }}
                        className="flex-1 bg-white border-border/60 text-sm"
                      />
                      <span className="flex items-center text-xs text-muted-foreground px-2">mg/L</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              size="lg"
              className="w-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'oklch(0.38 0.12 0)', color: 'white' }}
            >
              <Heart className="w-5 h-5 mr-2" />
              Calcular Risco Cardiovascular
            </Button>
          </div>

          {/* ── Results Column ── */}
          <div id="results-panel" className="lg:sticky lg:top-20 space-y-4">
            {!hasCalculated ? (
              <div className="rounded-2xl border border-border/40 bg-white p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'oklch(0.38 0.12 0 / 0.08)' }}>
                  <BarChart3 className="w-8 h-8" style={{ color: 'oklch(0.38 0.12 0)' }} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Seu resultado aparecerá aqui
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preencha os dados do formulário ao lado e clique em "Calcular Risco Cardiovascular" para obter sua avaliação personalizada.
                </p>
              </div>
            ) : result && (
              <div className="animate-fade-in space-y-4">
                {/* Risk Score Card */}
                <div className={`rounded-2xl border bg-gradient-to-br p-6 shadow-sm ${riskBgClass}`}>
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-medium text-foreground/70 mb-1">Risco de Evento Cardiovascular em 10 Anos</h3>
                    <RiskGauge risk={result.adjustedRisk10yr} category={result.riskCategory} color={result.riskColor} />
                    <div className="mt-2">
                      <span className="text-4xl font-bold" style={{ color: result.riskColor, fontFamily: 'DM Sans, sans-serif' }}>
                        {result.adjustedRisk10yr.toFixed(1)}%
                      </span>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ background: result.riskColor }}>
                          Risco {result.riskLabel}
                        </span>
                      </div>
                    </div>
                    {result.baseRisk10yr !== result.adjustedRisk10yr && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Risco base (ASCVD): {result.baseRisk10yr.toFixed(1)}% → ajustado com modificadores
                      </p>
                    )}
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      { label: 'IMC', value: `${result.bmi}`, sub: result.bmiCategory.split(' ')[0] },
                      { label: 'LDL', value: `${result.ldlCategory}`, sub: `${(result as any).ldl ?? input.ldl} mg/dL` },
                      { label: 'HDL', value: `${result.hdlCategory.split(' ')[0]}`, sub: `${input.hdl} mg/dL` },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/60 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="rounded-2xl border border-border/40 bg-white shadow-sm overflow-hidden">
                  <div className="flex border-b border-border/40">
                    {([
                      { id: 'overview', label: 'Visão Geral', icon: '📊' },
                      { id: 'factors', label: 'Fatores', icon: '📈' },
                      { id: 'modifiers', label: 'Modificadores', icon: '⚡' },
                      { id: 'recommendations', label: 'Recomendações', icon: '💡' },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${
                          activeTab === tab.id
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <span className="block text-base leading-none mb-0.5">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {activeTab === 'overview' && (
                      <div className="space-y-3 animate-slide-up">
                        <h4 className="text-sm font-semibold text-foreground">Perfil de Risco por Fator</h4>
                        {result.factorBreakdown.map((factor) => (
                          <div key={factor.name} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-foreground/80">{factor.name}</span>
                              <span className="text-xs text-muted-foreground">{factor.value}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${factor.score}%`,
                                  background: factor.status === 'good' ? '#16a34a' : factor.status === 'borderline' ? '#ca8a04' : '#dc2626',
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{factor.reference}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'factors' && (
                      <div className="animate-slide-up">
                        <FactorRadarChart factors={result.factorBreakdown} />
                      </div>
                    )}

                    {activeTab === 'modifiers' && (
                      <div className="animate-slide-up">
                        <RiskModifiersList modifiers={result.modifiers} />
                      </div>
                    )}

                    {activeTab === 'recommendations' && (
                      <div className="animate-slide-up">
                        <RecommendationsList recommendations={result.recommendations} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / Salvar PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Nova Avaliação
                  </Button>
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl bg-muted/50 border border-border/30 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Aviso:</strong> Esta calculadora é uma ferramenta educacional baseada em modelos estatísticos populacionais. Não substitui a avaliação médica individualizada. Consulte sempre um cardiologista ou clínico geral para interpretação dos resultados.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-white/60 mt-12">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'oklch(0.38 0.12 0)' }}>
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground/80">Calculadora de Risco Cardiovascular</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Baseada nas Equações de Coorte Agrupadas ACC/AHA 2013 · Diretrizes Brasileiras de Prevenção Cardiovascular 2019
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
