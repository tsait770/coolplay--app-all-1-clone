export type VideoSourceType = 'youtube' | 'vimeo' | 'twitch' | 'facebook' | 'direct' | 'stream' | 'unsupported' | 'adult' | 'unknown';

export interface VideoSourceInfo {
  type: VideoSourceType;
  platform: string;
  requiresPremium: boolean;
  videoId?: string;
  error?: string;
  streamType?: 'hls' | 'dash' | 'rtmp' | 'mp4' | 'webm' | 'ogg';
}

const SUPPORTED_SOURCES = [
  { pattern: /youtube\.com\/watch\?v=[\w-]+/, platform: 'YouTube', requiresPremium: false },
  { pattern: /youtube\.com\/embed\/[\w-]+/, platform: 'YouTube', requiresPremium: false },
  { pattern: /youtube-nocookie\.com\/embed\/[\w-]+/, platform: 'YouTube', requiresPremium: false },
  { pattern: /youtu\.be\/[\w-]+/, platform: 'YouTube', requiresPremium: false },
  { pattern: /vimeo\.com\/\d+/, platform: 'Vimeo', requiresPremium: false },
  { pattern: /player\.vimeo\.com\/video\/\d+/, platform: 'Vimeo', requiresPremium: false },
  { pattern: /twitch\.tv\/[\w-]+/, platform: 'Twitch', requiresPremium: false },
  { pattern: /twitch\.tv\/videos\/\d+/, platform: 'Twitch', requiresPremium: false },
  { pattern: /facebook\.com\/watch\/\?v=\d+/, platform: 'Facebook', requiresPremium: false },
  { pattern: /fb\.watch\/[\w-]+/, platform: 'Facebook', requiresPremium: false },
  { pattern: /drive\.google\.com\/file\/d\/[\w-]+/, platform: 'Google Drive', requiresPremium: false },
  { pattern: /dropbox\.com\/s\/[\w-]+/, platform: 'Dropbox', requiresPremium: false },
  { pattern: /.*\.(mp4|webm|ogg|ogv)$/i, platform: 'Direct Video', requiresPremium: false },
  { pattern: /.*\.m3u8$/i, platform: 'HLS Stream', requiresPremium: false },
  { pattern: /^rtmp:\/\/.+/i, platform: 'RTMP Stream', requiresPremium: false },
  { pattern: /.*\.mpd$/i, platform: 'DASH Stream', requiresPremium: false },
  { pattern: /twitter\.com\/.+\/status\/\d+/, platform: 'Twitter', requiresPremium: false },
  { pattern: /instagram\.com\/(reel|p|tv)\/[\w-]+/, platform: 'Instagram', requiresPremium: false },
  { pattern: /tiktok\.com\/@[\w.-]+\/video\/\d+/, platform: 'TikTok', requiresPremium: false },
  { pattern: /bilibili\.com\/video\/[\w-]+/, platform: 'Bilibili', requiresPremium: false },
];

const ADULT_SOURCES = [
  { pattern: /pornhub\.com\/view_video\.php\?viewkey=/i, platform: 'Pornhub', requiresPremium: true },
  { pattern: /xvideos\.com\/video\d+/i, platform: 'Xvideos', requiresPremium: true },
  { pattern: /xnxx\.com\/video-[\w-]+/i, platform: 'Xnxx', requiresPremium: true },
  { pattern: /redtube\.com\/\d+/i, platform: 'Redtube', requiresPremium: true },
  { pattern: /tktube\.com\/videos\/\d+/i, platform: 'Tktube', requiresPremium: true },
  { pattern: /youporn\.com\/watch\/\d+/i, platform: 'YouPorn', requiresPremium: true },
  { pattern: /spankbang\.com\/[\w-]+\/video/i, platform: 'Spankbang', requiresPremium: true },
  { pattern: /brazzers\.com\/video\/[\w-]+/i, platform: 'Brazzers', requiresPremium: true },
  { pattern: /naughtyamerica\.com\/scene\/[\w-]+/i, platform: 'Naughty America', requiresPremium: true },
  { pattern: /bangbros\.com\/scene\/[\w-]+/i, platform: 'Bangbros', requiresPremium: true },
  { pattern: /realitykings\.com\/scene\/[\w-]+/i, platform: 'Reality Kings', requiresPremium: true },
  { pattern: /stripchat\.com/i, platform: 'Stripchat', requiresPremium: true },
  { pattern: /livejasmin\.com/i, platform: 'LiveJasmin', requiresPremium: true },
  { pattern: /bongacams\.com/i, platform: 'BongaCams', requiresPremium: true },
];

