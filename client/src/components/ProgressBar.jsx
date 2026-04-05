import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
    const percent = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
