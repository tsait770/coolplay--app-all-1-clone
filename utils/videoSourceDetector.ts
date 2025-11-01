export type VideoSourceType = 
  | 'youtube' 
  | 'vimeo' 
  | 'twitch' 
  | 'facebook' 
  | 'dailymotion'
  | 'rumble'
  | 'odysee'
  | 'bilibili'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'direct' 
  | 'stream' 
  | 'hls' 
  | 'dash' 
  | 'rtmp' 
  | 'gdrive' 
  | 'dropbox' 
  | 'unsupported' 
  | 'adult' 
  | 'unknown' 
  | 'webview';

export interface VideoSourceInfo {
  type: VideoSourceType;
  platform: string;
  requiresPremium: boolean;
  videoId?: string;
  error?: string;
  streamType?: 'hls' | 'dash' | 'rtmp' | 'mp4' | 'webm' | 'ogg' | 'mkv' | 'avi' | 'mov';
  requiresWebView?: boolean;
  requiresAgeVerification?: boolean;
}

const DIRECT_VIDEO_FORMATS = [
  'mp4', 'webm', 'ogg', 'ogv', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'ts', 'm4v'
];

const STREAM_PROTOCOLS = {
  hls: /\.m3u8(\?.*)?$/i,
  dash: /\.mpd(\?.*)?$/i,
  rtmp: /^rtmp:\/\/.+/i,
  rtsp: /^rtsp:\/\/.+/i,
};

const SUPPORTED_PLATFORMS = [
  {
    pattern: /youtube\.com\/watch\?v=([\w-]+)|youtube\.com\/embed\/([\w-]+)|youtu\.be\/([\w-]+)|youtube-nocookie\.com\/embed\/([\w-]+)/i,
    type: 'youtube' as VideoSourceType,
    platform: 'YouTube',
    requiresPremium: false,
    extractVideoId: true,
  },
  {
    pattern: /vimeo\.com\/(\d+)|player\.vimeo\.com\/video\/(\d+)/i,
    type: 'vimeo' as VideoSourceType,
    platform: 'Vimeo',
    requiresPremium: false,
    extractVideoId: true,
  },
  {
    pattern: /twitch\.tv\/(videos\/\d+|[\w-]+)/i,
    type: 'twitch' as VideoSourceType,
    platform: 'Twitch',
    requiresPremium: false,
  },
  {
    pattern: /facebook\.com\/watch\/\?v=\d+|fb\.watch\/[\w-]+/i,
    type: 'facebook' as VideoSourceType,
    platform: 'Facebook',
    requiresPremium: false,
  },
  {
    pattern: /dailymotion\.com\/video\/[\w-]+/i,
    type: 'dailymotion' as VideoSourceType,
    platform: 'Dailymotion',
    requiresPremium: false,
  },
  {
    pattern: /rumble\.com\/[\w-]+/i,
    type: 'rumble' as VideoSourceType,
    platform: 'Rumble',
    requiresPremium: false,
  },
  {
    pattern: /odysee\.com\/@[\w-]+\/[\w-]+/i,
    type: 'odysee' as VideoSourceType,
    platform: 'Odysee',
    requiresPremium: false,
  },
  {
    pattern: /bilibili\.com\/video\/[\w-]+/i,
    type: 'bilibili' as VideoSourceType,
    platform: 'Bilibili',
    requiresPremium: false,
  },
  {
    pattern: /twitter\.com\/.+\/status\/\d+|x\.com\/.+\/status\/\d+/i,
    type: 'twitter' as VideoSourceType,
    platform: 'Twitter',
    requiresPremium: false,
  },
  {
    pattern: /instagram\.com\/(reel|p|tv)\/[\w-]+/i,
    type: 'instagram' as VideoSourceType,
    platform: 'Instagram',
    requiresPremium: false,
  },
  {
    pattern: /tiktok\.com\/@[\w.-]+\/video\/\d+/i,
    type: 'tiktok' as VideoSourceType,
    platform: 'TikTok',
    requiresPremium: false,
  },
  {
    pattern: /drive\.google\.com\/file\/d\/([\w-]+)/i,
    type: 'gdrive' as VideoSourceType,
    platform: 'Google Drive',
    requiresPremium: false,
  },
  {
    pattern: /dropbox\.com\/s\/([\w-]+)/i,
    type: 'dropbox' as VideoSourceType,
    platform: 'Dropbox',
    requiresPremium: false,
  },
];

