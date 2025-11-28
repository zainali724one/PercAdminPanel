import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabase'; // Import the real supabase client

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await checkAdminRole(session.user);
      }
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await checkAdminRole(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (currentUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles") 
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (error) {
          console.error("Error fetching user role:", error);
          // Handle error appropriately, maybe force logout or set default role
          return;
      }

      if (data?.role === "admin") {
        setUser(currentUser);
        setIsAdmin(true);
      } else {
        console.warn("Access Denied: Admin rights required.");
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Unexpected error checking admin role:", error);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = { user, isAdmin, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};