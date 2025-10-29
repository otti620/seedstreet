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
import HomeScreen from '@/components/screens/HomeScreen'; // Corrected import path
import { supabase } from '@/integrations/supabase/client';
import { Toaster, toast } from 'sonner';

const SeedstreetApp = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userRole, setUserRole] = useState<string | null>(null); // 'investor' or 'founder'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<any>(null); // Using 'any' for simplicity, consider defining a Startup type
  const [selectedChat, setSelectedChat] = useState<any>(null); // Using 'any' for simplicity, consider defining a Chat type
  const [activeTab, setActiveTab] = useState('home');
  const [messageInput, setMessageInput] = useState('');
  const [bookmarkedStartups, setBookmarkedStartups] = useState<number[]>([]);
  const [interestedStartups, setInterestedStartups] = useState<number[]>([]);
  const [loadingSession, setLoadingSession] = useState(true); // New state for session loading

  // Auth screen specific states, moved to top level
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load user profile.");
          setIsLoggedIn(false);
          setCurrentScreen('auth');
          setLoadingSession(false);
          return;
        }

        if (profile) {
          setUserRole(profile.role);
          if (!profile.onboarding_complete) {
            setCurrentScreen('roleSelector');
          } else {
            setCurrentScreen('home');
          }
        } else {
          // User exists but no profile, direct to role selector
          setCurrentScreen('roleSelector');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        // Only set to onboarding if not already on splash
        if (currentScreen === 'splash') {
          // Splash screen will handle transition to onboarding
        } else {
          setCurrentScreen('auth');
        }
      }
      setLoadingSession(false);
    });

    // Initial session check
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile on initial session check:", profileError);
          toast.error("Failed to load user profile.");
          setIsLoggedIn(false);
          setCurrentScreen('auth');
          setLoadingSession(false);
          return;
        }

        if (profile) {
          setUserRole(profile.role);
          if (!profile.onboarding_complete) {
            setCurrentScreen('roleSelector');
          } else {
            setCurrentScreen('home');
          }
        } else {
          setCurrentScreen('roleSelector');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        // Only set to onboarding if not already on splash
        if (currentScreen === 'splash') {
          // Splash screen will handle transition to onboarding
        } else {
          setCurrentScreen('auth');
        }
      }
      setLoadingSession(false);
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array to run only once on mount

  // Mock Data (will be replaced with Supabase fetches later)
  const startups = [
    {
      id: 1,
      name: "GreenTech Africa",
      logo: "🌱",
      tagline: "Solar-powered solutions for every home",
      description: "We're making clean energy affordable and accessible across Africa. One solar panel at a time.",
      category: "Green Energy",
      roomMembers: 156,
      activeChats: 24,
      interests: 12,
      founder: "Jane Okafor",
      location: "Lagos, Nigeria"
    },
    {
      id: 2,
      name: "EduFund",
      logo: "📚",
      tagline: "Democratizing education financing",
      description: "Connecting students with investors who believe in education. Making university accessible for all.",
      category: "EdTech",
      roomMembers: 89,
      activeChats: 15,
      interests: 8,
      founder: "David Mensah",
      location: "Accra, Ghana"
    },
    {
      id: 3,
      name: "FreshCart",
      logo: "🛒",
      tagline: "Farm-to-table in 24 hours",
      description: "Direct connection between farmers and consumers. Fresh produce, fair prices, zero waste.",
      category: "AgriTech",
      roomMembers: 203,
      activeChats: 31,
      interests: 18,
      founder: "Amara Nwankwo",
      location: "Enugu, Nigeria"
    },
    {
      id: 4,
      name: "HealthHub",
      logo: "🏥",
      tagline: "Telemedicine for underserved communities",
      description: "Bringing quality healthcare to remote areas through mobile clinics and telehealth.",
      category: "HealthTech",
      roomMembers: 127,
      activeChats: 19,
      interests: 14,
      founder: "Kwame Asante",
      location: "Kumasi, Ghana"
    }
  ];

  const chats = [
    {
      id: 1,
      startupId: 1,
      startupName: "GreenTech Africa",
      startupLogo: "🌱",
      lastMessage: "Thanks for your interest! Would love to discuss more",
      timestamp: "2h ago",
      unread: 2,
      isOnline: true
    },
    {
      id: 2,
      startupId: 3,
      startupName: "FreshCart",
      startupLogo: "🛒",
      lastMessage: "Our pilot launch is next week!",
      timestamp: "1d ago",
      unread: 0,
      isOnline: false
    }
  ];

  const messages = [
    { id: 1, text: "Hi! I'm really interested in GreenTech", sent: true, timestamp: "10:30 AM" },
    { id: 2, text: "Thanks for reaching out! Great to connect", sent: false, timestamp: "10:32 AM" },
    { id: 3, text: "What's your timeline for the next funding round?", sent: true, timestamp: "10:35 AM" },
    { id: 4, text: "We're looking to close in Q1 2025. Would love to share our deck with you!", sent: false, timestamp: "10:38 AM" }
  ];

  // Toggle bookmark
  const toggleBookmark = (startupId: number) => {
    setBookmarkedStartups(prev => 
      prev.includes(startupId) 
        ? prev.filter(id => id !== startupId)
        : [...prev, startupId]
    );
  };

  // Toggle interest
  const toggleInterest = (startupId: number) => {
    setInterestedStartups(prev => 
      prev.includes(startupId) 
        ? prev.filter(id => id !== startupId)
        : [...prev, startupId]
    );
  };

  // If session is still loading, show splash screen or a loading indicator
  if (loadingSession) {
    return <SplashScreen />; // Or a dedicated loading spinner
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
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{selectedStartup.name}</h1>
            </div>
            <button onClick={() => toggleBookmark(selectedStartup.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${bookmarkedStartups.includes(selectedStartup.id) ? 'bg-gradient-to-br from-purple-700 to-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Bookmark className="w-5 h-5" fill={bookmarkedStartups.includes(selectedStartup.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero Card */}
          <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-xl">
                {selectedStartup.logo}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{selectedStartup.name}</h2>
                <p className="text-white/80">{selectedStartup.tagline}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">{selectedStartup.category}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">📍 {selectedStartup.location}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{selectedStartup.roomMembers}</div>
              <div className="text-xs text-gray-500 mt-1">Room Members</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{selectedStartup.activeChats}</div>
              <div className="text-xs text-gray-500 mt-1">Active Chats</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{selectedStartup.interests}</div>
              <div className="text-xs text-gray-500 mt-1">Interested</div>
            </div>
          </div>

          {/* The Story */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">The Story</h3>
            <p className="text-gray-700 leading-relaxed">{selectedStartup.description}</p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We're building a sustainable future by making solar energy accessible to every household in Africa. 
              Our innovative financing model allows families to pay as they use, removing the upfront cost barrier.
            </p>
          </div>

          {/* Founder */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Meet the Founder</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedStartup.founder.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedStartup.founder}</h4>
                <p className="text-sm text-gray-500">Founder & CEO</p>
              </div>
            </div>
          </div>

          {/* Why Back Us */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Why Back Us?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Proven pilot in 3 states with 500+ homes powered</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Backed by Green Energy Fund and impact investors</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">60% MoM growth in customer acquisition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white border-t border-gray-100 p-6 space-y-3">
          <button 
            onClick={() => {
              toggleInterest(selectedStartup.id);
            }}
            className={`w-full h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              interestedStartups.includes(selectedStartup.id)
                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                : 'bg-amber-50 text-amber-600 border-2 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="text-xl">👀</span>
            {interestedStartups.includes(selectedStartup.id) ? "You're interested!" : "I'm interested"}
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setSelectedChat({ startup: selectedStartup });
                setCurrentScreen('chat');
              }}
              className="flex-1 h-12 bg-gradient-to-r from-purple-700 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all"
            >
              Start a Chat 💬
            </button>
            <button className="flex-1 h-12 border-2 border-purple-700 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 active:scale-95 transition-all">
              Join Room 🚀
            </button>
          </div>
        </div>
      </div>
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
                    {chat.startupLogo}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.startupName}</h3>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{chat.unread}</span>
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
                  {selectedChat.startup?.logo || selectedChat.startupLogo}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{selectedChat.startup?.name || selectedChat.startupName}</h2>
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
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
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
              U
            </div>
            <h2 className="text-2xl font-bold mb-1">User Name</h2>
            <p className="text-white/80 text-sm mb-3">user@email.com</p>
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
                <div className="text-2xl font-bold text-gray-900">{userRole === 'investor' ? '5' : '24'}</div>
                <div className="text-xs text-gray-500 mt-1">{userRole === 'investor' ? 'Bookmarks' : 'Chats'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userRole === 'investor' ? '3' : '156'}</div>
                <div className="text-xs text-gray-500 mt-1">{userRole === 'investor' ? 'Interested' : 'Members'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userRole === 'investor' ? '2' : '12'}</div>
                <div className="text-xs text-gray-500 mt-1">{userRole === 'investor' ? 'Committed' : 'Interested'}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <MenuItem icon={<User />} label="Edit Profile" />
            <MenuItem icon={<Bell />} label="Notifications" />
            <MenuItem icon={<Bookmark />} label="Saved Startups" count={bookmarkedStartups.length} />
            <MenuItem icon={<Settings />} label="Settings" />
            <MenuItem icon={<MessageCircle />} label="Help & Support" />
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
    const communityPosts = [
      { id: 1, user: "Jane O.", action: "joined GreenTech's room", startup: "GreenTech Africa", time: "2h ago", icon: "🌱" },
      { id: 2, user: "David M.", action: "signaled interest in", startup: "EduFund", time: "5h ago", icon: "📚" },
      { id: 3, user: "Amara N.", action: "started chatting with", startup: "FreshCart investors", time: "1d ago", icon: "🛒" },
      { id: 4, user: "12 investors", action: "are chatting with", startup: "HealthHub right now", time: "Live", icon: "🏥" }
    ];

    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">What's happening ✨</h1>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {communityPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-teal-600 flex items-center justify-center text-xl flex-shrink-0">
                  {post.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{post.user}</span> {post.action}{' '}
                    <span className="font-semibold text-purple-700">{post.startup}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{post.time}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Discover CTA */}
          <div className="bg-gradient-to-br from-purple-700 to-teal-600 rounded-2xl p-6 text-white text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Discover more startups</h3>
            <p className="text-sm text-white/80 mb-4">Join the movement and start connecting</p>
            <button onClick={() => setActiveTab('home')} className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all">
              Explore Now 🚀
            </button>
          </div>
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
    );
  }

  return null;
};

export default SeedstreetApp;