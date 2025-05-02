// src/utils/phoneValidation.js

/**
 * Validates a phone number using the Numverify API
 * @param {string} phoneNumber - Full phone number with country code
 * @returns {Promise<Object>} - Validation result
 */
export const validatePhoneNumber = async (phoneNumber) => {
    try {
      // Remove non-digit characters from the phone number
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // The API endpoint
      const apiUrl = `https://apilayer.net/api/validate?access_key=7f5595d7792e63d5558c8fa08ef46e55&number=${cleanNumber}&format=1`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.info || 'Failed to validate phone number');
      }
      
      return {
        isValid: data.valid,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('Phone validation error:', error.message);
      return {
        isValid: false,
        data: null,
        error: error.message
      };
    }
  };