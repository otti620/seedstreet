"use client";

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Users, MessageCircle, User, Search, TrendingUp, 
  Heart, Bookmark, Send, ArrowLeft, Plus, Settings, 
  LogOut, Bell, Filter, Sparkles, DollarSign, Eye,
  MoreVertical, Check, ChevronRight, X, Menu, Home
} from 'lucide-react';
import BottomNav from './BottomNav';
import MenuItem from './MenuItem';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from '@/components/screens/AuthScreen';
import RoleSelectorScreen from './screens/RoleSelectorScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import StartupDetailScreen from './screens/StartupDetailScreen'; // Import the new StartupDetailScreen component
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define TypeScript interfaces for data structures
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  name: string | null;
  role: 'investor' | 'founder' | null;
  onboarding_complete: boolean;
  bookmarked_startups: string[]; // Array of startup IDs
  interested_startups: string[]; // Array of startup IDs
}

interface Startup {
  id: string; // Changed to string to match UUID
  name: string;
  logo: string; // Assuming logo is a string (e.g., emoji or URL)
  tagline: string;
  description: string;
  category: string;
  room_members: number; // Changed to match schema
  active_chats: number; // Changed to match schema
  interests: number;
  founder_name: string; // Changed to match schema
  location: string; // Assuming location is a string
}

interface Chat {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_logo: string;
  last_message_text: string;
  last_message_timestamp: string;
  unread_count: number;
  isOnline: boolean; // This might need to be derived or fetched separately
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  read: boolean;
}

interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: string[]; // Array of user IDs who liked
  comments_count: number;
}


