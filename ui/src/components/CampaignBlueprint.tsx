import React, { useState } from 'react';
import { CampaignBlueprint as CBluePrint, SocialPost } from '@/lib/types';
import { Copy, Facebook, Instagram, Twitter, Calendar } from 'lucide-react';

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
  onScheduleChange: (time: string) => void;
  onHashtagsChange: (hashtags: string[]) => void;
  onContentChange: (content: string) => void;
  isScheduled: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  platform, 
  onDelete, 
  onScheduleChange, 
  onHashtagsChange,
  onContentChange,
  isScheduled 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newHashtag, setNewHashtag] = useState('');
  const [isEditingHashtag, setIsEditingHashtag] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  // 如果没有设置时间，默认设置为24小时后
  React.useEffect(() => {
    if (!post.scheduledTime) {
      const date = new Date();
      date.setHours(date.getHours() + 24);
      onScheduleChange(date.toISOString().slice(0, 16));
    }
  }, []);

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

  const handleAddHashtag = () => {
    if (newHashtag.trim() && !isScheduled) {
      onHashtagsChange([...post.hashtags, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  const handleDeleteHashtag = (index: number) => {
    if (!isScheduled) {
      onHashtagsChange(post.hashtags.filter((_, i) => i !== index));
    }
  };

  const handleEditHashtag = (index: number) => {
    if (!isScheduled) {
      setIsEditingHashtag(index);
      setEditingValue(post.hashtags[index]);
    }
  };

  const handleSaveHashtag = (index: number) => {
    if (editingValue.trim()) {
      const newHashtags = [...post.hashtags];
      newHashtags[index] = editingValue.trim();
      onHashtagsChange(newHashtags);
    }
    setIsEditingHashtag(null);
  };

  const handleContentSave = () => {
    if (editedContent.trim()) {
      onContentChange(editedContent);
    }
    setIsEditingContent(false);
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
        <div className="flex items-center space-x-2">
          {!isScheduled && !isEditingContent && (
            <button
              onClick={() => setIsEditingContent(true)}
              className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors group"
              title="Edit post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400 group-hover:text-[#5D4EFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
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
      </div>
      
      <div className="mb-3">
        {isEditingContent ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-[#2a2a2e] text-zinc-300 text-sm p-3 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF] min-h-[120px] resize-none"
              placeholder="Write your post content here..."
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditedContent(post.content);
                  setIsEditingContent(false);
                }}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleContentSave}
                disabled={!editedContent.trim()}
                className={`px-3 py-1.5 rounded text-sm ${
                  editedContent.trim()
                    ? 'bg-[#5D4EFF] text-white hover:bg-[#4B3ECC]'
                    : 'bg-[#2a2a2e] text-zinc-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-300 whitespace-pre-line">{post.content}</p>
        )}
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
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((tag, index) => (
            isEditingHashtag === index ? (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="bg-[#2a2a2e] text-zinc-300 text-xs px-2 py-1 rounded border border-[#5D4EFF] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveHashtag(index);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleSaveHashtag(index)}
                  className="ml-1 text-[#5D4EFF] hover:text-[#4B3ECC]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div key={index} className="group flex items-center text-xs px-2 py-1 bg-[#2a2a2e] text-zinc-400 rounded">
                #{tag}
                {!isScheduled && (
                  <div className="flex items-center ml-2">
                    <button
                      onClick={() => handleEditHashtag(index)}
                      className="text-zinc-400 hover:text-[#5D4EFF] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteHashtag(index)}
                      className="ml-1 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {!isScheduled && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              placeholder="Add new hashtag"
              className="flex-1 bg-[#2a2a2e] text-zinc-300 text-xs px-2 py-1 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddHashtag();
                }
              }}
            />
            <button
              onClick={handleAddHashtag}
              disabled={!newHashtag.trim()}
              className={`px-2 py-1 rounded text-xs ${
                newHashtag.trim()
                  ? 'bg-[#5D4EFF] text-white hover:bg-[#4B3ECC]'
                  : 'bg-[#2a2a2e] text-zinc-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
        )}
        
        {post.suggestedImage && (
          <div className="text-xs text-zinc-500">
            Suggested Image: {post.suggestedImage}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[#2a2a2e]">
          <label className="block text-xs text-zinc-400 mb-2">Schedule Post Time</label>
          <input
            type="datetime-local"
            value={post.scheduledTime || ''}
            onChange={(e) => onScheduleChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-[#2a2a2e] text-zinc-300 text-xs p-2 rounded border border-[#414144] focus:outline-none focus:border-[#5D4EFF]"
            disabled={isScheduled}
          />
          {isScheduled && (
            <div className="flex items-center mt-2 text-xs text-green-500">
              <Calendar className="w-4 h-4 mr-1" />
              Scheduled for {new Date(post.scheduledTime!).toLocaleDateString()} at {new Date(post.scheduledTime!).toLocaleTimeString()}
            </div>
          )}
        </div>
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
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'scheduling' | 'scheduled'>('idle');

  const handleDeletePost = (platform: 'facebook' | 'instagram' | 'x', index: number) => {
    setBlueprint(prev => ({
      ...prev,
      [platform]: {
        posts: prev[platform].posts.filter((_, i) => i !== index)
      }
    }));
  };

  const handleScheduleChange = (platform: 'facebook' | 'instagram' | 'x', index: number, time: string) => {
    setBlueprint(prev => ({
      ...prev,
      [platform]: {
        posts: prev[platform].posts.map((post, i) => 
          i === index ? { ...post, scheduledTime: time } : post
        )
      }
    }));
  };

  const handleSchedule = () => {
    // 检查所有帖子是否都已设置时间
    const allScheduled = Object.values(blueprint).every(
      platform => platform.posts.every(post => post.scheduledTime)
    );

    if (!allScheduled) {
      alert('Please set schedule time for all posts');
      return;
    }

    setScheduleStatus('scheduling');
    setTimeout(() => {
      setScheduleStatus('scheduled');
    }, 1500);
  };

  const handleContentChange = (platform: 'facebook' | 'instagram' | 'x', index: number, content: string) => {
    setBlueprint(prev => ({
      ...prev,
      [platform]: {
        posts: prev[platform].posts.map((post, i) => 
          i === index ? { ...post, content } : post
        )
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="mt-8 bg-[#1a1a1d] rounded-lg p-5 border border-[#2a2a2e]">
      <div className="p-6 border-b border-[#2a2a2e]">
        <h2 className="text-xl font-medium text-white">Campaign Blueprint</h2>
      </div>

      <div className="p-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'facebook' 
                ? 'bg-white text-[#1a1a1d]' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('facebook')}
          >
            <Facebook className={activeTab === 'facebook' ? 'w-4 h-4 text-[#1a1a1d]' : 'w-4 h-4'} />
            <span>Facebook</span>
          </button>
          
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'instagram' 
                ? 'bg-white text-[#1a1a1d]' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('instagram')}
          >
            <Instagram className={activeTab === 'instagram' ? 'w-4 h-4 text-[#1a1a1d]' : 'w-4 h-4'} />
            <span>Instagram</span>
          </button>
          
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'x' 
                ? 'bg-white text-[#1a1a1d]' 
                : 'text-zinc-400 hover:bg-[#2a2a2e]'
            }`}
            onClick={() => setActiveTab('x')}
          >
            <Twitter className={activeTab === 'x' ? 'w-4 h-4 text-[#1a1a1d]' : 'w-4 h-4'} />
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
              onScheduleChange={(time) => handleScheduleChange(activeTab, index, time)}
              onHashtagsChange={(hashtags) => setBlueprint(prev => ({
                ...prev,
                [activeTab]: {
                  posts: prev[activeTab].posts.map((post, i) => 
                    i === index ? { ...post, hashtags } : post
                  )
                }
              }))}
              onContentChange={(content) => handleContentChange(activeTab, index, content)}
              isScheduled={scheduleStatus === 'scheduled'}
            />
          ))}
          
          {blueprint[activeTab].posts.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              No posts available for this platform
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-[#2a2a2e] pt-6">
        <div className="flex justify-center">
          <button
            onClick={handleSchedule}
            disabled={scheduleStatus === 'scheduled' || scheduleStatus === 'scheduling'}
            className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              scheduleStatus === 'scheduled'
                ? 'bg-green-600/20 text-green-500 cursor-not-allowed'
                : 'bg-[#5D4EFF] text-white hover:bg-[#4B3ECC]'
            }`}
          >
            {scheduleStatus === 'scheduled' ? (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Blueprint Scheduled
              </div>
            ) : scheduleStatus === 'scheduling' ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scheduling Blueprint...
              </div>
            ) : (
              'Run Blueprint'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 