export const analyzeAttendancePatterns = (attendanceData) => {
  const patterns = {
    consecutiveAbsences: [],
    mostAbsentDay: '',
    attendanceRate: 0,
    improvement: false
  };

  // Calculate attendance rate
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(day => 
    day.present > day.absent
  ).length;
  
  patterns.attendanceRate = Math.round((presentDays / totalDays) * 100);

  // Find most absent day
  const dayTotals = attendanceData.reduce((acc, day) => {
    acc[day.name] = acc[day.name] || { total: 0 };
    acc[day.name].total += day.absent;
    return acc;
  }, {});

  patterns.mostAbsentDay = Object.entries(dayTotals)
    .sort(([,a], [,b]) => b.total - a.total)[0][0];

  // Check for improvement
  const firstHalf = attendanceData.slice(0, Math.floor(totalDays / 2));
  const secondHalf = attendanceData.slice(Math.floor(totalDays / 2));
  
  const firstHalfRate = firstHalf.reduce((sum, day) => 
    sum + (day.present / (day.present + day.absent)), 0) / firstHalf.length;
  
  const secondHalfRate = secondHalf.reduce((sum, day) => 
    sum + (day.present / (day.present + day.absent)), 0) / secondHalf.length;
  
  patterns.improvement = secondHalfRate > firstHalfRate;

  return patterns;
};