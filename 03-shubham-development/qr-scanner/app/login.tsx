import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { AppTheme } from '../constants/appTheme';

const { width } = Dimensions.get('window');

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError, isAuthenticated, token } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Navigate to events page when login is successful
  useEffect(() => {
    if (isAuthenticated && token) {
      console.debug('Login successful - navigating to events');
      router.replace('/(tabs)/events');
    }
  }, [isAuthenticated, token, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      setLoading(true);
      await login(data.email, data.password);
    } catch (err: any) {
      console.error('Unexpected login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/shubham-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title Section */}
        <View style={styles.header}>
          <Text style={styles.title}>QR Scanner</Text>
          <Text style={styles.subtitle}>Event Entry Management</Text>
        </View>

        {/* Main Form Card */}
        <View style={styles.form}>
          {/* Error Banner with Icon */}
          {error && (
            <View style={styles.errorBanner}>
              <View style={styles.errorIconBox}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#c92a2a"
                />
              </View>
              <Text style={styles.errorBannerText}>{error.message}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="mail-outline"
                size={16}
                color={AppTheme.colors.maroonPrimary}
              />
              <Text style={styles.label}>Email Address</Text>
            </View>
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="your.email@example.com"
                  placeholderTextColor={AppTheme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!loading}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="email"
            />
            {errors.email && (
              <View style={styles.fieldError}>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={AppTheme.colors.error}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
              </View>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={AppTheme.colors.maroonPrimary}
              />
              <Text style={styles.label}>Password</Text>
            </View>
            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
                    placeholder="Enter your password"
                    placeholderTextColor={AppTheme.colors.textMuted}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={AppTheme.colors.maroonPrimary}
                    />
                  </TouchableOpacity>
                </View>
              )}
              name="password"
            />
            {errors.password && (
              <View style={styles.fieldError}>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={AppTheme.colors.error}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
              </View>
            )}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading || !isValid ? styles.loginButtonDisabled : null,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={AppTheme.colors.textWhite} size="small" />
                <Text style={styles.signingInText}>Signing in...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="log-in"
                  size={20}
                  color={AppTheme.colors.textWhite}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  } as const,
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.xl,
  } as const,

  /* Logo Section */
  logoContainer: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
    paddingTop: AppTheme.spacing.md,
  } as const,
  logo: {
    width: 70,
    height: 70,
    borderRadius: 12,
  } as const,

  /* Header Section */
  header: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl + AppTheme.spacing.md,
  } as const,
  title: {
    fontSize: AppTheme.fonts.sizes['3xl'],
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.maroonPrimary,
    marginBottom: AppTheme.spacing.sm,
    letterSpacing: -0.5,
  } as const,
  subtitle: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.medium as any,
    letterSpacing: 0.3,
    textAlign: 'center' as const,
  } as const,

  /* Form Container */
  form: {
    marginBottom: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.xl,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.xl,
    ...AppTheme.shadows.lg,
  } as const,

  /* Error Banner */
  errorBanner: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.error,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
    borderRadius: AppTheme.radius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  } as const,
  errorIconBox: {
    marginRight: AppTheme.spacing.md,
    marginTop: 2,
  } as const,
  errorBannerText: {
    color: AppTheme.colors.error,
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.medium as any,
    lineHeight: 20,
    flex: 1,
  } as const,

  /* Form Fields */
  fieldGroup: {
    marginBottom: AppTheme.spacing.lg,
  } as const,
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  } as const,
  label: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
    marginLeft: AppTheme.spacing.sm,
    letterSpacing: 0.3,
  } as const,
  input: {
    borderWidth: 1.5,
    borderColor: '#e1e4e8',
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textPrimary,
    backgroundColor: '#fafbfc',
    fontWeight: '500',
  } as const,
  inputError: {
    borderColor: AppTheme.colors.error,
    backgroundColor: '#fff5f5',
  } as const,

  /* Password Field */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  } as const,
  passwordInput: {
    flex: 1,
    paddingRight: AppTheme.spacing.xl + AppTheme.spacing.lg,
  } as const,
  passwordToggle: {
    position: 'absolute',
    right: AppTheme.spacing.md,
    padding: AppTheme.spacing.sm,
  } as const,

  /* Field Error */
  fieldError: {
    marginTop: AppTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  } as const,
  fieldErrorText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.error,
    fontWeight: AppTheme.fonts.weights.medium as any,
    lineHeight: 18,
  } as const,

  /* Login Button */
  loginButton: {
    backgroundColor: AppTheme.colors.maroonPrimary,
    paddingVertical: AppTheme.spacing.md + 2,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
    borderWidth: 0,
  } as const,
  loginButtonDisabled: {
    backgroundColor: '#bdbdbd',
    opacity: 0.6,
  } as const,
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  loginButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.3,
  } as const,
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  signingInText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.medium as any,
    marginLeft: AppTheme.spacing.md,
  } as const,

  /* Footer Section */
  footer: {
    marginTop: AppTheme.spacing.lg,
  } as const,
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.md,
  } as const,
  footerText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.medium as any,
    marginLeft: AppTheme.spacing.md,
    lineHeight: 18,
    flex: 1,
  } as const,
});
