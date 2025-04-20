
export const fetchRealHebrewDate = async (gregorianDate: Date): Promise<string> => {
  try {
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const day = String(gregorianDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=${formattedDate}&end=${formattedDate}&c=on&ss=on&mf=on&c=on&b=40&d=on&geo=geoname&geonameid=293918&M=on&s=on`;
    
    console.log(`Fetching Hebrew date from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Hebrew date: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Received Hebrew date data:", data);
    
    if (data.items && data.items.length > 0) {
      const hebrewDateItem = data.items.find((item: any) => item.category === 'hebdate');
      
      if (hebrewDateItem && hebrewDateItem.hebrew) {
        console.log(`Successfully found Hebrew date: ${hebrewDateItem.hebrew} for ${formattedDate}`);
        return hebrewDateItem.hebrew;
      }
    }
    
    throw new Error("Could not extract Hebrew date from API response");
  } catch (error) {
    console.error("Error fetching real Hebrew date:", error);
    throw error;
  }
};
