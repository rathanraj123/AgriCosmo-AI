import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Copy, Download, Layers, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface MolecularDetails {
  canonical_smiles: string;
  inchi?: string;
  inchi_key?: string;
  molfile_2d?: string;
  molfile_3d?: string;
  formula?: string;
  exact_mass?: number;
  mw?: number;
  atom_count?: number;
  heavy_atom_count?: number;
  formal_charge?: number;
  ring_count?: number;
  rotatable_bonds?: number;
  logp?: number;
  hbd?: number;
  hba?: number;
  tpsa?: number;
  lipinski_score?: number;
  is_drug_like?: string;
  svg_2d?: string;
}

interface MoleculeViewerCardProps {
  details?: MolecularDetails;
  smiles: string;
}

export default function MoleculeViewerCard({ details, smiles }: MoleculeViewerCardProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<any>(null);
  const [viewerStyle, setViewerStyle] = useState<'stick' | 'sphere' | 'line'>('stick');
  const [viewerBg, setViewerBg] = useState<'light' | 'dark'>('dark');

  // Initialize 3D Viewer
  useEffect(() => {
    if (details?.molfile_3d && viewerRef.current && (window as any).$3Dmol && !viewerInstance) {
      const viewer = (window as any).$3Dmol.createViewer(viewerRef.current, {
        backgroundColor: viewerBg === 'dark' ? 'black' : 'white'
      });
      viewer.addModel(details.molfile_3d, 'sdf');
      viewer.setStyle({}, { [viewerStyle]: {} });
      viewer.zoomTo();
      viewer.render();
      setViewerInstance(viewer);
    }
  }, [details?.molfile_3d]);

  // Update 3D Viewer when style or background changes
  useEffect(() => {
    if (viewerInstance) {
      viewerInstance.setBackgroundColor(viewerBg === 'dark' ? 'black' : 'white');
      viewerInstance.setStyle({}, { stick: false, sphere: false, line: false });
      viewerInstance.setStyle({}, { [viewerStyle]: {} });
      viewerInstance.render();
    }
  }, [viewerStyle, viewerBg, viewerInstance]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!details) {
    return (
      <Card className="w-full h-full bg-accent/10 border-accent/20">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground text-sm">Molecular details not available.</p>
        </CardContent>
      </Card>
    );
  }

  const renderDrugLikenessBadge = () => {
    if (details.lipinski_score === 4) {
      return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 gap-1.5"><ShieldCheck className="w-4 h-4"/> Drug-Like</Badge>;
    }
    if (details.lipinski_score === 3) {
      return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 gap-1.5"><Shield className="w-4 h-4"/> Borderline</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 gap-1.5"><ShieldAlert className="w-4 h-4"/> Poor Drug-Likeness</Badge>;
  };

  return (
    <Card className="w-full shadow-lg border-border/50 glass-card">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" /> Molecular Analysis
          </CardTitle>
          {renderDrugLikenessBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border/50 bg-background/50 h-12">
            <TabsTrigger value="structure" className="flex-1 font-semibold data-[state=active]:text-primary">Structure</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1 font-semibold data-[state=active]:text-primary">Properties</TabsTrigger>
            <TabsTrigger value="identifiers" className="flex-1 font-semibold data-[state=active]:text-primary">Identifiers</TabsTrigger>
          </TabsList>

          {/* STRUCTURE TAB */}
          <TabsContent value="structure" className="p-0 m-0 border-none outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 h-[450px]">
              {/* 2D View */}
              <div className="border-r border-border/50 flex flex-col bg-white dark:bg-zinc-950 relative group">
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-background/80 backdrop-blur rounded text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/50">2D Render</div>
                {details.svg_2d ? (
                  <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" dangerouslySetInnerHTML={{ __html: details.svg_2d.replace(/<svg/g, '<svg width="100%" height="100%"') }} />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No 2D render available</div>
                )}
                {details.svg_2d && (
                  <Button variant="secondary" size="sm" className="absolute bottom-2 right-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDownload(details.svg_2d!, 'molecule_2d.svg', 'image/svg+xml')}>
                    <Download className="w-3 h-3 mr-1" /> SVG
                  </Button>
                )}
              </div>
              
              {/* 3D View */}
              <div className="flex flex-col relative group">
                <div className="absolute top-2 left-2 z-10 flex gap-2">
                  <div className="px-2 py-1 bg-background/80 backdrop-blur rounded text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/50">3D Interactive</div>
                  {/* Controls */}
                  <select 
                    className="h-6 text-[10px] bg-background/80 backdrop-blur border border-border/50 rounded px-1 outline-none font-medium cursor-pointer"
                    value={viewerStyle}
                    onChange={(e) => setViewerStyle(e.target.value as any)}
                  >
                    <option value="stick">Stick</option>
                    <option value="sphere">Sphere</option>
                    <option value="line">Wireframe</option>
                  </select>
                  <select 
                    className="h-6 text-[10px] bg-background/80 backdrop-blur border border-border/50 rounded px-1 outline-none font-medium cursor-pointer"
                    value={viewerBg}
                    onChange={(e) => setViewerBg(e.target.value as any)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                {details.molfile_3d ? (
                  <div ref={viewerRef} className="flex-1 w-full h-full relative cursor-move" />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm bg-zinc-950">
                    Failed to generate 3D conformer
                  </div>
                )}

                {details.molfile_3d && (
                  <Button variant="secondary" size="sm" className="absolute bottom-2 right-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDownload(details.molfile_3d!, 'molecule_3d.sdf', 'chemical/x-mdl-sdfile')}>
                    <Download className="w-3 h-3 mr-1" /> SDF
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* PROPERTIES TAB */}
          <TabsContent value="properties" className="p-6 m-0 border-none outline-none space-y-6">
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Lipinski Rule of Five</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${details.mw && details.mw <= 500 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="text-xs text-muted-foreground mb-1">Mol Weight (≤ 500)</p>
                  <p className="text-xl font-bold font-mono">{details.mw || '-'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${details.logp && details.logp <= 5 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="text-xs text-muted-foreground mb-1">LogP (≤ 5)</p>
                  <p className="text-xl font-bold font-mono">{details.logp || '-'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${details.hbd !== undefined && details.hbd <= 5 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="text-xs text-muted-foreground mb-1">H-Donors (≤ 5)</p>
                  <p className="text-xl font-bold font-mono">{details.hbd !== undefined ? details.hbd : '-'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${details.hba !== undefined && details.hba <= 10 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <p className="text-xs text-muted-foreground mb-1">H-Acceptors (≤ 10)</p>
                  <p className="text-xl font-bold font-mono">{details.hba !== undefined ? details.hba : '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Structural Properties</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Exact Mass</p>
                  <p className="text-lg font-bold font-mono">{details.exact_mass || '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Formula</p>
                  <p className="text-lg font-bold font-mono">{details.formula || '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">TPSA</p>
                  <p className="text-lg font-bold font-mono">{details.tpsa || '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Rotatable Bonds</p>
                  <p className="text-lg font-bold font-mono">{details.rotatable_bonds !== undefined ? details.rotatable_bonds : '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Ring Count</p>
                  <p className="text-lg font-bold font-mono">{details.ring_count !== undefined ? details.ring_count : '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Heavy Atoms</p>
                  <p className="text-lg font-bold font-mono">{details.heavy_atom_count !== undefined ? details.heavy_atom_count : '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Atoms</p>
                  <p className="text-lg font-bold font-mono">{details.atom_count !== undefined ? details.atom_count : '-'}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Formal Charge</p>
                  <p className="text-lg font-bold font-mono">{details.formal_charge !== undefined ? details.formal_charge : '-'}</p>
                </div>
              </div>
            </div>

          </TabsContent>

          {/* IDENTIFIERS TAB */}
          <TabsContent value="identifiers" className="p-6 m-0 border-none outline-none space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Canonical SMILES</label>
              <div className="flex">
                <input readOnly value={details.canonical_smiles || smiles} className="flex-1 h-10 px-3 bg-accent/10 border border-accent/20 rounded-l-md font-mono text-sm outline-none text-foreground" />
                <Button variant="secondary" className="rounded-l-none" onClick={() => copyToClipboard(details.canonical_smiles || smiles, 'SMILES')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">InChI</label>
              <div className="flex">
                <input readOnly value={details.inchi || '-'} className="flex-1 h-10 px-3 bg-accent/10 border border-accent/20 rounded-l-md font-mono text-sm outline-none text-foreground" />
                <Button variant="secondary" className="rounded-l-none" onClick={() => copyToClipboard(details.inchi || '', 'InChI')} disabled={!details.inchi}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">InChIKey</label>
              <div className="flex">
                <input readOnly value={details.inchi_key || '-'} className="flex-1 h-10 px-3 bg-accent/10 border border-accent/20 rounded-l-md font-mono text-sm outline-none text-foreground" />
                <Button variant="secondary" className="rounded-l-none" onClick={() => copyToClipboard(details.inchi_key || '', 'InChIKey')} disabled={!details.inchi_key}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
