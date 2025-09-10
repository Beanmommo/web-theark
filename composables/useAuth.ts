import { useAuthUser } from "./useAuthUser";
import type { User } from "../types/auth";

import
{
  GoogleAuthProvider,
  getIdToken,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithCustomToken
} from "firebase/auth";

export const useAuth = () =>
{
  const { $fireAuth } = useNuxtApp();
  if (!$fireAuth)
  {
    throw new Error("Firebase Auth is not initialized");
  }
  const authUser = useAuthUser();
  const cookie = ref<string | null>(null);
  const isLogin = computed(() => !!authUser.value);

  const setUser = (user: User | null) =>
  {
    authUser.value = user
  };

  const setCookie = (value: string | null) =>
  {
    cookie.value = value;
  };

  const setUserData = (data: Partial<User>) =>
  {
    if (!authUser.value) return;
    authUser.value = {
      ...authUser.value,
      ...data,
    };
  }


  type UserResponse = {
    user: User
  }

  const handleError = (error: unknown) =>
  {
    console.error("Auth Error:", error);
    setCookie(null);
    setUser(null);
    throw error;
  };

  const getClientCookie = (name: string): string | undefined =>
  {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) =>
    {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    return cookies[name];
  };

  const me = async () =>
  {
    if (!authUser.value)
    {
      try
      {

        const data: UserResponse = await $fetch("/api/auth/me", {
          headers: useRequestHeaders(["cookie"]) as HeadersInit,
        });
        // Synchronize with client-side Firebase Auth
        const { $fireAuth } = useNuxtApp();
        const firebaseUser = $fireAuth.currentUser;
        if (!firebaseUser || firebaseUser.uid !== data.user.uid)
        {
          const token = getClientCookie("authToken");
          console.log(token)
          if (token)
          {
            await signInWithCustomToken($fireAuth, token);
          }
        }
        setUser(data.user);
      } catch (error)
      {
        handleError(error);
      }
    }

    return authUser;
  };

  const signUpNewUser = async (name: string, mobile: string, email: string, password: string) =>
  {
    try
    {
      const uid = await $fetch("/api/auth/user", {
        method: "POST",
        body: JSON.stringify({ displayName: name, email, password, phoneNumber: mobile, disabled: false, emailVerified: false }),
      });
      await $fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ uid, name, contact:mobile, email, key: uid }),
      })
      await loginWithEmail(email, password);
    } catch (error)
    {
      handleError(error);
    }
  }

  const updateUser = async (uid: string, data: Object) =>
  {
    try
    {
      await setPersistence($fireAuth, inMemoryPersistence);
      const result = await $fetch("/api/auth/update", {
        method: "POST",
        body: JSON.stringify({ uid, data }),
      });
      setUserData(data)
    } catch (error)
    {
      return error
    }
  }

  const loginWithEmail = async (email: string, password: string) =>
  {
    try
    {
      await setPersistence($fireAuth, inMemoryPersistence);
      const result = await signInWithEmailAndPassword($fireAuth, email, password)
      const firebaseIdToken = await getIdToken(result.user);
      // send firebaseIdToken to server
      const data: UserResponse = await $fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseIdToken }),
      });
      console.log(data)
      setUser(data.user);

    } catch (error)
    {
      handleError(error);
    }

    return authUser;
  }

  const loginWithGoogle = async () =>
  {
    try
    {
      const provider = new GoogleAuthProvider();
      await setPersistence($fireAuth, inMemoryPersistence);
      const result = await signInWithPopup($fireAuth, provider);
      const firebaseIdToken = await getIdToken(result.user);

      // send firebaseIdToken to server
      const data: UserResponse = await $fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseIdToken }),
      });

      // Check if user exists in database
      const existingUser = await $fetch(`/api/user/${result.user.uid}`);

      // If user doesn't exist in database, create them
      if (!existingUser) {
        const newUser = {
          uid: result.user.uid,
          name: result.user.displayName || '',
          email: result.user.email || '',
          contact: result.user.phoneNumber || '',
          key: result.user.uid
        };

        await $fetch("/api/user", {
          method: "POST",
          body: JSON.stringify(newUser),
        });
      }

      setUser(data.user);
    } catch (error)
    {
      handleError(error);
    }

    return authUser;
  };


  const signUpWithGoogle = async () =>
  {
    try
    {
      const provider = new GoogleAuthProvider();
      await setPersistence($fireAuth, inMemoryPersistence);
      const result = await signInWithPopup($fireAuth, provider);
      const firebaseIdToken = await getIdToken(result.user);
      // send firebaseIdToken to server
      const data: UserResponse = await $fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseIdToken }),
      });
      const newUser = {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        mobile: result.user.phoneNumber,
        contact: result.user.phoneNumber,
        key: result.user.uid
      }
      await $fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(newUser),
      })
      setUser(data.user);
    } catch (error)
    {
      handleError(error);
    }

    return authUser;
  };

  const logout = async () =>
  {
    const data = await $fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(data.user);
  };

  return {
    logout,
    signUpNewUser,
    signUpWithGoogle,
    updateUser,
    loginWithGoogle,
    loginWithEmail,
    me,
    isLogin
  };
};
