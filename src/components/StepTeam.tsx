


import { useState } from 'react';
import { ChevronLeft, MapPin, Check, X } from 'lucide-react';

interface StepLocationProps {
  onNext: () => void;
  onBack: () => void;
}

const counties = [
  { id: 'dublin', name: 'Dublin', county: 'County Dublin' },
  { id: 'meath', name: 'Meath', county: 'County Meath' },
  { id: 'louth', name: 'Louth', county: 'County Louth' },
  { id: 'kildare', name: 'Kildare', county: 'County Kildare' },
  { id: 'wicklow', name: 'Wicklow', county: 'County Wicklow' },
  { id: 'wexford', name: 'Wexford', county: 'County Wexford' },
  { id: 'carlow', name: 'Carlow', county: 'County Carlow' },
  { id: 'kilkenny', name: 'Kilkenny', county: 'County Kilkenny' },
  { id: 'laois', name: 'Laois', county: 'County Laois' },
  { id: 'offaly', name: 'Offaly', county: 'County Offaly' },
  { id: 'westmeath', name: 'Westmeath', county: 'County Westmeath' },
  { id: 'longford', name: 'Longford', county: 'County Longford' },
  { id: 'cork', name: 'Cork', county: 'County Cork' },
  { id: 'kerry', name: 'Kerry', county: 'County Kerry' },
  { id: 'limerick', name: 'Limerick', county: 'County Limerick' },
  { id: 'tipperary', name: 'Tipperary', county: 'County Tipperary' },
  { id: 'waterford', name: 'Waterford', county: 'County Waterford' },
  { id: 'clare', name: 'Clare', county: 'County Clare' },
  { id: 'galway', name: 'Galway', county: 'County Galway' },
  { id: 'mayo', name: 'Mayo', county: 'County Mayo' },
  { id: 'roscommon', name: 'Roscommon', county: 'County Roscommon' },
  { id: 'sligo', name: 'Sligo', county: 'County Sligo' },
  { id: 'leitrim', name: 'Leitrim', county: 'County Leitrim' },
  { id: 'donegal', name: 'Donegal', county: 'County Donegal' },
  { id: 'cavan', name: 'Cavan', county: 'County Cavan' },
  { id: 'monaghan', name: 'Monaghan', county: 'County Monaghan' },
];

function StepLocation({ onNext, onBack }: StepLocationProps) {
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [customCounty, setCustomCounty] = useState('');

  const toggleCounty = (countyId: string) => {
    setSelectedCounties((prev) =>
      prev.includes(countyId)
        ? prev.filter((id) => id !== countyId)
        : [...prev, countyId]
    );
  };

  const selectAll = () => {
    if (selectedCounties.length === counties.length) {
      setSelectedCounties([]);
    } else {
      setSelectedCounties(counties.map((c) => c.id));
    }
  };

  const clearAll = () => {
    setSelectedCounties([]);
  };

  const removeCounty = (countyId: string) => {
    setSelectedCounties((prev) => prev.filter((id) => id !== countyId));
  };

  const isValid = selectedCounties.length > 0 || customCounty.trim().length > 0;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-[#6b7280] mb-6" style={{ fontSize: '15px', fontWeight: 400 }}>
        Select one or more counties where you supply your service
      </p>

      {/* Selected Counties Section */}
      {selectedCounties.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#1f2937]" style={{ fontSize: '14px', fontWeight: 600 }}>
              Selected Counties ({selectedCounties.length})
            </span>
            <button
              onClick={clearAll}
              className="text-[#ef4444] hover:text-[#dc2626] transition-colors"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              Clear All
            </button>
          </div>
          <div className="bg-[#f9fafb] rounded-xl p-4 flex flex-wrap gap-2">
            {selectedCounties.map((countyId) => {
              const county = counties.find((c) => c.id === countyId);
              return (
                <div
                  key={countyId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#8b5cf6] text-white rounded-lg"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {county?.name}
                  <button
                    onClick={() => removeCounty(countyId)}
                    className="hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Select All Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={selectAll}
          className="text-[#6366f1] hover:text-[#5b4dff] transition-colors"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          Select All
        </button>
      </div>

      {/* Counties Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {counties.map((county) => {
          const isSelected = selectedCounties.includes(county.id);
          return (
            <button
              key={county.id}
              onClick={() => toggleCounty(county.id)}
              className={`flex items-center justify-between px-5 py-4 border rounded-xl transition-all ${
                isSelected
                  ? 'border-[#6366f1] bg-[#f5f3ff]'
                  : 'border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-[#f9fafb]'
              }`}
            >
              <div className="text-left">
                <div className="text-[#1f2937]" style={{ fontSize: '15px', fontWeight: 600 }}>
                  {county.name}
                </div>
                <div className="text-[#9ca3af]" style={{ fontSize: '12px', fontWeight: 400 }}>
                  {county.county}
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom County Input */}
      <div className="mb-8">
        <p className="text-[#1f2937] mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
          Can't find your county? Add it here
        </p>
        <input
          type="text"
          value={customCounty}
          onChange={(e) => setCustomCounty(e.target.value)}
          placeholder="e.g., Belfast, North Dublin..."
          className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#6b7280] outline-none focus:border-[#6366f1] focus:bg-white transition-colors"
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-all flex items-center gap-2"
          style={{ fontSize: '15px', fontWeight: 500 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            isValid
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0] cursor-pointer'
              : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
          }`}
          style={{ fontSize: '15px', fontWeight: 500 }}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
export default  StepLocation;
