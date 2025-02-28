import React, { useEffect, useState } from 'react';

interface Props {
  score: {
    value: string;
    status: string;
  };
}

const TotalScoreDisplay: React.FC<Props> = ({ score }) => {
  const isNA = score.value === 'N/A' || score.value === '0';
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = isNA ? 0 : parseFloat(score.value);
  const circumference = 2 * Math.PI * 47; // For a circle with r=47
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Animate the percentage on mount and when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getStatusColor = (status: string) => {
    if (isNA) return {
      stroke: 'stroke-neutral-300',
      text: 'text-neutral-400',
      bg: 'bg-neutral-50',
      gradient: 'from-neutral-300 to-neutral-400'
    };
    
    switch (status) {
      case 'EXCELLENT': 
        return {
          stroke: 'stroke-emerald-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          gradient: 'from-emerald-400 to-emerald-500'
        };
      case 'GOOD': 
        return {
          stroke: 'stroke-green-500',
          text: 'text-green-700',
          bg: 'bg-green-50',
          gradient: 'from-green-400 to-green-500'
        };
      case 'ACCEPTABLE':
      case 'OK': 
        return {
          stroke: 'stroke-yellow-500',
          text: 'text-yellow-700',
          bg: 'bg-yellow-50',
          gradient: 'from-yellow-400 to-yellow-500'
        };
      case 'NEEDS_IMPROVEMENT':
      case 'BAD': 
        return {
          stroke: 'stroke-red-500',
          text: 'text-red-700',
          bg: 'bg-red-50',
          gradient: 'from-red-400 to-red-500'
        };
      default: 
        return {
          stroke: 'stroke-neutral-300',
          text: 'text-neutral-400',
          bg: 'bg-neutral-50',
          gradient: 'from-neutral-300 to-neutral-400'
        };
    }
  };

  const statusColors = getStatusColor(score.status);
  const statusText = isNA ? 'Not Available' : score.status.replace('_', ' ');

  return (
    <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm shadow-soft border border-neutral-100 p-6">
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary-100 opacity-30 blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-secondary-100 opacity-30 blur-xl"></div>
      
      <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">Financial Health Overview</h3>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="47"
              className="stroke-neutral-200"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="47"
              className={statusColors.stroke}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s ease-out'
              }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${statusColors.text}`}>
              {isNA ? 'N/A' : `${score.value}`}
            </span>
            <span className="text-xs text-neutral-500 mt-1">Total Score</span>
          </div>
          
          {/* Decorative dots around the circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-300"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-300"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-300"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-300"></div>
        </div>
        
        <div className="flex flex-col items-center md:items-start space-y-4 md:flex-1">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Current Status</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusColors.bg}`}>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusColors.gradient} mr-2`}></div>
              <span className={`text-sm font-medium ${statusColors.text}`}>{statusText}</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500 mb-1">Target Score</p>
            <p className="text-lg font-semibold text-neutral-800">100%</p>
          </div>
          
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${statusColors.gradient}`}
              style={{ 
                width: `${animatedPercentage}%`,
                transition: 'width 1s ease-out'
              }}
            ></div>
          </div>
          
          <p className="text-xs text-neutral-500">
            {isNA 
              ? 'Add more financial data to get your score' 
              : percentage >= 80 
                ? 'Great job! Your finances are in excellent shape.' 
                : percentage >= 60 
                  ? 'Good progress! Keep improving your financial habits.' 
                  : 'There\'s room for improvement in your financial health.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalScoreDisplay; 