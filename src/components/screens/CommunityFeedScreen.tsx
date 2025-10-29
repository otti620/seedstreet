"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '../BottomNav';

// Define TypeScript interfaces for data structures (copied from SeedstreetApp for consistency)
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

interface CommunityFeedScreenProps {
  communityPosts: CommunityPost[];
  setCurrentScreen: (screen: string) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  userRole: string | null;
}

const CommunityFeedScreen: React.FC<CommunityFeedScreenProps> = ({
  communityPosts,
  setCurrentScreen,
  setActiveTab,
  activeTab,
  userRole,
}) => {
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
};

export default CommunityFeedScreen;