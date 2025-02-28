import React, { useState } from 'react';
import { useErrorHandler, ErrorType, createError } from '../core/errors';
import { apiClient } from '../core/api';

/**
 * Example component demonstrating the error handling system
 */
const ErrorHandlingExample: React.FC = () => {
  const { handleError, hasError, getErrorMessage, clearErrors, errorMessage } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Example of API call with error handling
  const handleApiCall = async () => {
    setLoading(true);
    clearErrors();
    
    try {
      // Example API call
      await apiClient.post('/auth/login', formData);
      alert('Success! (This would normally navigate to another page)');
    } catch (error) {
      // Use our error handler to process the error
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example of handling a validation error
  const handleValidation = () => {
    clearErrors();
    
    // Validate email
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // If we have errors, create a validation error
    if (Object.keys(errors).length > 0) {
      const validationError = createError(
        ErrorType.VALIDATION,
        'Please fix the errors in the form',
        { fieldErrors: errors }
      );
      
      handleError(validationError);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate
    if (handleValidation()) {
      // Then make API call
      handleApiCall();
    }
  };

  return (
    <div className="error-handling-example">
      <h2>Error Handling Example</h2>
      
      {/* Display general error message */}
      {errorMessage && (
        <div className="error-banner">{errorMessage}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={hasError('email') ? 'input-error' : ''}
          />
          {hasError('email') && (
            <div className="error-message">{getErrorMessage('email')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={hasError('password') ? 'input-error' : ''}
          />
          {hasError('password') && (
            <div className="error-message">{getErrorMessage('password')}</div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </button>
          <button 
            type="button" 
            onClick={() => {
              // Example of creating a network error
              handleError(createError(
                ErrorType.NETWORK,
                'This is an example network error'
              ));
            }}
          >
            Simulate Network Error
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .error-handling-example {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .error-banner {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .input-error {
          border-color: #dc3545;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background-color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default ErrorHandlingExample; 