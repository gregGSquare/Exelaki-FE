import React from 'react';
import { Link } from 'react-router-dom';

const SignedOut: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold">You have been signed out</h1>
        <p className="mt-2 text-neutral-600">It's safe to close this window.</p>
        <Link to="/login" className="mt-6 inline-block px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Go to login</Link>
      </div>
    </div>
  );
};

export default SignedOut;


