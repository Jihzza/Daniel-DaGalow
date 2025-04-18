// src/components/tables/ExpertBackgroundTable.js
import React, { useEffect, useState } from 'react';
// Assuming you have Supabase client set up
import { supabase } from '../../lib/supabaseClient';

const ExpertBackgroundTable = ({ data, updateData }) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(data.expertId || null);
  const [expertiseAreas, setExpertiseAreas] = useState(data.expertiseAreas || []);
  
  // Fetch experts from Supabase
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        const { data: expertsData, error } = await supabase
          .from('experts')
          .select('*');
          
        if (error) throw error;
        
        setExperts(expertsData || []);
      } catch (error) {
        console.error('Error fetching experts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperts();
  }, []);
  
  // Handle expert selection
  const handleExpertSelect = (expertId) => {
    setSelectedExpert(expertId);
    updateData({ expertId });
  };
  
  // Handle expertise area toggle
  const handleExpertiseToggle = (areaId) => {
    const updatedAreas = expertiseAreas.includes(areaId)
      ? expertiseAreas.filter(id => id !== areaId)
      : [...expertiseAreas, areaId];
      
    setExpertiseAreas(updatedAreas);
    updateData({ expertiseAreas: updatedAreas });
  };
  
  // Mock expertise areas (in real app, fetch from Supabase)
  const areas = [
    { id: 1, name: 'Strategic Planning' },
    { id: 2, name: 'Financial Analysis' },
    { id: 3, name: 'Marketing Strategy' },
    { id: 4, name: 'Operations Management' },
    { id: 5, name: 'Leadership Development' },
    { id: 6, name: 'Technology Implementation' }
  ];
  
  if (loading) {
    return <div className="text-center py-8">Loading experts...</div>;
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-oxfordBlue">Select Your Expert</h2>
      
      {/* Experts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-oxfordBlue text-white">
            <tr>
              <th className="py-3 px-4 text-left">Select</th>
              <th className="py-3 px-4 text-left">Expert Name</th>
              <th className="py-3 px-4 text-left">Specialization</th>
              <th className="py-3 px-4 text-left">Experience</th>
              <th className="py-3 px-4 text-left">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {experts.map((expert) => (
              <tr 
                key={expert.id} 
                className={`${selectedExpert === expert.id ? 'bg-gentleGray' : 'hover:bg-gray-50'}`}
              >
                <td className="py-4 px-4">
                  <input
                    type="radio"
                    name="selectedExpert"
                    checked={selectedExpert === expert.id}
                    onChange={() => handleExpertSelect(expert.id)}
                    className="h-4 w-4 text-oxfordBlue focus:ring-oxfordBlue"
                  />
                </td>
                <td className="py-4 px-4 font-medium">{expert.name}</td>
                <td className="py-4 px-4">{expert.specialization}</td>
                <td className="py-4 px-4">{expert.years_experience} years</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="mr-2">{expert.rating}</span>
                    <div className="flex text-darkGold">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(expert.rating) ? 'text-darkGold' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Expertise Areas Table */}
      {selectedExpert && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-oxfordBlue mb-4">Select Expertise Areas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-oxfordBlue text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Select</th>
                  <th className="py-3 px-4 text-left">Expertise Area</th>
                  <th className="py-3 px-4 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {areas.map((area) => (
                  <tr 
                    key={area.id} 
                    className={`${expertiseAreas.includes(area.id) ? 'bg-gentleGray' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={expertiseAreas.includes(area.id)}
                        onChange={() => handleExpertiseToggle(area.id)}
                        className="h-4 w-4 text-oxfordBlue focus:ring-oxfordBlue rounded"
                      />
                    </td>
                    <td className="py-4 px-4 font-medium">{area.name}</td>
                    <td className="py-4 px-4">Description of {area.name} expertise and its benefits</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertBackgroundTable;