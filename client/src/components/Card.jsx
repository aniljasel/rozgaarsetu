import React from 'react';

const Card = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`glass-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
