import React, { useState } from 'react';
import { CampaignBlueprint as CBluePrint, SocialPost } from '@/lib/types';
import { Copy, Facebook, Instagram, Twitter } from 'lucide-react';

// Dummy data
const dummyBlueprint: CBluePrint = {
  facebook: {
    posts: [
      {
        type: 'post',
        content: '🌟 Summer Sale is Here!\n\nSpecial Offer: 20% OFF storewide, plus extra 15% OFF on new arrivals.\n\nCome find your perfect summer items!',
        hashtags: ['SummerSale', 'NewCollection', 'Fashion'],
        suggestedImage: 'Summer Collection Main Image'
      },
      {
        type: 'post',
        content: '✨ Exclusive Deal!\n\nGet a FREE luxury gift with purchases over $100\n\nLimited quantity, shop now!',
        hashtags: ['ExclusiveOffer', 'GiftWithPurchase', 'LimitedTime'],
        suggestedImage: 'Gift Display Image'
      },
    ]
  },
  instagram: {
    posts: [
      {
        type: 'post',
        content: '✨ Cool Summer Vibes!\n\nNew arrivals in store\n\nLimited Time: 15% OFF on all new items',
        hashtags: ['SummerFashion', 'NewArrivals', 'Style'],
        suggestedImage: 'Product Showcase Image'
      },
      {
        type: 'reel',
        content: '👗 Style Tips\n\nSummer Collection Styling Guide\n\nSwipe to see the perfect summer looks!',
        hashtags: ['StyleGuide', 'FashionTips'],
        suggestedImage: 'Video Cover'
      },
    ]
  },
  x: {
    posts: [
      {
        content: '🎉 Summer Collection is LIVE! Limited time offers, shop now before they\'re gone!',
        hashtags: ['SummerCollection', 'Fashion']
      },
      {
        content: '📢 Exclusive Sneak Peek! New collection dropping soon. Stay tuned for something special!',
        hashtags: ['ComingSoon', 'Exclusive']
      },
    ]
  }
};

interface PostCardProps {
  post: SocialPost;
  platform: 'facebook' | 'instagram' | 'x';
  onDelete: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, platform, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getMediaTypeText = () => {
    if (platform === 'instagram' && post.type === 'reel') {
      return 'video';
    }
    return 'image';
  };

  return (
    <div className="bg-[#1a1a1d] rounded-lg p-4 border border-[#2a2a2e]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {platform === 'facebook' && <Facebook className="w-4 h-4 text-[#1877F2]" />}
          {platform === 'instagram' && <Instagram className="w-4 h-4 text-[#E4405F]" />}
          {platform === 'x' && <Twitter className="w-4 h-4 text-[#1DA1F2]" />}
          <span className="text-sm text-zinc-400 capitalize">{post.type || 'post'}</span>
        </div>
        <button 
          className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors group"
          onClick={onDelete}
          title="Delete post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400 group-hover:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      
      <div className="mb-3">
        <p className="text-zinc-300 whitespace-pre-line">{post.content}</p>
      </div>

      <div className="mb-4">
        <div className="border-2 border-dashed border-[#2a2a2e] rounded-lg p-4 text-center">
          {previewUrl ? (
            <div className="relative">
              {platform === 'instagram' && post.type === 'reel' ? (
                <video 
                  src={previewUrl} 
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept={platform === 'instagram' && post.type === 'reel' ? "video/*" : "image/*"}
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${post.content.substring(0, 10)}`}
              />
              <label
                htmlFor={`file-upload-${post.content.substring(0, 10)}`}
                className="cursor-pointer"
              >
                <div className="text-zinc-400 mb-2">
                  Click to upload {getMediaTypeText()}
                </div>
                <div className="text-xs text-zinc-500">
                  {platform === 'instagram' && post.type === 'reel' ? 
                    'Supports MP4, MOV formats' : 
                    'Supports JPG, PNG, GIF formats'}
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-[#2a2a2e] text-zinc-400 rounded">
              #{tag}
            </span>
          ))}
        </div>
        
        {post.suggestedImage && (
          <div className="text-xs text-zinc-500">
            建议图片: {post.suggestedImage}
          </div>
        )}
      </div>
    </div>
  );
};

interface CampaignBlueprintProps {
  isOpen: boolean;
}

export function CampaignBlueprint({ isOpen }: CampaignBlueprintProps) {
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram' | 'x'>('facebook');
  const [blueprint, setBlueprint] = useState<CBluePrint>(dummyBlueprint);
  
  const handleDeletePost = (platform: 'facebook' | 'instagram' | 'x', index: number) => {
    setBlueprint(prev => ({
      ...prev,
      [platform]: {
        posts: prev[platform].posts.filter((_, i) => i !== index)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="mt-8 bg-[#1a1a1d] rounded-xl border border-[#2a2a2e] overflow-hidden">
      <div className="p-6 border-b border-[#2a2a2e]">
        <h2 className="text-xl font-medium text-white">Campaign Blueprint</h2>
      </div>

      <div className="p-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'facebook' 
                ? 'bg-[#1877F2] text-white' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('facebook')}
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </button>
          
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'instagram' 
                ? 'bg-[#E4405F] text-white' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('instagram')}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </button>
          
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'x' 
                ? 'bg-[#1DA1F2] text-white' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('x')}
          >
            <Twitter className="w-4 h-4" />
            <span>X</span>
          </button>
        </div>

        <div className="space-y-4">
          {blueprint[activeTab].posts.map((post, index) => (
            <PostCard 
              key={index} 
              post={post} 
              platform={activeTab}
              onDelete={() => handleDeletePost(activeTab, index)}
            />
          ))}
          
          {blueprint[activeTab].posts.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              No posts available for this platform
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 