const ADULT_PLATFORMS = [
  { pattern: /pornhub\.com/i, platform: 'Pornhub' },
  { pattern: /xvideos\.com/i, platform: 'Xvideos' },
  { pattern: /xnxx\.com/i, platform: 'Xnxx' },
  { pattern: /redtube\.com/i, platform: 'Redtube' },
  { pattern: /tktube\.com/i, platform: 'Tktube' },
  { pattern: /youporn\.com/i, platform: 'YouPorn' },
  { pattern: /spankbang\.com/i, platform: 'Spankbang' },
  { pattern: /brazzers\.com/i, platform: 'Brazzers' },
  { pattern: /naughtyamerica\.com/i, platform: 'Naughty America' },
  { pattern: /bangbros\.com/i, platform: 'Bangbros' },
  { pattern: /realitykings\.com/i, platform: 'Reality Kings' },
  { pattern: /stripchat\.com/i, platform: 'Stripchat' },
  { pattern: /livejasmin\.com/i, platform: 'LiveJasmin' },
  { pattern: /bongacams\.com/i, platform: 'BongaCams' },
  { pattern: /xhamster\.com/i, platform: 'XHamster' },
  { pattern: /tube8\.com/i, platform: 'Tube8' },
  { pattern: /xtube\.com/i, platform: 'XTube' },
  { pattern: /pornhd\.com/i, platform: 'PornHD' },
  { pattern: /porntrex\.com/i, platform: 'PornTrex' },
  { pattern: /empflix\.com/i, platform: 'Empflix' },
];

const UNSUPPORTED_PLATFORMS = [
  { pattern: /netflix\.com/i, platform: 'Netflix' },
  { pattern: /disneyplus\.com/i, platform: 'Disney+' },
  { pattern: /iqiyi\.com/i, platform: 'iQIYI' },
  { pattern: /hbomax\.com/i, platform: 'HBO Max' },
  { pattern: /primevideo\.com/i, platform: 'Prime Video' },
  { pattern: /apple\.com\/tv/i, platform: 'Apple TV+' },
  { pattern: /hulu\.com/i, platform: 'Hulu' },
  { pattern: /peacocktv\.com/i, platform: 'Peacock' },
  { pattern: /paramountplus\.com/i, platform: 'Paramount+' },
];

export function detectVideoSource(url: string): VideoSourceInfo {
  console.log('[VideoSourceDetector] Detecting source for URL:', url);
  
  if (!url || typeof url !== 'string') {
    console.warn('[VideoSourceDetector] Invalid URL provided');
    return {
      type: 'unknown',
      platform: 'Unknown',
      requiresPremium: false,
      error: 'Invalid URL',
    };
  }

  const normalizedUrl = url.trim().toLowerCase();

  // Priority 1: Check for DRM-protected platforms first
  for (const source of UNSUPPORTED_PLATFORMS) {
    if (source.pattern.test(url)) {
      console.warn('[VideoSourceDetector] Unsupported DRM platform:', source.platform);
      return {
        type: 'unsupported',
        platform: source.platform,
        requiresPremium: false,
        error: `${source.platform} is not supported due to DRM restrictions`,
      };
    }
  }

  // Priority 2: Check for direct media file URLs
  const fileExtMatch = normalizedUrl.match(new RegExp(`\\.(${DIRECT_VIDEO_FORMATS.join('|')})(\\?.*)?$`, 'i'));
  if (fileExtMatch) {
    const ext = fileExtMatch[1];
    console.log('[VideoSourceDetector] Detected direct video file:', ext);
    return {
      type: 'direct',
      platform: 'Direct Video',
      requiresPremium: false,
      streamType: ext as 'mp4' | 'webm' | 'ogg' | 'mkv' | 'avi' | 'mov',
    };
  }

  // Priority 3: Check for streaming protocols
  for (const [protocol, pattern] of Object.entries(STREAM_PROTOCOLS)) {
    if (pattern.test(url)) {
      console.log(`[VideoSourceDetector] Detected ${protocol.toUpperCase()} stream`);
      return {
        type: 'stream',
        platform: `${protocol.toUpperCase()} Stream`,
        requiresPremium: false,
        streamType: protocol as 'hls' | 'dash' | 'rtmp',
      };
    }
  }

  // Priority 4: Check for adult content platforms
  for (const source of ADULT_PLATFORMS) {
    if (source.pattern.test(url)) {
      console.log('[VideoSourceDetector] Detected adult content:', source.platform);
      return {
        type: 'adult',
        platform: source.platform,
        requiresPremium: true,
        requiresWebView: true,
        requiresAgeVerification: true,
      };
    }
  }

  // Priority 5: Check for supported platforms
  for (const source of SUPPORTED_PLATFORMS) {
    if (source.pattern.test(url)) {
      console.log('[VideoSourceDetector] Detected supported platform:', source.platform);
      
      let videoId: string | undefined;
      if (source.extractVideoId) {
        if (source.type === 'youtube') {
          const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]+)/i);
          videoId = match?.[1];
        } else if (source.type === 'vimeo') {
          const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
          videoId = match?.[1];
        }
      }
      
      return {
        type: source.type,
        platform: source.platform,
        requiresPremium: source.requiresPremium,
        videoId,
        requiresWebView: ['twitch', 'facebook', 'dailymotion', 'rumble', 'odysee', 'bilibili', 'twitter', 'instagram', 'tiktok', 'gdrive', 'dropbox'].includes(source.type),
      };
    }
  }

  // Priority 6: Fallback to WebView for any http/https URL
  if (/^https?:\/\//i.test(url)) {
    console.log('[VideoSourceDetector] Fallback to WebView for unknown URL');
    return {
      type: 'webview',
      platform: 'Web Content',
      requiresPremium: false,
      requiresWebView: true,
    };
  }

  console.warn('[VideoSourceDetector] Unknown video source');
  return {
    type: 'unknown',
    platform: 'Unknown',
    requiresPremium: false,
    error: 'Unknown video source format',
  };
}

