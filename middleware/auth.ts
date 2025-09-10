export default defineNuxtRouteMiddleware((to, _) =>
{
  const nuxtApp = useNuxtApp();

  if (nuxtApp.ssrContext)
  {
    console.log('Skipping Firebase check on server');
    return;
  }
  const { isLogin } = useAuth()

  if (to.path === '/profile' && !isLogin.value)
  {
    return navigateTo('/')
  }

})