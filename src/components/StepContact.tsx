// import { Building2, MapPin, Phone } from "lucide-react";
// import { useState } from "react";

// interface StepContactProps {
//   onNext: () => void;
// }

// function StepContact({ onNext }: StepContactProps) {
//   const [businessName, setBusinessName] = useState("");
//   const [businessAddress, setBusinessAddress] = useState("");
//   const [contactNumber, setContactNumber] = useState("");

//   const isValid =
//     businessName.trim().length > 0 &&
//     businessAddress.trim().length > 0 &&
//     contactNumber.trim().length > 0;

//   return (
//     <div className="bg-white rounded-3xl shadow-lg p-12">
//       {/* Icon */}
//       <div className="flex justify-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6366f1] flex items-center justify-center">
//           <Building2 className="w-8 h-8 text-white" />
//         </div>
//       </div>

//       {/* Title */}
//       <h2 className="text-center text-[#1f2937] mb-3 text-[28px] font-semibold">
//         Business Contact Information
//       </h2>

//       {/* Subtitle */}
//       <p className="text-center text-[#6b7280] mb-10 text-[15px] font-normal">
//         Let’s start with your business name, address, and contact number
//       </p>

//       {/* Form Fields */}
//       <div className="space-y-6 mb-8">
//         {/* Business Name */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <Building2 className="w-4 h-4 text-[#6366f1]" />
//             Business Name
//           </label>
//           <input
//             type="text"
//             value={businessName}
//             onChange={(e) => setBusinessName(e.target.value)}
//             placeholder="Your Business Name"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>

//         {/* Business Address */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <MapPin className="w-4 h-4 text-[#6366f1]" />
//             Business Address
//           </label>
//           <input
//             type="text"
//             value={businessAddress}
//             onChange={(e) => setBusinessAddress(e.target.value)}
//             placeholder="123 Main Street, City, State, ZIP"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>

//         {/* Contact Number */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <Phone className="w-4 h-4 text-[#6366f1]" />
//             Contact Number
//           </label>
//           <input
//             type="tel"
//             value={contactNumber}
//             onChange={(e) => setContactNumber(e.target.value)}
//             placeholder="+1 (555) 123-4567"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>
//       </div>

//       {/* Helper Text */}
//       <p className="text-center text-[#9ca3af] mb-8 text-[13px] font-normal">
//         This information will be used on your invoices and quotes.
//       </p>

//       {/* Next Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={onNext}
//           disabled={!isValid}
//           className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
//             isValid
//               ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0]"
//               : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
//           } text-[15px] font-medium`}
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
//     </div>
//   );
// }

// export default StepContact;




// import { Building2, MapPin, Phone } from "lucide-react";

// interface StepContactProps {
//   formData: any;
//   setFormData: (d: any) => void;
//   onNext: () => void;
// }

// function StepContact({ formData, setFormData, onNext }: StepContactProps) {
//   const businessName = formData.business_name ?? "";
//   const businessAddress = formData.business_address ?? "";
//   const contactNumber = formData.contact_number ?? "";

//   const isValid =
//     businessName.trim().length > 0 &&
//     businessAddress.trim().length > 0 &&
//     contactNumber.trim().length > 0;

//   return (
//     <div className="bg-white rounded-3xl shadow-lg p-12">
//       {/* Icon */}
//       <div className="flex justify-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6366f1] flex items-center justify-center">
//           <Building2 className="w-8 h-8 text-white" />
//         </div>
//       </div>

//       {/* Title */}
//       <h2 className="text-center text-[#1f2937] mb-3 text-[28px] font-semibold">
//         Business Contact Information
//       </h2>

//       {/* Subtitle */}
//       <p className="text-center text-[#6b7280] mb-10 text-[15px] font-normal">
//         Let’s start with your business name, address, and contact number
//       </p>

//       {/* Form Fields */}
//       <div className="space-y-6 mb-8">
//         {/* Business Name */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <Building2 className="w-4 h-4 text-[#6366f1]" />
//             Business Name
//           </label>
//           <input
//             type="text"
//             value={businessName}
//             onChange={(e) =>
//               setFormData({ ...formData, business_name: e.target.value })
//             }
//             placeholder="Your Business Name"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>

