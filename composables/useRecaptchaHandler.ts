import { ref } from 'vue';

interface ReCaptchaResult
{
  success: boolean;
  score?: number;
  error?: string;
}

export const useReCaptchaHandler = () =>
{
  const isVerifying = ref(false);

  const verifyRecaptcha = async (action: string): Promise<ReCaptchaResult> =>
  {
    isVerifying.value = true;

    try
    {
      // Use the Nuxt module's composable - action is passed when creating the composable
      const { execute } = useChallengeV3(action);

      // Execute reCAPTCHA to get the token (no parameters needed)
      const token = await execute();

      // Send the token to the server for verification
      const response = await $fetch<{ success: boolean; score?: number; 'error-codes'?: string[] }>(
        '/api/recaptcha',
        {
          method: 'POST',
          body: { token },
        }
      );

      if (response.success)
      {
        return { success: true, score: response.score };
      } else
      {
        const error = response['error-codes']?.join(', ') || 'Failed reCAPTCHA verification';
        return { success: false, error };
      }
    } catch (error)
    {
      console.error('Error verifying reCAPTCHA:', error);
      return { success: false, error: 'Error verifying reCAPTCHA.' };
    } finally
    {
      isVerifying.value = false;
    }
  };

  return {
    verifyRecaptcha,
    isVerifying,
  };
};
