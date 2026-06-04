import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ClipboardPaste, Copy, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SmilesInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  error?: string;
}

export default function SmilesInput({ value, onChange, disabled, error }: SmilesInputProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      toast.error('Failed to read clipboard');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="relative pt-2">
        <textarea
          id="smiles-input"
          placeholder="Canonical SMILES"
          className={`peer w-full min-h-[140px] text-base font-mono rounded-xl bg-background/50 border transition-all resize-none p-4 pb-12 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? 'border-destructive/50 focus:border-destructive' : 'border-border/50 focus:border-primary/50'
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <label
          htmlFor="smiles-input"
          className="absolute left-4 top-0 -translate-y-1/2 px-1 text-sm font-semibold text-muted-foreground transition-all peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:font-semibold peer-focus:text-primary bg-background/50 backdrop-blur-sm rounded-md pointer-events-none"
        >
          Canonical SMILES
        </label>

        {/* Character Count */}
        <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-md pointer-events-none">
          {value.length} chars
        </div>

        {/* Action Buttons inside Textarea */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 px-2.5 text-xs rounded-md bg-accent/50 hover:bg-accent hover:text-foreground"
            onClick={handlePaste}
            disabled={disabled}
          >
            <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" />
            Paste
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 px-2.5 text-xs rounded-md bg-accent/50 hover:bg-accent hover:text-foreground"
            onClick={handleCopy}
            disabled={!value || disabled}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onChange('')}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-sm text-destructive font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </motion.div>
  );
}
