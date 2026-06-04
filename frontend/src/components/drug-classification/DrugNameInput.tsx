import React from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';

interface DrugNameInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  error?: string;
}

const EXAMPLE_DRUGS = ['Aspirin', 'Penicillin', 'Caffeine', 'Ibuprofen'];

export default function DrugNameInput({ value, onChange, disabled, error }: DrugNameInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="relative group pt-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
        <input
          id="drug-name-input"
          type="text"
          className={`peer w-full pl-12 pr-4 h-14 text-lg rounded-xl bg-background/50 border transition-all placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? 'border-destructive/50 focus:border-destructive' : 'border-border/50 focus:border-primary/50'
          }`}
          placeholder="Common or Chemical Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <label
          htmlFor="drug-name-input"
          className="absolute left-12 top-0 -translate-y-1/2 px-1 text-sm font-semibold text-muted-foreground transition-all peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:font-semibold peer-focus:text-primary bg-background/50 backdrop-blur-sm rounded-md pointer-events-none"
        >
          Common or Chemical Name
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!error && (
        <p className="text-xs text-muted-foreground/70">
          Automatically resolved to a canonical SMILES string via PubChem.
        </p>
      )}

      {/* Example Chips */}
      <div className="pt-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider uppercase">
          Try Examples
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_DRUGS.map((drug) => (
            <button
              key={drug}
              type="button"
              onClick={() => onChange(drug)}
              disabled={disabled}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent/50 text-accent-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/50 disabled:opacity-50"
            >
              {drug}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
