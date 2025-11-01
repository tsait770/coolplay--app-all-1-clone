import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback, Component, ReactNode } from "react";
import { StyleSheet, Platform, Alert, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
// eslint-disable-next-line @rork/linters/rsp-no-asyncstorage-direct
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from "@/hooks/useLanguage";
import { BookmarkProvider } from "@/providers/BookmarkProvider";
import { CategoryProvider } from "@/providers/CategoryProvider";
import { ReferralProvider, useReferral } from "@/providers/ReferralProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { StripeProvider } from "@/providers/StripeProvider";
import { VoiceControlProvider, useVoiceControl } from "@/providers/VoiceControlProvider";
import { SiriIntegrationProvider, useSiriIntegration } from "@/providers/SiriIntegrationProvider";
import { StorageProvider, useStorage } from "@/providers/StorageProvider";
import ReferralCodeModal from "@/components/ReferralCodeModal";
import Colors from "@/constants/colors";
import VoiceOnboardingModal from "@/components/VoiceOnboardingModal";
import { SoundProvider } from "@/providers/SoundProvider";
import { MembershipProvider } from "@/providers/MembershipProvider";
import { RatingProvider } from "@/providers/RatingProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>Please refresh the app</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  const storage = useStorage();
  const { userData } = useReferral();
  const voice = useVoiceControl();
  const siri = useSiriIntegration();
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState<boolean>(false);
  const [showVoiceOnboarding, setShowVoiceOnboarding] = useState<boolean>(false);

  useEffect(() => {
    let referralTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let voiceTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let mounted = true;

    const checkFirstTimeUser = async () => {
      try {
        const hasSeenModal = await storage.getItem('hasSeenReferralModal');
        const isFirstTime = !hasSeenModal && !userData.hasUsedReferralCode;

        if (isFirstTime && mounted) {
          referralTimeoutId = setTimeout(() => {
            if (mounted) {
              setShowReferralModal(true);
            }
          }, 1500);
        }

        const hasCompletedVoiceOnboarding = await storage.getItem('hasCompletedVoiceOnboarding');
        if (hasCompletedVoiceOnboarding !== 'true' && mounted) {
          voiceTimeoutId = setTimeout(() => {
            if (mounted) {
              setShowVoiceOnboarding(true);
            }
          }, 2000);
        }

        if (mounted) {
          setHasCheckedFirstTime(true);
        }
      } catch (error) {
        console.error('Error checking first time user:', error);
        if (mounted) {
          setHasCheckedFirstTime(true);
        }
      }
    };

    checkFirstTimeUser();

    return () => {
      mounted = false;
      if (referralTimeoutId) {
        clearTimeout(referralTimeoutId);
        referralTimeoutId = null;
      }
      if (voiceTimeoutId) {
        clearTimeout(voiceTimeoutId);
        voiceTimeoutId = null;
      }
    };
  }, [storage, userData.hasUsedReferralCode]);

  const handleModalClose = async () => {
    setShowReferralModal(false);
    try {
      await storage.setItem('hasSeenReferralModal', 'true');
    } catch (error) {
      console.error('Error saving modal state:', error);
    }
  };

  const handleCompleteVoiceOnboarding = useCallback(async () => {
    try {
      await storage.setItem('hasCompletedVoiceOnboarding', 'true');
      setShowVoiceOnboarding(false);
    } catch (error) {
      console.error('Error saving voice onboarding state:', error);
    }
  }, [storage]);

  const handleEnableInAppVoice = useCallback(async () => {
    try {
      if (typeof voice?.startListening === 'function') {
        await voice.startListening();
      }
    } catch (e) {
      console.error('Failed to start in-app voice:', e);
      Alert.alert('Error', 'Failed to start voice control');
    } finally {
      handleCompleteVoiceOnboarding();
    }
  }, [voice, handleCompleteVoiceOnboarding]);

  const handleEnableSiri = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        if (typeof siri?.enableSiri === 'function') {
          await siri.enableSiri();
        }
        if (typeof siri?.registerShortcuts === 'function') {
          await siri.registerShortcuts();
        }
      } else {
        Alert.alert('Info', 'Siri is available on iOS only');
      }
    } catch (e) {
      console.error('Failed to enable Siri:', e);
    } finally {
      handleCompleteVoiceOnboarding();
    }
  }, [siri, handleCompleteVoiceOnboarding]);

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="subscription/index" options={{ headerShown: false }} />
      </Stack>
      {hasCheckedFirstTime && (
        <>
          <ReferralCodeModal
            visible={showReferralModal}
            onClose={handleModalClose}
            isFirstTime={true}
          />
          <VoiceOnboardingModal
            visible={showVoiceOnboarding}
            onClose={handleCompleteVoiceOnboarding}
            onEnableInApp={handleEnableInAppVoice}
            onEnableSiri={handleEnableSiri}
          />
        </>
      )}
    </>
  );
}

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [preloadedData, setPreloadedData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[App] Starting initialization...');
        const startTime = Date.now();
        
        try {
          const corruptedCount = await (async () => {
            try {
              const allKeys = await AsyncStorage.getAllKeys();
              const corruptedKeys: string[] = [];
              
              for (const key of allKeys) {
                try {
                  const data = await AsyncStorage.getItem(key);
                  if (data && typeof data === 'string' && data.length > 0) {
                    const cleaned = data.trim();
                    if (cleaned.includes('[object Object]') || 
                        cleaned === 'undefined' || 
                        cleaned === 'NaN' ||
                        cleaned === 'null' ||
                        cleaned.startsWith('object ') ||
                        cleaned.startsWith('Object ')) {
                      corruptedKeys.push(key);
                    } else if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
                      try {
                        JSON.parse(cleaned);
                      } catch {
                        corruptedKeys.push(key);
                      }
                    }
                  }
                } catch {}
              }
              
              if (corruptedKeys.length > 0) {
                console.log(`[App] Clearing ${corruptedKeys.length} corrupted storage keys`);
                await AsyncStorage.multiRemove(corruptedKeys);
              }
              
              return corruptedKeys.length;
            } catch {
              return 0;
            }
          })();
          
          if (corruptedCount > 0) {
            console.log(`[App] Cleared ${corruptedCount} corrupted storage entries`);
          }
        } catch (cleanupError) {
          console.warn('[App] Storage cleanup failed, continuing...', cleanupError);
        }
        
        console.log('[App] Preloading critical data in parallel...');
        const preloadStart = Date.now();
        
        const criticalKeys = [
          '@coolplay_bookmarks',
          '@coolplay_folders',
          'bookmark_categories',
          'voiceControlSettings',
          'voiceControlAutoStart',
          'hasCompletedVoiceOnboarding',
          '@coolplay_first_time_modal_shown',
          'hasSeenReferralModal',
          'membershipData',
          'pref_sound_enabled',
        ];
        
        const preloadResults = await Promise.all(
          criticalKeys.map(async (key) => {
            try {
              const value = await AsyncStorage.getItem(key);
              return [key, value];
            } catch (error) {
              console.warn(`[App] Failed to preload ${key}:`, error);
              return [key, null];
            }
          })
        );
        
        const preloadedDataMap = Object.fromEntries(preloadResults);
        setPreloadedData(preloadedDataMap);
        
        const preloadDuration = Date.now() - preloadStart;
        console.log(`[App] Preloaded ${criticalKeys.length} keys in ${preloadDuration}ms`);
        
        await SplashScreen.hideAsync();
        setIsInitialized(true);
        
        const duration = Date.now() - startTime;
        console.log(`[App] Initialization completed in ${duration}ms`);
      } catch (error) {
        console.error('[App] Initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorSubtext}>{initError}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer} testID="app-loading">
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <StorageProvider>
              <LanguageProvider>
                <AuthProvider>
                  <StripeProvider>
                    <MembershipProvider>
                      <RatingProvider>
                        <CategoryProvider>
                          <BookmarkProvider>
                            <ReferralProvider>
                              <SoundProvider>
                                <VoiceControlProvider>
                                  <SiriIntegrationProvider>
                                    <GestureHandlerRootView style={styles.container}>
                                      <RootLayoutNav />
                                    </GestureHandlerRootView>
                                  </SiriIntegrationProvider>
                                </VoiceControlProvider>
                              </SoundProvider>
                            </ReferralProvider>
                          </BookmarkProvider>
                        </CategoryProvider>
                      </RatingProvider>
                    </MembershipProvider>
                  </StripeProvider>
                </AuthProvider>
              </LanguageProvider>
            </StorageProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.bg,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary.text,
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.bg,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary.text,
  },
});
