import React from 'react';
import './errorScreen.scss';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  return (
    <div className="error-screen">
      <h1>Error</h1>
      <p>{message}</p>
    </div>
  );
};

export default ErrorScreen;
