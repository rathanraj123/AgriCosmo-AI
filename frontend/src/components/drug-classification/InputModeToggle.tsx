import React from 'react';

interface InputModeToggleProps {
  activeTab: 'name' | 'smiles';
  setActiveTab: (tab: 'name' | 'smiles') => void;
}

export default function InputModeToggle({ activeTab, setActiveTab }: InputModeToggleProps) {
  return (
    <div className="relative flex p-1 mb-6 bg-accent/30 rounded-xl max-w-sm">
      <button
        type="button"
        onClick={() => setActiveTab('name')}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
          activeTab === 'name' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
        }`}
      >
        Drug Name
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('smiles')}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
          activeTab === 'smiles' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
        }`}
      >
        SMILES String
      </button>
      {/* Active Background Animation */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: activeTab === 'name' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
      />
    </div>
  );
}
