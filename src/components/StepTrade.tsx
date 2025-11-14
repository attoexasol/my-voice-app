// import { Check, ChevronLeft } from "lucide-react";
// import { useState } from "react";

// interface StepTradeProps {
//   onNext: () => void;
//   onBack: () => void;
// }

// const trades = [
//   {
//     id: "plumber",
//     name: "Plumber",
//     icon: "🔧",
//     color: "from-[#3b82f6] to-[#60a5fa]",
//   },
//   {
//     id: "electrician",
//     name: "Electrician",
//     icon: "⚡",
//     color: "from-[#f97316] to-[#fb923c]",
//   },
//   { id: "carpenter", name: "Carpenter", icon: "🔨", color: "" },
//   { id: "roofer", name: "Roofer", icon: "🏠", color: "" },
//   { id: "block-layer", name: "Block-Layer", icon: "🧱", color: "" },
//   { id: "ber-assessor", name: "BER Assessor", icon: "📊", color: "" },
//   {
//     id: "quantity-surveyor",
//     name: "Quantity Surveyor",
//     icon: "📐",
//     color: "from-[#a855f7] to-[#c084fc]",
//   },
//   {
//     id: "software-developer",
//     name: "Software Developer",
//     icon: "💻",
//     color: "from-[#7c3aed] to-[#8b5cf6]",
//   },
//   { id: "designer", name: "Designer", icon: "🎨", color: "" },
//   {
//     id: "beauty-salon",
//     name: "Beauty Salon",
//     icon: "💅",
//     color: "from-[#ec4899] to-[#f472b6]",
//   },
// ];
// function StepTrade({ onNext, onBack }: StepTradeProps) {
//   const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

//   const isValid = selectedTrade !== null;

//   return (
//     <div className="bg-white rounded-3xl shadow-lg p-10 relative">
//       {/* Helper Text at Top */}
//       <p
//         className="text-center text-[#6b7280] mb-8"
//         style={{ fontSize: "13px", fontWeight: 400 }}
//       >
//         This helps us customize your experience and provide relevant templates
//       </p>

//       {/* Trade Options */}
//       <div className="space-y-3 mb-8">
//         {trades.map((trade) => {
//           const isSelected = selectedTrade === trade.id;
//           return (
//             <button
//               key={trade.id}
//               onClick={() => setSelectedTrade(trade.id)}
//               className={`w-full flex items-center gap-4 px-5 py-4 border rounded-xl transition-all group ${
//                 isSelected
//                   ? "border-[#6366f1] bg-[#faf9fe]"
//                   : "border-[#e5e7eb] hover:border-[#6366f1] hover:bg-[#faf9fe]"
//               }`}
//             >
//               {trade.color ? (
//                 <div
//                   className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trade.color} flex items-center justify-center flex-shrink-0`}
//                 >
//                   <span className="text-white text-lg">{trade.icon}</span>
//                 </div>
//               ) : (
//                 <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
//                   <span className="text-2xl">{trade.icon}</span>
//                 </div>
//               )}
//               <span
//                 className="text-[#1f2937] flex-1 text-left"
//                 style={{ fontSize: "15px", fontWeight: 500 }}
//               >
//                 {trade.name}
//               </span>
//               {isSelected && (
//                 <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
//                   <Check className="w-3 h-3 text-white" />
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={onBack}
//           className="px-5 py-2.5 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-all flex items-center gap-2"
//           style={{ fontSize: "15px", fontWeight: 500 }}
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back
//         </button>

//         <button
//           onClick={onNext}
//           disabled={!isValid}
//           className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
//             isValid
//               ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0] cursor-pointer"
//               : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
//           }`}
//           style={{ fontSize: "15px", fontWeight: 500 }}
//         >
//           Next
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path
//               d="M6 12L10 8L6 4"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Floating Chat Buttons */}
//       <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
//         <button className="w-10 h-10 rounded-full bg-[#1f2937] text-white flex items-center justify-center shadow-lg hover:bg-[#374151] transition-colors">
//           <span style={{ fontSize: "16px" }}>💬</span>
//         </button>
//         <button className="w-10 h-10 rounded-full bg-[#4b5563] text-white flex items-center justify-center shadow-lg hover:bg-[#6b7280] transition-colors">
//           <span style={{ fontSize: "16px" }}>⬆️</span>
//         </button>
//       </div>
//     </div>
//   );
// }
// export default StepTrade;

import { Check, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface StepTradeProps {
  formData: any;
  setFormData: (d: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const trades = [
  {
    id: "plumber",
    name: "Plumber",
    icon: "🔧",
    color: "from-[#3b82f6] to-[#60a5fa]",
  },
  {
    id: "electrician",
    name: "Electrician",
    icon: "⚡",
    color: "from-[#f97316] to-[#fb923c]",
  },
  { id: "carpenter", name: "Carpenter", icon: "🔨", color: "" },
  { id: "roofer", name: "Roofer", icon: "🏠", color: "" },
  { id: "block-layer", name: "Block-Layer", icon: "🧱", color: "" },
  { id: "ber-assessor", name: "BER Assessor", icon: "📊", color: "" },
  {
    id: "quantity-surveyor",
    name: "Quantity Surveyor",
    icon: "📐",
    color: "from-[#a855f7] to-[#c084fc]",
  },
  {
    id: "software-developer",
    name: "Software Developer",
    icon: "💻",
    color: "from-[#7c3aed] to-[#8b5cf6]",
  },
  { id: "designer", name: "Designer", icon: "🎨", color: "" },
  {
    id: "beauty-salon",
    name: "Beauty Salon",
    icon: "💅",
    color: "from-[#ec4899] to-[#f472b6]",
  },
];

function StepTrade({ formData, setFormData, onNext, onBack }: StepTradeProps) {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(
    formData.trade || null
  );

  useEffect(() => {
    // keep local selection in sync if parent formData changes
    if (formData.trade) setSelectedTrade(formData.trade);
  }, [formData.trade]);

  const isValid = selectedTrade !== null;

  const handleNext = () => {
    if (!selectedTrade) return;
    setFormData({ ...formData, trade: selectedTrade });
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 relative">
      {/* Helper Text at Top */}
      <p
        className="text-center text-[#6b7280] mb-8"
        style={{ fontSize: "13px", fontWeight: 400 }}
      >
        This helps us customize your experience and provide relevant templates
      </p>

      {/* Trade Options */}
      <div className="space-y-3 mb-8">
        {trades.map((trade) => {
          const isSelected = selectedTrade === trade.id;
          return (
            <button
              key={trade.id}
              onClick={() => setSelectedTrade(trade.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 border rounded-xl transition-all group ${
                isSelected
                  ? "border-[#6366f1] bg-[#faf9fe]"
                  : "border-[#e5e7eb] hover:border-[#6366f1] hover:bg-[#faf9fe]"
              }`}
            >
              {trade.color ? (
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trade.color} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-lg">{trade.icon}</span>
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{trade.icon}</span>
                </div>
              )}
              <span
                className="text-[#1f2937] flex-1 text-left"
                style={{ fontSize: "15px", fontWeight: 500 }}
              >
                {trade.name}
              </span>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-all flex items-center gap-2"
          style={{ fontSize: "15px", fontWeight: 500 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            isValid
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0] cursor-pointer"
              : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
          }`}
          style={{ fontSize: "15px", fontWeight: 500 }}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
export default StepTrade;
