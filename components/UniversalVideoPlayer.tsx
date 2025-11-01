import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import WebView from 'react-native-webview';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Settings,
} from 'lucide-react-native';
import { detectVideoSource, canPlayVideo } from '@/utils/videoSourceDetector';
import { useMembership } from '@/providers/MembershipProvider';

interface UniversalVideoPlayerProps {
  url: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  onPlaybackStatusUpdate?: (status: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }) => void;
}

export default function UniversalVideoPlayer({
  url,
  onError,
  onLoad,
  onPlaybackStatusUpdate,
}: UniversalVideoPlayerProps) {
  const { tier: membershipTier, canUseFeature, useFeature, supportsAdultContent } = useMembership();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [, setSelectedQuality] = useState<string>('auto');
  
  const webViewRef = useRef<WebView>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUsedFeatureRef = useRef(false);

  const sourceInfo = detectVideoSource(url);
  
  const videoUrl = sourceInfo.type === 'direct' || sourceInfo.type === 'stream' 
    ? url 
    : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.volume = volume;
    player.muted = isMuted;
  });
  
  const isValidPlayer = sourceInfo.type === 'direct' || sourceInfo.type === 'stream';

  useEffect(() => {
    const checkAccess = async () => {
      if (!url || url.trim() === '') {
        setError('No video URL provided');
        return;
      }

      const accessCheck = canPlayVideo(url, membershipTier);
      
      if (!accessCheck.canPlay) {
        setError(accessCheck.reason || 'Cannot play this video');
        onError?.(accessCheck.reason || 'Cannot play this video');
        return;
      }

      if (sourceInfo.type === 'adult' && !supportsAdultContent()) {
        setError('Adult content requires a paid membership');
        onError?.('Adult content requires a paid membership');
        return;
      }

      if (!canUseFeature()) {
        setError('Usage limit reached. Please upgrade your membership.');
        onError?.('Usage limit reached');
        return;
      }

      if (!hasUsedFeatureRef.current) {
        try {
          const used = await useFeature();
          if (used) {
            hasUsedFeatureRef.current = true;
            console.log('Video playback counted towards usage');
          } else {
            setError('Failed to register usage');
          }
        } catch (err) {
          console.error('Error using feature:', err);
          setError('Failed to register usage');
        }
      }
    };

    checkAccess();
  }, [url, membershipTier, sourceInfo.type, canUseFeature, useFeature, supportsAdultContent, onError]);

  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const seek = useCallback((seconds: number) => {
    if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
      webViewRef.current?.injectJavaScript(`seekTo(${seconds});`);
    } else if (player) {
      const newPosition = Math.max(0, Math.min(duration, currentTime + seconds));
      player.currentTime = newPosition;
    }
  }, [sourceInfo.type, player, duration, currentTime]);

  const setVideoVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
      webViewRef.current?.injectJavaScript(`setVolume(${clampedVolume});`);
    } else if (player) {
      player.volume = clampedVolume;
    }
  }, [sourceInfo.type, player]);

  const toggleMute = useCallback((mute?: boolean) => {
    const shouldMute = mute !== undefined ? mute : !isMuted;
    
    if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
      webViewRef.current?.injectJavaScript(shouldMute ? 'mute();' : 'unMute();');
    } else if (player) {
      player.muted = shouldMute;
    }
    setIsMuted(shouldMute);
  }, [sourceInfo.type, player, isMuted]);

  const changePlaybackSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    
    if (sourceInfo.type === 'youtube') {
      webViewRef.current?.injectJavaScript(`player && player.setPlaybackRate && player.setPlaybackRate(${rate});`);
    } else if (sourceInfo.type === 'vimeo') {
      webViewRef.current?.injectJavaScript(`player && player.setPlaybackRate && player.setPlaybackRate(${rate});`);
    } else if (player) {
      player.playbackRate = rate;
    }
  }, [sourceInfo.type, player]);

  useEffect(() => {
    const handleVoiceCommand = (event: any) => {
      const detail = event?.detail ?? {};
      const cmd: string | undefined = (detail.intent as string) ?? (detail.command as string);
      if (!cmd) return;

      switch (cmd) {
        case 'PlayVideoIntent':
          if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
            webViewRef.current?.injectJavaScript('playVideo();');
          } else if (player) {
            player.play();
          }
          setIsPlaying(true);
          break;
        case 'PauseVideoIntent':
          if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
            webViewRef.current?.injectJavaScript('pauseVideo();');
          } else if (player) {
            player.pause();
          }
          setIsPlaying(false);
          break;
        case 'StopVideoIntent':
          if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
            webViewRef.current?.injectJavaScript('stopVideo();');
          } else if (player) {
            player.pause();
            player.currentTime = 0;
          }
          setIsPlaying(false);
          break;
        case 'ReplayVideoIntent':
          if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
            webViewRef.current?.injectJavaScript('seekTo(-999999);playVideo();');
          } else if (player) {
            player.currentTime = 0;
            player.play();
          }
          setIsPlaying(true);
          break;
        case 'Forward10Intent':
          seek(10);
          break;
        case 'Forward20Intent':
          seek(20);
          break;
        case 'Forward30Intent':
          seek(30);
          break;
        case 'Rewind10Intent':
          seek(-10);
          break;
        case 'Rewind20Intent':
          seek(-20);
          break;
        case 'Rewind30Intent':
          seek(-30);
          break;
        case 'MuteIntent':
          toggleMute(true);
          break;
        case 'UnmuteIntent':
          toggleMute(false);
          break;
        case 'VolumeMaxIntent':
          setVideoVolume(1.0);
          break;
        case 'VolumeHalfIntent':
          setVideoVolume(0.5);
          break;
        case 'VolumeUpIntent':
          setVideoVolume(Math.min(1.0, volume + 0.2));
          break;
        case 'VolumeDownIntent':
          setVideoVolume(Math.max(0, volume - 0.2));
          break;
        case 'EnterFullscreenIntent':
          setIsFullscreen(true);
          break;
        case 'ExitFullscreenIntent':
          setIsFullscreen(false);
          break;
        case 'SpeedHalfIntent':
          changePlaybackSpeed(0.5);
          break;
        case 'SpeedNormalIntent':
          changePlaybackSpeed(1.0);
          break;
        case 'Speed125Intent':
          changePlaybackSpeed(1.25);
          break;
        case 'Speed150Intent':
          changePlaybackSpeed(1.5);
          break;
        case 'Speed200Intent':
          changePlaybackSpeed(2.0);
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('voiceCommand', handleVoiceCommand);
      return () => {
        window.removeEventListener('voiceCommand', handleVoiceCommand);
      };
    }
  }, [player, sourceInfo.type, seek, setVideoVolume, toggleMute, changePlaybackSpeed, volume]);

  useEffect(() => {
    if (!player || !isValidPlayer) return;

    const interval = setInterval(() => {
      const status = {
        isPlaying: player.playing,
        currentTime: player.currentTime,
        duration: player.duration,
      };
      
      setCurrentTime(player.currentTime);
      setDuration(player.duration);
      setIsPlaying(player.playing);
      
      onPlaybackStatusUpdate?.(status);
      
      if (isLoading && player.duration > 0) {
        setIsLoading(false);
        onLoad?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, isValidPlayer, isLoading, onLoad, onPlaybackStatusUpdate]);

  const getEmbedHtml = useCallback(() => {
    if (sourceInfo.type === 'youtube' && sourceInfo.videoId) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <style>
              body { margin: 0; padding: 0; background: #000; }
              .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
              .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            </style>
            <script>
              var player;
              var tag = document.createElement('script');
              tag.src = "https://www.youtube.com/iframe_api";
              var firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
              
              function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                  height: '100%',
                  width: '100%',
                  videoId: '${sourceInfo.videoId}',
                  playerVars: {
                    'playsinline': 1,
                    'autoplay': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'controls': 1
                  },
                  events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                  }
                });
              }
              
              function onPlayerReady(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ready'}));
              }
              
              function onPlayerStateChange(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'stateChange',
                  state: event.data
                }));
              }
              
              function playVideo() {
                if (player && player.playVideo) player.playVideo();
              }
              
              function pauseVideo() {
                if (player && player.pauseVideo) player.pauseVideo();
              }
              
              function stopVideo() {
                if (player && player.stopVideo) player.stopVideo();
              }
              
              function seekTo(seconds) {
                if (player && player.seekTo) {
                  var current = player.getCurrentTime();
                  player.seekTo(current + seconds, true);
                }
              }
              
              function setVolume(volume) {
                if (player && player.setVolume) player.setVolume(volume * 100);
              }
              
              function mute() {
                if (player && player.mute) player.mute();
              }
              
              function unMute() {
                if (player && player.unMute) player.unMute();
              }
            </script>
          </head>
          <body>
            <div class="video-container">
              <div id="player"></div>
            </div>
          </body>
        </html>
      `;
    } else if (sourceInfo.type === 'vimeo' && sourceInfo.videoId) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <style>
              body { margin: 0; padding: 0; background: #000; }
              .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
              .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            </style>
            <script src="https://player.vimeo.com/api/player.js"></script>
          </head>
          <body>
            <div class="video-container">
              <iframe id="vimeo-player"
                src="https://player.vimeo.com/video/${sourceInfo.videoId}?autoplay=1"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
            <script>
              var iframe = document.querySelector('#vimeo-player');
              var player = new Vimeo.Player(iframe);
              
              player.on('play', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'play'}));
              });
              
              player.on('pause', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'pause'}));
              });
              
              player.on('ended', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ended'}));
              });
              
              function playVideo() {
                player.play();
              }
              
              function pauseVideo() {
                player.pause();
              }
              
              function stopVideo() {
                player.pause();
                player.setCurrentTime(0);
              }
              
              function seekTo(seconds) {
                player.getCurrentTime().then(function(time) {
                  player.setCurrentTime(time + seconds);
                });
              }
              
              function setVolume(volume) {
                player.setVolume(volume);
              }
              
              function mute() {
                player.setVolume(0);
              }
              
              function unMute() {
                player.setVolume(1);
              }
            </script>
          </body>
        </html>
      `;
    }
    return '';
  }, [sourceInfo]);

  const togglePlayPause = () => {
    if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
      if (isPlaying) {
        webViewRef.current?.injectJavaScript('pauseVideo();');
      } else {
        webViewRef.current?.injectJavaScript('playVideo();');
      }
      setIsPlaying(!isPlaying);
    } else if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (Platform.OS === 'web') {
      if (!isFullscreen) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const messageData = event?.nativeEvent?.data;
      if (!messageData || typeof messageData !== 'string') return;
      
      const trimmed = messageData.trim();
      if (trimmed.length === 0 || !trimmed.startsWith('{')) return;
      
      const data = JSON.parse(trimmed);
      if (!data || typeof data !== 'object') return;
      
      if (data.type === 'ready') {
        setIsLoading(false);
        onLoad?.();
      } else if (data.type === 'stateChange') {
        if (data.state === 1) {
          setIsPlaying(true);
        } else if (data.state === 2 || data.state === 0) {
          setIsPlaying(false);
        }
      } else if (data.type === 'play') {
        setIsPlaying(true);
      } else if (data.type === 'pause' || data.type === 'ended') {
        setIsPlaying(false);
      }
    } catch {
      // Ignore parse errors
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          {sourceInfo.platform && (
            <Text style={styles.errorSubtext}>Platform: {sourceInfo.platform}</Text>
          )}
        </View>
      </View>
    );
  }

  if (!url || url.trim() === '') {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorText}>No video URL provided</Text>
        </View>
      </View>
    );
  }

  if (sourceInfo.type === 'youtube' || sourceInfo.type === 'vimeo') {
    const embedHtml = getEmbedHtml();
    
    if (!embedHtml) {
      return (
        <View style={styles.container}>
          <View style={styles.errorOverlay}>
            <AlertCircle size={48} color="#ff4444" />
            <Text style={styles.errorText}>Unable to parse video ID</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ html: embedHtml }}
          style={styles.webview}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onMessage={handleWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            const errorMsg = `Video loading failed: ${nativeEvent.description || 'Unknown error'}`;
            setError(errorMsg);
            onError?.(errorMsg);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          )}
        />
        
        <TouchableOpacity 
          style={styles.webviewControlsOverlay}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        >
          {showControls && (
            <View style={styles.webviewControls}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.webviewPlayButton}>
                {isPlaying ? (
                  <Pause size={40} color="#fff" />
                ) : (
                  <Play size={40} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!isValidPlayer) {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorText}>Unsupported video format</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.controlsOverlay}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        {showControls && !error && !isLoading && (
          <>
            <View style={styles.topControls}>
              <TouchableOpacity onPress={handleFullscreen}>
                {isFullscreen ? (
                  <Minimize size={24} color="#fff" />
                ) : (
                  <Maximize size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => seek(-10)} style={styles.controlButton}>
                <SkipBack size={32} color="#fff" />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                {isPlaying ? (
                  <Pause size={40} color="#fff" />
                ) : (
                  <Play size={40} color="#fff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => seek(10)} style={styles.controlButton}>
                <SkipForward size={32} color="#fff" />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }]} 
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
              <TouchableOpacity onPress={() => toggleMute()} style={styles.volumeButton}>
                {isMuted ? (
                  <VolumeX size={20} color="#fff" />
                ) : (
                  <Volume2 size={20} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowQualityMenu(!showQualityMenu)} style={styles.settingsButton}>
                <Settings size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {showQualityMenu && (
              <View style={styles.qualityMenu}>
                <Text style={styles.qualityTitle}>Playback Speed</Text>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.qualityOption,
                      playbackRate === rate && styles.qualityOptionSelected,
                    ]}
                    onPress={() => {
                      changePlaybackSpeed(rate);
                      setShowQualityMenu(false);
                    }}
                  >
                    <Text style={styles.qualityOptionText}>
                      {rate}x {rate === 1.0 && '(Normal)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  webviewControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webviewControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  webviewPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  volumeButton: {
    padding: 5,
  },
  settingsButton: {
    padding: 5,
  },
  qualityMenu: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 10,
    minWidth: 150,
  },
  qualityTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  qualityOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  qualityOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  qualityOptionText: {
    color: '#fff',
    fontSize: 14,
  },
});
