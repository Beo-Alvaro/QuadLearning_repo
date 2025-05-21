export const analyzeGradeDistribution = (grades) => {
  // Define grade ranges
  const ranges = [
    { min: 90, max: 100, label: 'Outstanding' },
    { min: 85, max: 89, label: 'Very Good' },
    { min: 80, max: 84, label: 'Good' },
    { min: 75, max: 79, label: 'Fair' },
    { min: 0, max: 74, label: 'Needs Improvement' }
  ];

  // Count grades in each range
  return ranges.map(range => ({
    range: range.label,
    count: grades.filter(grade => 
      grade >= range.min && grade <= range.max
    ).length,
    percentage: Math.round(
      (grades.filter(grade => 
        grade >= range.min && grade <= range.max
      ).length / grades.length) * 100
    )
  }));
};