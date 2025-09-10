export default defineNuxtPlugin(async (nuxtApp) =>
{
  const { $fireAuth } = nuxtApp;

  if (!$fireAuth)
  {
    console.error("Firebase is not initialized yet.");
    return;
  }

  const { me } = useAuth();

  try
  {
    await me(); // Fetch user data after Firebase is initialized
  } catch (error)
  {
    console.error("Error initializing user:", error);
  }
});