//         {/* Business Address */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <MapPin className="w-4 h-4 text-[#6366f1]" />
//             Business Address
//           </label>
//           <input
//             type="text"
//             value={businessAddress}
//             onChange={(e) =>
//               setFormData({ ...formData, business_address: e.target.value })
//             }
//             placeholder="123 Main Street, City, State, ZIP"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>

//         {/* Contact Number */}
//         <div>
//           <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
//             <Phone className="w-4 h-4 text-[#6366f1]" />
//             Contact Number
//           </label>
//           <input
//             type="tel"
//             value={contactNumber}
//             onChange={(e) =>
//               setFormData({ ...formData, contact_number: e.target.value })
//             }
//             placeholder="+1 (555) 123-4567"
//             className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
//           />
//         </div>
//       </div>

//       {/* Helper Text */}
//       <p className="text-center text-[#9ca3af] mb-8 text-[13px] font-normal">
//         This information will be used on your invoices and quotes.
//       </p>

//       {/* Next Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={onNext}
//           disabled={!isValid}
//           className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
//             isValid
//               ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0]"
//               : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
//           } text-[15px] font-medium`}
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
//     </div>
//   );
// }

// export default StepContact;




import { Building2, MapPin, Phone } from "lucide-react";
import { useState } from "react";

interface StepContactProps {
  formData: any;
  setFormData: (d: any) => void;
  onNext: () => void;
}

function StepContact({ formData, setFormData, onNext }: StepContactProps) {
  const businessName = formData.business_name ?? "";
  const businessAddress = formData.business_address ?? "";
  const contactNumber = formData.contact_number ?? "";

  const [phoneError, setPhoneError] = useState("");

  // 🔍 Phone validation function
  const validatePhone = (value: string) => {
    // Allow + and numbers only
    const phoneRegex = /^[+]?[0-9]{7,15}$/;

    if (!value.trim()) return "Phone number is required.";
    if (!phoneRegex.test(value.replace(/\s+/g, "")))
      return "Invalid phone number! Use digits only, min 7 numbers (e.g. +15551234567).";

    return "";
  };

  // 🔄 Handle phone number input
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/\s+/g, ""); // Remove spaces
    setFormData({ ...formData, contact_number: cleanValue });

    const errorMsg = validatePhone(cleanValue);
    setPhoneError(errorMsg);
  };

  const isValid =
    businessName.trim().length > 0 &&
    businessAddress.trim().length > 0 &&
    phoneError === "" &&
    contactNumber.trim().length > 0;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-12">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6366f1] flex items-center justify-center">
          <Building2 className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-center text-[#1f2937] mb-3 text-[28px] font-semibold">
        Business Contact Information
      </h2>

      {/* Subtitle */}
      <p className="text-center text-[#6b7280] mb-10 text-[15px] font-normal">
        Let’s start with your business name, address, and contact number
      </p>

      {/* Form Fields */}
      <div className="space-y-6 mb-8">
        {/* Business Name */}
        <div>
          <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
            <Building2 className="w-4 h-4 text-[#6366f1]" />
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) =>
              setFormData({ ...formData, business_name: e.target.value })
            }
            placeholder="Your Business Name"
            className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
          />
        </div>

        {/* Business Address */}
        <div>
          <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
            <MapPin className="w-4 h-4 text-[#6366f1]" />
            Business Address
          </label>
          <input
            type="text"
            value={businessAddress}
            onChange={(e) =>
              setFormData({ ...formData, business_address: e.target.value })
            }
            placeholder="123 Main Street, City, State, ZIP"
            className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#1f2937] outline-none focus:border-[#6366f1] focus:bg-white transition-colors text-[15px]"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="flex items-center gap-2 text-[#1f2937] mb-3 text-[14px] font-semibold">
            <Phone className="w-4 h-4 text-[#6366f1]" />
            Contact Number
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+15551234567"
            className={`w-full px-4 py-3 bg-[#f9fafb] border rounded-lg text-[#1f2937] outline-none transition-colors text-[15px] ${
              phoneError
                ? "border-red-400 focus:border-red-500"
                : "border-[#e5e7eb] focus:border-[#6366f1]"
            }`}
          />

          {/* ⚠ Phone Error Message */}
          {phoneError && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {phoneError}
            </p>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-center text-[#9ca3af] mb-8 text-[13px] font-normal">
        This information will be used on your invoices and quotes.
      </p>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            isValid
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-[#9575de] hover:to-[#b8a5f0]"
              : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
          } text-[15px] font-medium`}
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

export default StepContact;
