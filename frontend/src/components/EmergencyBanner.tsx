import React from 'react';

const emergencyMessages = [
  "Emergency: Ambulance services are available 24/7.",
  "Contact our support for urgent medical advice.",
  "COVID-19 test centers open nearby.",
  "Dial 112 in case of immediate medical emergency."
];

const EmergencyBanner: React.FC = () => {
  return (
    <div className="w-full overflow-x-hidden bg-red-700">
      <div className="whitespace-nowrap animate-marquee py-2 text-white font-bold text-base">
        {emergencyMessages.map((msg, idx) => (
          <span key={idx} className="mx-8">{msg}</span>
        ))}
      </div>
    </div>
  );
};

export default EmergencyBanner;
