import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2, Sparkles, AlertCircle, CheckCircle2, Mic, Download, IndianRupee, Clock, BarChart3, Layers, ShoppingBag, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore, ScanResult } from '@/store/useAppStore';
import { api } from '@/lib/api';

const CROP_TYPES = ['Rice', 'Wheat', 'Tomato', 'Potato', 'Cotton', 'Maize', 'Sugarcane', 'Other'];
const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Central India', 'Other'];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cropType, setCropType] = useState('');
  const [region, setRegion] = useState('');
  const { addScan, userRole, token, fetchHistory } = useAppStore();

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const isFarmer = userRole === 'farmer';
  const processingSteps = isFarmer
    ? ['Reading image...', 'Detecting disease...', 'Preparing treatment...', 'Done!']
    : ['Preprocessing image...', 'Running AI model...', 'Analyzing compounds...', 'Generating report...'];

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file || !preview) return;
    setIsProcessing(true);
    setProcessingStep(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate steps while waiting for real API
      const stepTimer = setInterval(() => {
        setProcessingStep(prev => (prev < processingSteps.length - 2 ? prev + 1 : prev));
      }, 1000);

      const response = await api.post<any>('/detection/analyze', formData);
      clearInterval(stepTimer);
      setProcessingStep(processingSteps.length - 1);
      await new Promise(r => setTimeout(r, 500));

      const scan: ScanResult = {
        id: response.id,
        imageUrl: preview, // Or response.image_url if implemented
        diseaseName: response.detected_disease,
        confidence: response.confidence * 100,
        severity: response.severity?.toLowerCase() as any || 'low',
        treatments: response.treatments || [],
        cosmeticInsights: [], // Map if available in backend
        explanation: response.explanation || '',
        createdAt: response.created_at,
        cropType: cropType || undefined,
        region: region || undefined,
        farmerTreatments: response.farmer_treatments ? {
          homeRemedies: response.farmer_treatments.home_remedies,
          fertilizers: response.farmer_treatments.fertilizers,
          pesticides: response.farmer_treatments.pesticides,
          urgency: response.farmer_treatments.urgency,
          recoveryTime: response.farmer_treatments.recovery_time,
        } : undefined,
        scientistData: response.scientist_data ? {
          probabilities: response.scientist_data.probabilities,
          featureImportance: response.scientist_data.feature_importance,
          classificationHierarchy: response.scientist_data.classification_hierarchy,
          datasetRef: response.scientist_data.dataset_ref,
          chemicalComposition: response.scientist_data.chemical_composition,
        } : undefined,
      };

      addScan(scan);
      setResult(scan);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      const message = error.message || 'Please make sure the backend is running.';
      alert(`Analysis failed: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => { setFile(null); setPreview(null); setResult(null); };

  const severityColor = (s: string) =>
    s === 'low' ? 'text-success bg-success/10' :
    s === 'medium' ? 'text-warning bg-warning/10' :
    'text-destructive bg-destructive/10';

  const urgencyDisplay = (u: string) =>
    u === 'immediate' ? { label: '🔴 Immediate Action Needed', cls: 'text-destructive bg-destructive/10' } :
    u === 'soon' ? { label: '🟡 Action Needed Soon', cls: 'text-warning bg-warning/10' } :
    { label: '🟢 Monitor & Maintain', cls: 'text-success bg-success/10' };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {isFarmer ? (
              <>Crop <span className="gradient-text">Scanner</span></>
            ) : (
              <>AI <span className="gradient-text">Plant Scanner</span></>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isFarmer
              ? 'Take or upload a photo of your crop leaf. We\'ll tell you what\'s wrong and how to fix it.'
              : 'Upload a clear leaf image for instant disease detection and cosmetic insights.'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {!preview ? (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input id="file-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Upload className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{isFarmer ? 'Upload crop photo' : 'Drop your image here'}</h3>
                    <p className="text-muted-foreground text-sm mb-4">or click to browse — PNG, JPG up to 10MB</p>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-accent px-3 py-1.5 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {isFarmer ? 'Tip: Take a close-up photo of the affected leaf' : 'Tip: Use a clear, well-lit photo for best results'}
                    </div>
                  </div>

                  {/* Farmer voice + crop/region selection */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Crop Type</label>
                      <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select crop...</option>
                        {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Region</label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select region...</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {isFarmer && (
                    <button className="glass rounded-xl px-5 py-3 flex items-center gap-3 text-sm font-medium hover:bg-accent/50 transition-colors w-full justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                      Tap to describe your problem (Voice)
                    </button>
                  )}
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 space-y-6">
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded-xl bg-muted/50" />
                    <button onClick={clearFile} className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file?.name}</p>
                        <p className="text-xs text-muted-foreground">{file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</p>
                      </div>
                    </div>
                    <button onClick={handleAnalyze} disabled={isProcessing} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-70 hover:opacity-95 transition-opacity shadow-lg">
                      {isProcessing ? (<><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>) : (<><Sparkles className="w-4 h-4" />{isFarmer ? 'Check My Crop' : 'Analyze with AI'}</>)}
                    </button>
                  </div>
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2 border-t border-border/50">
                      {processingSteps.map((step, i) => (
                        <div key={step} className={`flex items-center gap-3 text-sm py-1.5 transition-all ${i <= processingStep ? 'opacity-100' : 'opacity-30'}`}>
                          {i < processingStep ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : i === processingStep ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />}
                          <span className={i <= processingStep ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${severityColor(result.severity)}`}>
                      {result.severity.toUpperCase()} RISK
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Analysis complete</span>
                  </div>
                  <button onClick={clearFile} className="text-sm text-muted-foreground hover:text-foreground transition-colors">New Scan →</button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <img src={result.imageUrl} alt="Scanned" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Detected Condition</p>
                      <h2 className="text-2xl font-extrabold">{result.diseaseName}</h2>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{isFarmer ? 'Confidence' : 'Model Confidence'}</span>
                        {isFarmer ? (
                          <span className={`font-bold ${result.confidence >= 90 ? 'text-success' : result.confidence >= 70 ? 'text-warning' : 'text-destructive'}`}>
                            {result.confidence >= 90 ? 'High' : result.confidence >= 70 ? 'Medium' : 'Low'}
                          </span>
                        ) : (
                          <span className="font-bold text-primary">{Number(result.confidence).toFixed(2)}%</span>
                        )}
                      </div>
                      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full gradient-primary" />
                      </div>
                    </div>
                    {isFarmer && result.farmerTreatments && (
                      <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${urgencyDisplay(result.farmerTreatments.urgency).cls}`}>
                        {urgencyDisplay(result.farmerTreatments.urgency).label}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farmer View */}
              {isFarmer && result.farmerTreatments && (
                <>
                  {/* Action Steps */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      What to Do
                    </h3>
                    <div className="space-y-4">
                      {result.farmerTreatments.homeRemedies.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">🏠 Home Remedies</p>
                          {result.farmerTreatments.homeRemedies.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 mb-2">
                              <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">{i + 1}</span>
                              <p className="text-sm">{r}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.farmerTreatments.pesticides.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">🧴 Pesticides</p>
                          {result.farmerTreatments.pesticides.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-accent/50 mb-2">
                              <div>
                                <p className="text-sm font-medium">{p.name}</p>
                                <p className="text-xs text-muted-foreground">Dosage: {p.dosage}</p>
                              </div>
                              <span className="text-sm font-semibold text-primary flex items-center gap-1"><IndianRupee className="w-3 h-3" />{p.cost.replace('₹', '')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.farmerTreatments.fertilizers.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">🌿 Fertilizers</p>
                          {result.farmerTreatments.fertilizers.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-accent/50 mb-2">
                              <div>
                                <p className="text-sm font-medium">{f.name}</p>
                                <p className="text-xs text-muted-foreground">Dosage: {f.dosage}</p>
                              </div>
                              <span className="text-sm font-semibold text-primary flex items-center gap-1"><IndianRupee className="w-3 h-3" />{f.cost.replace('₹', '')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                       <Link to="/marketplace" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all">
                         <ShoppingBag className="w-4 h-4" />
                         Buy Recommended Products
                       </Link>
                       <Link 
                         to="/chat" 
                         state={{ context: `I just scanned my crop and found ${result.diseaseName}. Can you give me more details on the ${result.farmerTreatments.urgency} action plan?` }}
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border-primary/20 text-primary font-bold text-sm shadow-sm hover:shadow-md transition-all"
                       >
                         <MessageSquare className="w-4 h-4" />
                         Consult Expert AI
                       </Link>
                       <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2"><Clock className="w-4 h-4" /> Recovery: {result.farmerTreatments.recoveryTime}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Scientist View */}
              {!isFarmer && (
                <>
                  {/* AI Explanation */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <h3 className="font-bold text-lg">Why This Result?</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">{result.explanation}</p>
                  </div>

                  {/* Probability Distribution */}
                  {result.scientistData && (
                    <div className="glass rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Probability Distribution</h3>
                      </div>
                      <div className="space-y-3">
                        {result.scientistData?.probabilities?.map((p) => (
                          <div key={p.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{p.label}</span>
                              <span className="font-semibold">{p.value}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full gradient-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Importance */}
                  {result.scientistData && (
                    <div className="glass rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-secondary" />
                        <h3 className="font-bold text-lg">Feature Importance (Mock Heatmap)</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {result.scientistData?.featureImportance?.map((f) => (
                          <div key={f.feature} className="p-3 rounded-xl bg-accent/50">
                            <p className="text-sm font-medium">{f.feature}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full gradient-secondary" style={{ width: `${f.importance * 100}%` }} />
                              </div>
                              <span className="text-xs font-semibold">{(f.importance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Classification & Dataset */}
                  {result.scientistData && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="glass rounded-2xl p-6">
                        <h3 className="font-bold text-sm mb-3">Classification Hierarchy</h3>
                        <div className="flex flex-wrap gap-1">
                          {result.scientistData?.classificationHierarchy?.map((c, i) => (
                            <span key={c} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground font-medium">
                              {i > 0 && '→ '}{c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="glass rounded-2xl p-6">
                        <h3 className="font-bold text-sm mb-3">Dataset Reference</h3>
                        <p className="text-sm text-muted-foreground">{result.scientistData.datasetRef}</p>
                      </div>
                    </div>
                  )}

                  {/* Chemical Composition */}
                  {result.scientistData && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4">Chemical Composition</h3>
                      <div className="space-y-2">
                        {result.scientistData?.chemicalComposition?.map((c) => (
                          <div key={c.compound} className="flex items-center justify-between p-3 rounded-xl bg-accent/50">
                            <span className="text-sm font-medium">{c.compound}</span>
                            <span className="text-sm font-semibold text-primary">{c.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Treatment Plan</h3>
                    </div>
                    <div className="space-y-3">
                      {result.treatments.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                          <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cosmetic Insights */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        <h3 className="font-bold text-lg">Cosmetic & Biochemical Insights</h3>
                      </div>
                      <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                        <Download className="w-3 h-3" /> Export CSV
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {result.cosmeticInsights?.map((c, i) => (
                        <div key={i} className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                          <p className="font-semibold text-sm">{c.compound}</p>
                          <p className="text-xs text-muted-foreground mt-1">{c.useCase}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
