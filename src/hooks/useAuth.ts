import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Assuming the user object has a 'role' property
        // You might need to adjust this based on your user schema
        const userRole = user.user_metadata?.role;
        setIsAdmin(userRole === 'admin');
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const userRole = currentUser.user_metadata?.role;
        setIsAdmin(userRole === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin };
};
