import { useState, useEffect } from 'react';
import { ExperienceApi, ExperienceConfig } from '../api/experienceApi';
import mockExperience from '../mock/experience.json';

export function useExperience(customerId = 'cust_bharat_001', lang = 'en') {
  const [experience, setExperience] = useState<ExperienceConfig>(mockExperience as ExperienceConfig);
  const [loading, setLoading] = useState(false);

  const loadExperience = async () => {
    setLoading(true);
    const data = await ExperienceApi.fetchExperience(customerId, lang);
    setExperience(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExperience();
  }, [customerId, lang]);

  return { experience, loading, refetch: loadExperience };
}
