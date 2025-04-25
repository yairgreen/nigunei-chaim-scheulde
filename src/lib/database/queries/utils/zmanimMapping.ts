
const formatTimeFromSupabase = (timeStr: string | null): string => {
  if (!timeStr) return '';
  
  try {
    // Check if already in HH:MM format
    if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
    
    // Check if in HH:MM:SS format
    const match = timeStr.match(/^(\d{2}):(\d{2}):\d{2}$/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    
    // Try to parse as date
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return timeStr;
  } catch (error) {
    console.error('Error formatting time from Supabase:', error);
    return timeStr;
  }
};

const mapSupabaseToZmanim = (item: any) => {
  return {
    date: item.gregorian_date,
    alotHaShachar: formatTimeFromSupabase(item.alot_hashachar),
    sunrise: formatTimeFromSupabase(item.sunrise),
    misheyakir: formatTimeFromSupabase(item.misheyakir),
    sofZmanShmaMGA: formatTimeFromSupabase(item.sof_zman_shma_mga),
    sofZmanShma: formatTimeFromSupabase(item.sof_zman_shma_gra),
    sofZmanTfillaMGA: formatTimeFromSupabase(item.sof_zman_tfilla_mga),
    sofZmanTfilla: formatTimeFromSupabase(item.sof_zman_tfilla_gra),
    chatzot: formatTimeFromSupabase(item.chatzot),
    minchaGedola: formatTimeFromSupabase(item.mincha_gedola),
    plagHaMincha: formatTimeFromSupabase(item.plag_hamincha),
    sunset: formatTimeFromSupabase(item.sunset),
    beinHaShmashos: formatTimeFromSupabase(item.tzait_hakochavim)
  };
};

export { mapSupabaseToZmanim, formatTimeFromSupabase };