const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [messageInput, setMessageInput] = useState('');
  
  // Real data states
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // For current chat messages

  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Auto-advance from splash
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Supabase Auth Session Management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        // Clear local states related to user data
        // setBookmarkedStartups([]); // These are now derived from userProfile
        // setInterestedStartups([]); // These are now derived from userProfile
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    });

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfile(null);
        setCurrentScreen('auth');
      }
      setLoadingSession(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  // Fetch User Profile
  const fetchUserProfile = async (userId: string) => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile.");
      setUserProfile(null);
      setUserRole(null);
      // If profile doesn't exist, might need to redirect to role selection or profile creation
      setCurrentScreen('roleSelector'); 
    } else if (data) {
      setUserProfile(data as Profile);
      setUserRole(data.role);
      if (!data.onboarding_complete) {
        setCurrentScreen('roleSelector');
      } else {
        setCurrentScreen('home');
      }
    } else {
      // User exists but no profile data found, direct to role selector
      setCurrentScreen('roleSelector');
    }
    setLoadingData(false);
  };

  // Fetch Startups (for InvestorFeed)
  useEffect(() => {
    if (isLoggedIn && userRole === 'investor' && currentScreen === 'home' && activeTab === 'home') {
      const fetchStartups = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'Approved'); // Only show approved startups

        if (error) {
          console.error("Error fetching startups:", error);
          toast.error("Failed to load startups.");
          setStartups([]);
        } else if (data) {
          setStartups(data as Startup[]);
        }
        setLoadingData(false);
      };
      fetchStartups();
    }
  }, [isLoggedIn, userRole, currentScreen, activeTab]);

  // Update bookmarked/interested startups from profile
  const bookmarkedStartups = userProfile?.bookmarked_startups || [];
  const interestedStartups = userProfile?.interested_startups || [];

  // Toggle bookmark
  const toggleBookmark = async (startupId: string) => {
    if (!userProfile) {
      toast.error("Please log in to bookmark startups.");
      return;
    }

    const currentBookmarks = userProfile.bookmarked_startups || [];
    const isBookmarked = currentBookmarks.includes(startupId);
    const newBookmarks = isBookmarked
      ? currentBookmarks.filter(id => id !== startupId)
      : [...currentBookmarks, startupId];

    const { error } = await supabase
      .from('profiles')
      .update({ bookmarked_startups: newBookmarks })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to update bookmarks: " + error.message);
      console.error("Error updating bookmarks:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, bookmarked_startups: newBookmarks } : null);
      toast.success(isBookmarked ? "Bookmark removed!" : "Startup bookmarked!");
    }
  };

  // Toggle interest
  const toggleInterest = async (startupId: string) => {
    if (!userProfile) {
      toast.error("Please log in to signal interest.");
      return;
    }

    const currentInterests = userProfile.interested_startups || [];
    const isInterested = currentInterests.includes(startupId);
    const newInterests = isInterested
      ? currentInterests.filter(id => id !== startupId)
      : [...currentInterests, startupId];

    const { error } = await supabase
      .from('profiles')
      .update({ interested_startups: newInterests })
      .eq('id', userProfile.id);

    if (error) {
      toast.error("Failed to update interest: " + error.message);
      console.error("Error updating interest:", error);
    } else {
      setUserProfile(prev => prev ? { ...prev, interested_startups: newInterests } : null);
      toast.success(isInterested ? "Interest removed!" : "Interest signaled!");
    }
  };

  // If session is still loading, show splash screen or a loading indicator
  if (loadingSession) {
    return <SplashScreen />;
  }

  // SCREENS

  // 1. SPLASH SCREEN (only shown initially if not authenticated)
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  // 2. ONBOARDING
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen setCurrentScreen={setCurrentScreen} />;
  }

  // 3. AUTH (SIGN IN / SIGN UP)
  if (currentScreen === 'auth') {
    return <AuthScreen setCurrentScreen={setCurrentScreen} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
  }

  // 4. ROLE SELECTOR
  if (currentScreen === 'roleSelector') {
    return <RoleSelectorScreen setCurrentScreen={setCurrentScreen} setUserRole={setUserRole} setActiveTab={setActiveTab} />;
  }

  // 5. HOME / FEED (Different for Investor vs Founder)
  if (currentScreen === 'home' && activeTab === 'home') {
    return (
      <HomeScreen
        userRole={userRole}
        startups={startups}
        bookmarkedStartups={bookmarkedStartups}
        interestedStartups={interestedStartups}
        toggleBookmark={toggleBookmark}
        toggleInterest={toggleInterest}
        setSelectedStartup={setSelectedStartup}
        setSelectedChat={setSelectedChat}
        setCurrentScreen={setCurrentScreen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  // 6. STARTUP DETAIL PAGE
  if (currentScreen === 'startupDetail' && selectedStartup) {
    return (
      <StartupDetailScreen
        selectedStartup={selectedStartup}
        bookmarkedStartups={bookmarkedStartups}
        interestedStartups={interestedStartups}
        toggleBookmark={toggleBookmark}
        toggleInterest={toggleInterest}
        setCurrentScreen={setCurrentScreen}
        setSelectedChat={setSelectedChat}
        activeTab={activeTab}
        userRole={userRole}
        setActiveTab={setActiveTab}
      />
    );
  }

  // 7. CHATS LIST
  if (currentScreen === 'home' && activeTab === 'chats') {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Chats 💬</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex gap-6">
            <button className="py-3 text-sm font-semibold text-purple-700 border-b-2 border-purple-700">
              DMs
            </button>
            <button className="py-3 text-sm font-semibold text-gray-500">
              Rooms
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  setCurrentScreen('chat');
                }}
                className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-2xl">
                    {chat.startup_logo}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.startup_name}</h3>
                    <span className="text-xs text-gray-500">{chat.last_message_timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                    {chat.last_message_text}
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{chat.unread_count}</span>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                😴
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No chats yet</h3>
              <p className="text-gray-600 mb-6">Slide into some founder DMs 🚀</p>
              <button onClick={() => setActiveTab('home')} className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg">
                Browse Startups
              </button>
            </div>
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
    );
  }

  // 8. CHAT CONVERSATION
  if (currentScreen === 'chat' && selectedChat) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => {
              setCurrentScreen('home');
              setActiveTab('chats');
            }} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl">
                  {selectedChat.startup_logo}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{selectedChat.startup_name}</h2>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${msg.sent ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl p-3 ${
                  msg.sent 
                    ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white rounded-br-md' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500">{msg.created_at}</span>
                  {msg.sent && <Check className="w-3 h-3 text-teal-500" />}
                </div>
              </div>
            </div>
          ))}

          {/* Interest Signal Card */}
          <div className="mx-auto max-w-md">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-float">👀</span>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">You signaled interest!</h4>
                  <p className="text-xs opacity-90">The founder knows you're serious about this</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex items-end gap-2">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600">
              <Plus className="w-5 h-5" />
            </button>
            <div className="flex-1 min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl px-4 py-2 flex items-center">
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 9. PROFILE
  if (currentScreen === 'home' && activeTab === 'profile') {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-700 to-teal-600 px-6 pt-12 pb-20">
          <div className="flex justify-end mb-4">
            <button className="text-white">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-700 text-3xl font-bold mb-3 shadow-xl">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                userProfile?.name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <h2 className="text-2xl font-bold mb-1">{userProfile?.name || userProfile?.email || 'User Name'}</h2>
            <p className="text-white/80 text-sm mb-3">{userProfile?.email || 'user@email.com'}</p>
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
              {userRole === 'investor' ? '💰 Investor' : '💡 Founder'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 -mt-12 overflow-y-auto px-6 pb-24">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Your Activity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{bookmarkedStartups.length}</div>
                <div className="text-xs text-gray-500 mt-1">Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{interestedStartups.length}</div>
                <div className="text-xs text-gray-500 mt-1">Interested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div> {/* Placeholder for committed */}
                <div className="text-xs text-gray-500 mt-1">Committed</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <MenuItem icon={<User />} label="Edit Profile" onClick={() => toast.info("Edit Profile coming soon!")} />
            <MenuItem icon={<Bell />} label="Notifications" onClick={() => toast.info("Notifications coming soon!")} />
            <MenuItem icon={<Bookmark />} label="Saved Startups" count={bookmarkedStartups.length} onClick={() => toast.info("Saved Startups list coming soon!")} />
            <MenuItem icon={<Settings />} label="Settings" onClick={() => toast.info("Settings coming soon!")} />
            <MenuItem icon={<MessageCircle />} label="Help & Support" onClick={() => toast.info("Help & Support coming soon!")} />
          </div>

          {/* Logout */}
          <button 
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                toast.error("Failed to log out: " + error.message);
              } else {
                toast.success("Logged out successfully!");
                setIsLoggedIn(false);
                setUserRole(null);
                setCurrentScreen('auth'); // Redirect to auth screen after logout
              }
            }}
            className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
    );
  }

  // 10. COMMUNITY FEED
  if (currentScreen === 'home' && activeTab === 'community') {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">What's happening ✨</h1>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {communityPosts.length > 0 ? (
            communityPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl flex-shrink-0">
                    {post.author_avatar_url ? (
                      <img src={post.author_avatar_url} alt="Author Avatar" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      post.author_name?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{post.author_name}</span> posted:
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-700 mt-2">{post.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                😴
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No community posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share something exciting!</p>
              <button onClick={() => toast.info("Create Post coming soon!")} className="px-6 py-3 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg">
                Create Post ✨
              </button>
            </div>
          )}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
    );
  }

  return null;
};

export default SeedstreetApp;