export function canPlayVideo(
  url: string,
  membershipTier: 'free_trial' | 'free' | 'basic' | 'premium'
): { canPlay: boolean; reason?: string } {
  const sourceInfo = detectVideoSource(url);

  console.log('[VideoSourceDetector] Checking playback eligibility:', {
    type: sourceInfo.type,
    platform: sourceInfo.platform,
    membershipTier,
  });

  // Block unsupported DRM platforms
  if (sourceInfo.type === 'unsupported') {
    return {
      canPlay: false,
      reason: sourceInfo.error || `${sourceInfo.platform} is not supported due to DRM restrictions`,
    };
  }

  // Check adult content access based on membership
  if (sourceInfo.type === 'adult') {
    // Free trial: Allow (as per V7 spec)
    if (membershipTier === 'free_trial') {
      return { canPlay: true };
    }
    
    // Free: Block
    if (membershipTier === 'free') {
      return {
        canPlay: false,
        reason: 'Adult content requires a Basic or Premium membership. Free trial members have access.',
      };
    }
    
    // Basic and Premium: Allow
    return { canPlay: true };
  }

  // Free tier restrictions: Only MP4, WebM, OGG, OGV, YouTube, Vimeo
  if (membershipTier === 'free') {
    const allowedForFree = ['youtube', 'vimeo'];
    const allowedFormats = ['mp4', 'webm', 'ogg', 'ogv'];
    
    if (sourceInfo.type === 'direct' && sourceInfo.streamType) {
      if (!allowedFormats.includes(sourceInfo.streamType)) {
        return {
          canPlay: false,
          reason: 'This video format requires a Basic or Premium membership. Free tier supports MP4, WebM, OGG, OGV, YouTube, and Vimeo only.',
        };
      }
    } else if (!allowedForFree.includes(sourceInfo.type)) {
      return {
        canPlay: false,
        reason: 'This platform requires a Basic or Premium membership. Free tier supports YouTube and Vimeo only.',
      };
    }
  }

  // All other cases: Allow playback
  return { canPlay: true };
}

export function getSupportedPlatforms(membershipTier: 'free_trial' | 'free' | 'basic' | 'premium'): string[] {
  const platforms: string[] = [];
  
  // Free tier: Limited platforms
  if (membershipTier === 'free' as string) {
    platforms.push('YouTube', 'Vimeo', 'Direct Video (MP4, WebM, OGG, OGV)');
    return platforms;
  }
  
  // All other tiers: Full platform support
  platforms.push(...SUPPORTED_PLATFORMS.map(s => s.platform));
  platforms.push('HLS Stream', 'DASH Stream', 'RTMP Stream', 'Direct Video (All formats)');
  
  // Add adult platforms for non-free tiers
  if (membershipTier !== 'free') {
    platforms.push(...ADULT_PLATFORMS.map(s => `${s.platform} (18+)`));
  }
  
  return [...new Set(platforms)];
}

export function getVideoFormatSupport(membershipTier: 'free_trial' | 'free' | 'basic' | 'premium'): string[] {
  if (membershipTier === 'free') {
    return ['mp4', 'webm', 'ogg', 'ogv'];
  }
  
  return DIRECT_VIDEO_FORMATS;
}

export function requiresAgeVerification(url: string): boolean {
  const sourceInfo = detectVideoSource(url);
  return sourceInfo.requiresAgeVerification === true;
}
