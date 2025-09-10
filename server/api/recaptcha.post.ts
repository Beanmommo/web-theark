import { defineEventHandler, readBody } from 'h3';
import axios from 'axios';

export default defineEventHandler(async (event) =>
{
  const { token } = await readBody(event); // Extract the token from the request body
  const config = useRuntimeConfig(); // Access runtime config
  const secretKey = config.recaptchaSecretKey; // Retrieve the reCAPTCHA secret key

  if (!token)
  {
    return {
      success: false,
      message: 'No reCAPTCHA token provided',
    };
  }

  try
  {
    // Send the token to Google's reCAPTCHA verification API
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: token,
      },
    });

    const { success, score, 'error-codes': errorCodes } = response.data;

    if (!success || score < 0.5)
    {
      // If verification failed or the score is too low
      return {
        success: false,
        message: 'Failed reCAPTCHA verification',
        score,
        errorCodes,
      };
    }

    // If verification succeeded
    return {
      success: true,
      message: 'reCAPTCHA verified successfully',
      score,
    };
  } catch (error)
  {
    // Handle any errors during the verification request
    return {
      success: false,
      message: 'Error verifying reCAPTCHA',
      error: error
    };
  }
});
