import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthAction {
  type: 'LOGIN' | 'LOGOUT' | 'SET_LOADING' | 'SET_USER' | 'ADD_USER' | 'UPDATE_ENROLLMENT' | 'COMPLETE_COURSE' | 'UPDATE_PROFILE';
  payload?: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_ENROLLMENT':
      return {
        ...state,
        user: state.user ? { ...state.user, enrolledCourses: action.payload } : null,
      };
    case 'COMPLETE_COURSE':
      return {
        ...state,
        user: state.user ? { 
          ...state.user, 
          completedCourses: [...(state.user.completedCourses || []), action.payload],
          enrolledCourses: state.user.enrolledCourses.filter(id => id !== action.payload)
        } : null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'ADD_USER':
      // This action is handled by updating Supabase
      return state;
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'enrolledCourses' | 'completedCourses'>) => Promise<void>;
  logout: () => void;
  addUserToAuth: (userData: any) => void;
  updateUserEnrollment: (enrolledCourses: string[]) => void;
  completeCourse: (courseId: string) => void;
  updateUserProfile?: (profileData: any) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get all users from localStorage or Supabase
const getAllUsers = async () => {
  try {
    // Try to get users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    if (users && users.length > 0) {
      return users;
    }
  } catch (error) {
    console.error('Error fetching users from Supabase:', error);
  }
  
  // Fallback to localStorage if Supabase fails
  const storedUsers = localStorage.getItem('allUsers');
  const defaultUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+2348012345678',
      role: 'learner' as const,
      password: 'password',
      enrolledCourses: ['1', '2'], // Pre-enrolled for demo user
      completedCourses: [], // Initialize completed courses
      bio: 'Passionate learner exploring new technologies and skills.',
      location: 'Lagos, Nigeria',
      occupation: 'Software Developer',
      education: 'Bachelor of Computer Science',
      avatar: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+2348012345679',
      role: 'admin' as const,
      password: 'password',
      enrolledCourses: [],
      completedCourses: [],
      bio: 'Platform administrator managing the learning ecosystem.',
      location: 'Abuja, Nigeria',
      occupation: 'Platform Administrator',
      education: 'Master of Education Technology',
      avatar: null,
      createdAt: new Date().toISOString(),
    },
  ];

  if (storedUsers) {
    const users = JSON.parse(storedUsers);
    // Ensure all users have completedCourses array and profile fields
    return users.map((user: any) => ({
      ...user,
      completedCourses: user.completedCourses || [],
      bio: user.bio || '',
      location: user.location || '',
      occupation: user.occupation || '',
      education: user.education || '',
      avatar: user.avatar || null
    }));
  } else {
    // Initialize with default users
    localStorage.setItem('allUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        // Use a simpler query that doesn't require specific permissions
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (!error) {
          setIsSupabaseConnected(true);
          console.log('Supabase connected successfully');
        } else {
          console.error('Supabase connection error:', error);
          setIsSupabaseConnected(false);
        }
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setIsSupabaseConnected(false);
      }
    };

    checkSupabaseConnection();

    // Check for stored auth data
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Get user data from Supabase
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          
          if (userData) {
            // Get user enrollments
            const { data: enrollments, error: enrollmentsError } = await supabase
              .from('user_courses')
              .select('course_id, status')
              .eq('user_id', userData.id);
            
            if (enrollmentsError) throw enrollmentsError;
            
            // Format user data to match our app's structure
            const formattedUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio || '',
              location: userData.location || '',
              occupation: userData.occupation || '',
              education: userData.education || '',
              avatar: userData.avatar_url,
              enrolledCourses: enrollments
                ? enrollments.filter(e => e.status === 'enrolled').map(e => e.course_id)
                : [],
              completedCourses: enrollments
                ? enrollments.filter(e => e.status === 'completed').map(e => e.course_id)
                : [],
              createdAt: userData.created_at,
            };
            
            dispatch({ type: 'LOGIN', payload: formattedUser });
            return;
          }
        } catch (error) {
          console.error('Error fetching user data from Supabase:', error);
        }
      }
      
      // Fallback to localStorage if Supabase auth fails
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Ensure user has completedCourses array and profile fields
        const updatedUser = {
          ...user,
          completedCourses: user.completedCourses || [],
          bio: user.bio || '',
          location: user.location || '',
          occupation: user.occupation || '',
          education: user.education || '',
          avatar: user.avatar || null
        };
        dispatch({ type: 'LOGIN', payload: updatedUser });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (isSupabaseConnected) {
        // Try to sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Get user data from Supabase
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userError) throw userError;
          
          if (userData) {
            // Get user enrollments
            const { data: enrollments, error: enrollmentsError } = await supabase
              .from('user_courses')
              .select('course_id, status')
              .eq('user_id', userData.id);
            
            if (enrollmentsError) throw enrollmentsError;
            
            // Format user data to match our app's structure
            const formattedUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio || '',
              location: userData.location || '',
              occupation: userData.occupation || '',
              education: userData.education || '',
              avatar: userData.avatar_url,
              enrolledCourses: enrollments
                ? enrollments.filter(e => e.status === 'enrolled').map(e => e.course_id)
                : [],
              completedCourses: enrollments
                ? enrollments.filter(e => e.status === 'completed').map(e => e.course_id)
                : [],
              createdAt: userData.created_at,
            };
            
            dispatch({ type: 'LOGIN', payload: formattedUser });
            return;
          }
        }
      }
      
      // Fallback to localStorage if Supabase auth fails
      const allUsers = await getAllUsers();
      const user = allUsers.find((u: any) => u.email === email);
      
      if (user && user.password === password) {
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        dispatch({ type: 'LOGIN', payload: userWithoutPassword });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Invalid credentials');
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'enrolledCourses' | 'completedCourses'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (isSupabaseConnected) {
        console.log('Attempting to register with Supabase');
        // Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: 'password', // Default password
          options: {
            data: {
              name: userData.name,
              role: userData.role
            }
          }
        });
        
        if (authError) {
          console.error('Supabase auth signup error:', authError);
          throw authError;
        }
        
        console.log('Auth data:', authData);
        
        if (authData.user) {
          // Create user profile in the users table
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio || null,
              location: userData.location || null,
              occupation: userData.occupation || null,
              education: userData.education || null,
              avatar_url: null,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (userError) {
            console.error('Supabase user insert error:', userError);
            throw userError;
          }
          
          console.log('New user created:', newUser);
          
          // Format user data to match our app's structure
          const formattedUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            bio: newUser.bio || '',
            location: newUser.location || '',
            occupation: newUser.occupation || '',
            education: newUser.education || '',
            avatar: newUser.avatar_url,
            enrolledCourses: [],
            completedCourses: [],
            createdAt: newUser.created_at,
          };
          
          dispatch({ type: 'LOGIN', payload: formattedUser });
          return;
        }
      }
      
      // Fallback to localStorage if Supabase fails
      console.log('Falling back to localStorage for registration');
      const allUsers = await getAllUsers();
      
      // Check if user already exists
      const existingUser = allUsers.find((u: any) => u.email === userData.email);
      if (existingUser) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error('User already exists');
      }
      
      // Create new user with empty arrays and profile fields
      const newUser: User & { password: string } = {
        ...userData,
        id: Date.now().toString(),
        enrolledCourses: [], // Start with no enrolled courses
        completedCourses: [], // Start with no completed courses
        bio: userData.bio || '',
        location: userData.location || '',
        occupation: userData.occupation || '',
        education: userData.education || '',
        avatar: null,
        createdAt: new Date().toISOString(),
        password: 'password', // Default password for registration
      };
      
      // Add to all users
      const updatedUsers = [...allUsers, newUser];
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      // Remove password before storing current user
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      dispatch({ type: 'LOGIN', payload: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Registration failed. Please try again.');
    }
  };

  const addUserToAuth = async (userData: any) => {
    try {
      if (isSupabaseConnected) {
        // Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password || 'password',
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role
          }
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          // Create user profile in the users table
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              bio: userData.bio || null,
              location: userData.location || null,
              occupation: userData.occupation || null,
              education: userData.education || null,
              avatar_url: null,
              created_at: new Date().toISOString()
            });
          
          if (userError) throw userError;
          
          return;
        }
      }
      
      // Fallback to localStorage if Supabase fails
      const allUsers = await getAllUsers();
      
      // Check if user already exists
      const existingUser = allUsers.find((u: any) => u.email === userData.email);
      if (existingUser) {
        return; // User already exists
      }
      
      // Add password to user data and ensure empty arrays for new users
      const userWithPassword = {
        ...userData,
        password: userData.password || 'password', // Use provided password or default
        enrolledCourses: userData.enrolledCourses || [], // Start with empty array if not provided
        completedCourses: userData.completedCourses || [], // Start with empty array if not provided
        bio: userData.bio || '',
        location: userData.location || '',
        occupation: userData.occupation || '',
        education: userData.education || '',
        avatar: userData.avatar || null,
      };
      
      // Add to all users
      const updatedUsers = [...allUsers, userWithPassword];
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUserEnrollment = async (enrolledCourses: string[]) => {
    if (!state.user) return;

    try {
      if (isSupabaseConnected) {
        // First, get existing enrollments
        const { data: existingEnrollments, error: fetchError } = await supabase
          .from('user_courses')
          .select('course_id, status')
          .eq('user_id', state.user.id);
        
        if (fetchError) throw fetchError;
        
        // Find courses to add (new enrollments)
        const existingCourseIds = existingEnrollments?.map(e => e.course_id) || [];
        const coursesToAdd = enrolledCourses.filter(id => !existingCourseIds.includes(id));
        
        // Add new enrollments
        if (coursesToAdd.length > 0) {
          const enrollmentsToInsert = coursesToAdd.map(courseId => ({
            id: crypto.randomUUID(),
            user_id: state.user.id,
            course_id: courseId,
            status: 'enrolled',
            progress: 0,
            created_at: new Date().toISOString()
          }));
          
          const { error: insertError } = await supabase
            .from('user_courses')
            .insert(enrollmentsToInsert);
          
          if (insertError) throw insertError;
          
          // Update course enrollment count
          for (const courseId of coursesToAdd) {
            const { error: updateError } = await supabase.rpc('increment_enrollment_count', {
              course_id: courseId
            });
            
            if (updateError) console.error('Error updating enrollment count:', updateError);
          }
        }
        
        // Update user in context
        dispatch({ type: 'UPDATE_ENROLLMENT', payload: enrolledCourses });
        return;
      }
      
      // Fallback to localStorage if Supabase fails
      // Update user in localStorage
      const allUsers = await getAllUsers();
      const updatedUsers = allUsers.map((u: any) => 
        u.id === state.user?.id ? { ...u, enrolledCourses } : u
      );
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Update current user in localStorage
      const updatedUser = { ...state.user, enrolledCourses };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update context state
      dispatch({ type: 'UPDATE_ENROLLMENT', payload: enrolledCourses });
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  const completeCourse = async (courseId: string) => {
    if (!state.user) return;

    try {
      if (isSupabaseConnected) {
        // Update user_courses status to 'completed'
        const { error: updateError } = await supabase
          .from('user_courses')
          .update({ status: 'completed' })
          .eq('user_id', state.user.id)
          .eq('course_id', courseId);
        
        if (updateError) throw updateError;
        
        // Create certificate
        const certificateId = `cert-${Date.now()}`;
        const { error: certError } = await supabase
          .from('certificates')
          .insert({
            id: certificateId,
            user_id: state.user.id,
            course_id: courseId,
            issue_date: new Date().toISOString(),
            template: 'default',
            url: `https://example.com/certificates/${certificateId}.pdf`
          });
        
        if (certError) throw certError;
        
        // Get updated enrollments
        const { data: enrollments, error: fetchError } = await supabase
          .from('user_courses')
          .select('course_id, status')
          .eq('user_id', state.user.id);
        
        if (fetchError) throw fetchError;
        
        // Update user in context
        const updatedUser = { 
          ...state.user, 
          enrolledCourses: enrollments
            ? enrollments.filter(e => e.status === 'enrolled').map(e => e.course_id)
            : state.user.enrolledCourses.filter(id => id !== courseId),
          completedCourses: [
            ...(state.user.completedCourses || []),
            courseId
          ]
        };
        
        dispatch({ type: 'SET_USER', payload: updatedUser });
        return;
      }
      
      // Fallback to localStorage if Supabase fails
      // Update user in localStorage
      const allUsers = await getAllUsers();
      const updatedUsers = allUsers.map((u: any) => 
        u.id === state.user?.id ? { 
          ...u, 
          completedCourses: [...(u.completedCourses || []), courseId],
          enrolledCourses: u.enrolledCourses.filter((id: string) => id !== courseId)
        } : u
      );
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Update current user in localStorage
      const updatedUser = { 
        ...state.user, 
        completedCourses: [...(state.user.completedCourses || []), courseId],
        enrolledCourses: state.user.enrolledCourses.filter(id => id !== courseId)
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update context state
      dispatch({ type: 'COMPLETE_COURSE', payload: courseId });
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  const updateUserProfile = async (profileData: any) => {
    if (!state.user) return;

    try {
      if (isSupabaseConnected) {
        // Update user profile in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            bio: profileData.bio,
            location: profileData.location,
            occupation: profileData.occupation,
            education: profileData.education,
            avatar_url: profileData.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.user.id);
        
        if (error) throw error;
        
        // Update user in context
        dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
        return;
      }
      
      // Fallback to localStorage if Supabase fails
      // Update user in localStorage
      const allUsers = await getAllUsers();
      const updatedUsers = allUsers.map((u: any) => 
        u.id === state.user?.id ? { ...u, ...profileData } : u
      );
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Update current user in localStorage
      const updatedUser = { ...state.user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update context state
      dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConnected) {
        await supabase.auth.signOut();
      }
      
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error logging out:', error);
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      addUserToAuth,
      updateUserEnrollment,
      completeCourse,
      updateUserProfile,
      isSupabaseConnected,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}