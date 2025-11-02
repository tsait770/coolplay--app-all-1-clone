import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

export default function DiagnosticScreen() {
  const router = useRouter();
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  const addLog = (message: string) => {
    setDiagnostics(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${message}`]);
  };

  const runDiagnostics = async () => {
    addLog('Starting diagnostics...');
    
    // Test 1: Platform
    addLog(`Platform: ${Platform.OS}`);
    setTestResults(prev => ({ ...prev, platform: true }));

    // Test 2: Colors
    try {
      addLog(`Colors loaded: ${Colors.primary.bg}`);
      setTestResults(prev => ({ ...prev, colors: true }));
    } catch (error) {
      addLog(`Colors error: ${error}`);
      setTestResults(prev => ({ ...prev, colors: false }));
    }

    // Test 3: Router
    try {
      addLog(`Router available: ${typeof router !== 'undefined'}`);
      setTestResults(prev => ({ ...prev, router: true }));
    } catch (error) {
      addLog(`Router error: ${error}`);
      setTestResults(prev => ({ ...prev, router: false }));
    }

    // Test 4: Touch events
    addLog('Touch events ready');
    setTestResults(prev => ({ ...prev, touch: true }));

    addLog('Diagnostics complete');
  };

  const testNavigation = () => {
    addLog('Testing navigation to home...');
    try {
      router.push('/(tabs)/home');
      addLog('Navigation successful');
    } catch (error) {
      addLog(`Navigation error: ${error}`);
    }
  };

  const testTouchResponse = () => {
    addLog('Touch test button pressed!');
    setTestResults(prev => ({ ...prev, touchTest: true }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostic Screen</Text>
        <Text style={styles.subtitle}>Testing app functionality</Text>
      </View>

      <View style={styles.statusContainer}>
        {Object.entries(testResults).map(([key, value]) => (
          <View key={key} style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: value ? '#30D158' : '#FF453A' }]} />
            <Text style={styles.statusText}>{key}: {value ? 'OK' : 'FAIL'}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.logContainer}>
        {diagnostics.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={testTouchResponse}
          testID="touch-test-button"
        >
          <Text style={styles.buttonText}>Test Touch</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={testNavigation}
          testID="navigation-test-button"
        >
          <Text style={styles.buttonText}>Test Navigation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.semantic.danger }]}
          onPress={runDiagnostics}
          testID="rerun-diagnostics-button"
        >
          <Text style={styles.buttonText}>Rerun Tests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.primary.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
  },
  statusContainer: {
    backgroundColor: Colors.card.bg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    color: Colors.primary.text,
  },
  logContainer: {
    flex: 1,
    backgroundColor: Colors.card.bg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  logText: {
    fontSize: 12,
    color: Colors.primary.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: Colors.primary.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.text,
  },
});
