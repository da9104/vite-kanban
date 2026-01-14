import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, SetStateAction, ReactNode } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { usePresenceStore, type User } from "@/store/usePresenceStore";
import PresenceManager from './PresenceManager';
import { getColorFromString } from "@/lib/colors"; // Import the color utility

type StringSetter = Dispatch<SetStateAction<string>>;

interface AuthContextValue {
  session: any | null; 
  loading: boolean;
  username: string;
  randomUsername: () => string;
  setUsername: StringSetter;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  username: '',
  randomUsername: () => '', 
  setUsername: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  
  const setMe = usePresenceStore((state) => state.setMe);

  const randomUsername = () => {
    return `@user${Date.now().toString().slice(-4)}`;
  };

 
  // Handles setting the session from Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handles syncing user presence and connecting to socket when session changes
  useEffect(() => {
    if (loading) return; // Wait until the initial session is loaded

    let currentUsername: string;
    let currentUser: User;

    if (session?.user) {
      // Authenticated user logic
      currentUsername = session.user.user_metadata.name || session.user.email;
      currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: currentUsername,
        avatar_url: session.user.user_metadata.avatar_url,
        color: getColorFromString(session.user.id), // Assign color from user ID
      };
      
      setMe(currentUser);
    } else {
      // Guest user logic
      currentUsername = localStorage.getItem("username") || randomUsername();
      const guestId = localStorage.getItem("guestId") || `guest-${Date.now()}`;
      localStorage.setItem("username", currentUsername);
      localStorage.setItem("guestId", guestId);

      currentUser = { 
        id: guestId, 
        email: "", 
        name: currentUsername,
        color: getColorFromString(guestId), // Assign color from guest ID
      };
      
      setMe(currentUser);
    }
    setUsername(currentUsername);

  }, [session, loading, setMe, setUsername]); // Re-runs whenever session or loading state changes

  return (
    <AuthContext.Provider 
    value={{ session, loading, randomUsername, username, setUsername }}
    >
      {!loading && (
        <>
          <PresenceManager />
          {children}
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAppContext = () => useContext(AuthContext);
export { AuthContext as default }