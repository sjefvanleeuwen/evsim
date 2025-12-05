import React from 'react';

interface Abbreviation {
  term: string;
  definition: string;
  category: 'General' | 'Technical' | 'Business' | 'Grid';
}

const abbreviations: Abbreviation[] = [
  { term: 'EV', definition: 'Electric Vehicle', category: 'General' },
  { term: 'EVSE', definition: 'Electric Vehicle Supply Equipment (The Charger)', category: 'Technical' },
  { term: 'CPO', definition: 'Charge Point Operator (Manages the infrastructure)', category: 'Business' },
  { term: 'MSP', definition: 'Mobility Service Provider (Provides access/cards to drivers)', category: 'Business' },
  { term: 'CPQ', definition: 'Configure, Price, Quote (Sales software)', category: 'Business' },
  { term: 'HEMS', definition: 'Home Energy Management System', category: 'Grid' },
  { term: 'V2G', definition: 'Vehicle-to-Grid (Sending power back to the grid)', category: 'Grid' },
  { term: 'V2H', definition: 'Vehicle-to-Home (Powering the home from the car)', category: 'Grid' },
  { term: 'DSO', definition: 'Distribution System Operator (Grid owner)', category: 'Grid' },
  { term: 'DDD', definition: 'Domain-Driven Design (Software architecture pattern)', category: 'Technical' },
  { term: 'OCPP', definition: 'Open Charge Point Protocol (Language between charger and cloud)', category: 'Technical' },
  { term: 'RFID', definition: 'Radio Frequency Identification (Charge cards)', category: 'Technical' },
  { term: 'kWh', definition: 'Kilowatt-hour (Unit of energy)', category: 'General' },
  { term: 'DC', definition: 'Direct Current (Fast charging)', category: 'Technical' },
  { term: 'AC', definition: 'Alternating Current (Slow/Home charging)', category: 'Technical' },
  { term: 'CDR', definition: 'Charge Detail Record (The receipt for a session)', category: 'Business' },
  { term: 'SOC', definition: 'State of Charge (Battery percentage)', category: 'Technical' },
];

export const AbbreviationsPage: React.FC = () => {
  const categories = Array.from(new Set(abbreviations.map(a => a.category)));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-400 mb-2">📚 Glossary & Abbreviations</h1>
        <p className="text-gray-400 mb-8">Deciphering the jargon of the EV industry.</p>

        <div className="grid gap-8">
          {categories.map(category => (
            <div key={category} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">{category}</h2>
              </div>
              <div className="divide-y divide-gray-800">
                {abbreviations
                  .filter(a => a.category === category)
                  .map(item => (
                    <div key={item.term} className="px-6 py-4 hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                      <span className="text-xl font-mono font-bold text-blue-400 w-24 shrink-0">{item.term}</span>
                      <span className="text-gray-300">{item.definition}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