const UNSUPPORTED_SOURCES = [
  { pattern: /netflix\.com/i, platform: 'Netflix' },
  { pattern: /disneyplus\.com/i, platform: 'Disney+' },
  { pattern: /iqiyi\.com/i, platform: 'iQIYI' },
  { pattern: /hbomax\.com/i, platform: 'HBO Max' },
  { pattern: /primevideo\.com/i, platform: 'Prime Video' },
  { pattern: /apple\.com\/tv/i, platform: 'Apple TV+' },
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

  if (/youtube\.com\/watch\?v=([\w-]+)/i.test(url) || 
      /youtube\.com\/embed\/([\w-]+)/i.test(url) ||
      /youtube-nocookie\.com\/embed\/([\w-]+)/i.test(url) ||
      /youtu\.be\/([\w-]+)/i.test(url)) {
    let videoId: string | undefined;
    
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([\w-]+)/i);
    if (youtubeMatch) {
      videoId = youtubeMatch[1];
    } else {
      const youtubeShortMatch = url.match(/youtu\.be\/([\w-]+)/i);
      if (youtubeShortMatch) {
        videoId = youtubeShortMatch[1];
      }
    }
    
    console.log('[VideoSourceDetector] Detected YouTube video:', videoId);
    console.log('[VideoSourceDetector] Original URL:', url);
    
    return {
      type: 'youtube',
      platform: 'YouTube',
      requiresPremium: false,
      videoId: videoId,
    };
  }
  
  if (/vimeo\.com\/(\d+)/i.test(url) || /player\.vimeo\.com\/video\/(\d+)/i.test(url)) {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    console.log('[VideoSourceDetector] Detected Vimeo video:', match?.[1]);
    return {
      type: 'vimeo',
      platform: 'Vimeo',
      requiresPremium: false,
      videoId: match?.[1],
    };
  }

  if (/twitch\.tv\/(videos\/\d+|[\w-]+)/i.test(url)) {
    console.log('[VideoSourceDetector] Detected Twitch stream');
    return {
      type: 'twitch',
      platform: 'Twitch',
      requiresPremium: false,
    };
  }

  if (/facebook\.com\/watch\/\?v=\d+/i.test(url) || /fb\.watch\/[\w-]+/i.test(url)) {
    console.log('[VideoSourceDetector] Detected Facebook video');
    return {
      type: 'facebook',
      platform: 'Facebook',
      requiresPremium: false,
    };
  }
  
  if (/\.(mp4|webm|ogg|ogv)$/i.test(normalizedUrl)) {
    const ext = normalizedUrl.match(/\.(mp4|webm|ogg|ogv)$/i)?.[1];
    console.log('[VideoSourceDetector] Detected direct video file:', ext);
    return {
      type: 'direct',
      platform: 'Direct Video',
      requiresPremium: false,
      streamType: ext as 'mp4' | 'webm' | 'ogg',
    };
  }
  
  if (/\.m3u8$/i.test(normalizedUrl)) {
    console.log('[VideoSourceDetector] Detected HLS stream');
    return {
      type: 'stream',
      platform: 'HLS Stream',
      requiresPremium: false,
      streamType: 'hls',
    };
  }

  if (/^rtmp:\/\/.+/i.test(url)) {
    console.log('[VideoSourceDetector] Detected RTMP stream');
    return {
      type: 'stream',
      platform: 'RTMP Stream',
      requiresPremium: false,
      streamType: 'rtmp',
    };
  }

  if (/\.mpd$/i.test(normalizedUrl)) {
    console.log('[VideoSourceDetector] Detected DASH stream');
    return {
      type: 'stream',
      platform: 'DASH Stream',
      requiresPremium: false,
      streamType: 'dash',
    };
  }

  for (const source of UNSUPPORTED_SOURCES) {
    if (source.pattern.test(url)) {
      console.warn('[VideoSourceDetector] Unsupported platform:', source.platform);
      return {
        type: 'unsupported',
        platform: source.platform,
        requiresPremium: false,
        error: `${source.platform} is not supported due to DRM restrictions`,
      };
    }
  }

  for (const source of ADULT_SOURCES) {
    if (source.pattern.test(url)) {
      console.log('[VideoSourceDetector] Detected adult content:', source.platform);
      return {
        type: 'adult',
        platform: source.platform,
        requiresPremium: source.requiresPremium,
      };
    }
  }
  
  for (const source of SUPPORTED_SOURCES) {
    if (source.pattern.test(url)) {
      console.log('[VideoSourceDetector] Detected supported platform:', source.platform);
      return {
        type: 'direct',
        platform: source.platform,
        requiresPremium: source.requiresPremium,
      };
    }
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

  if (sourceInfo.type === 'unsupported') {
    return {
      canPlay: false,
      reason: `${sourceInfo.platform} is not supported due to DRM restrictions`,
    };
  }

  if (sourceInfo.type === 'adult') {
    if (membershipTier === 'free') {
      return {
        canPlay: false,
        reason: 'Adult content requires a paid membership',
      };
    }
    return { canPlay: true };
  }

  if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo' || sourceInfo.type === 'direct' || sourceInfo.type === 'stream') {
    return { canPlay: true };
  }

  return {
    canPlay: false,
    reason: 'Unknown video source',
  };
}

export function getSupportedPlatforms(membershipTier: 'free_trial' | 'free' | 'basic' | 'premium'): string[] {
  const platforms = SUPPORTED_SOURCES.map(s => s.platform);
  
  if (membershipTier !== 'free') {
    platforms.push(...ADULT_SOURCES.map(s => s.platform));
  }
  
  return [...new Set(platforms)];
}
