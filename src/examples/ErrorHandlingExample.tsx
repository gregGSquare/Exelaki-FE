import React, { useState } from 'react';
import { useErrorHandler, ErrorType, createError } from '../core/errors';
import { apiClient } from '../core/api';

// Styles as a JavaScript object for inline styling
const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  inputError: {
    width: '100%',
    padding: '8px',
    border: '1px solid #dc3545',
    borderRadius: '4px',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '5px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
  },
};

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
    <div style={styles.container}>
      <h2>Error Handling Example</h2>
      
      {/* Display general error message */}
      {errorMessage && (
        <div style={styles.errorBanner}>{errorMessage}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={hasError('email') ? styles.inputError : styles.input}
          />
          {hasError('email') && (
            <div style={styles.errorMessage}>{getErrorMessage('email')}</div>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={hasError('password') ? styles.inputError : styles.input}
          />
          {hasError('password') && (
            <div style={styles.errorMessage}>{getErrorMessage('password')}</div>
          )}
        </div>
        
        <div style={styles.formActions}>
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
          <button 
            type="button" 
            style={styles.button}
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
    </div>
  );
};

export default ErrorHandlingExample; 