import { useState, useEffect } from 'react';

export interface UserLocation {
  country: string;
  city: string;
  region: string;
  isLocal: boolean; 
}

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const isNearby = data.city === 'Cairo' || data.city === 'Giza' || data.region === 'Cairo' || data.region === 'Giza';
        setLocation({
          country: data.country_name,
          city: data.city,
          region: data.region,
          isLocal: isNearby
        });
      })
      .catch(err => console.error("Location Error", err));
  }, []);

  return location;
};
