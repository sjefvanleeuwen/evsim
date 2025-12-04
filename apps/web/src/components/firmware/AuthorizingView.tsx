import React from 'react';

export const AuthorizingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
      <h2 className="text-2xl font-bold mb-2">Authorizing...</h2>
      <p className="text-gray-400 text-sm">Please wait while we verify your account</p>
    </div>
  );
};
