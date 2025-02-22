import React from 'react';

interface Props {
  score: {
    value: string;
    status: string;
  };
}

const TotalScoreDisplay: React.FC<Props> = ({ score }) => {
  const percentage = parseFloat(score.value);
  const circumference = 2 * Math.PI * 47; // For a circle with r=47
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'stroke-emerald-500';
      case 'GOOD': return 'stroke-green-500';
      case 'ACCEPTABLE':
      case 'OK': return 'stroke-yellow-500';
      case 'NEEDS_IMPROVEMENT':
      case 'BAD': return 'stroke-red-500';
      default: return 'stroke-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="47"
            className="stroke-gray-200"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="47"
            className={getStatusColor(score.status)}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-700">{score.value}%</span>
          <span className="text-xs text-gray-500">Total Score</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">Target: 100%</div>
    </div>
  );
};

export default TotalScoreDisplay; 