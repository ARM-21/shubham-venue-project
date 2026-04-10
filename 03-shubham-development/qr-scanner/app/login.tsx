import React, { useState } from 'react';
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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { AppTheme } from '../constants/appTheme';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError } = useAuth();
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
        <View style={styles.header}>
          <Text style={styles.title}>QR Scanner</Text>
          <Text style={styles.subtitle}>Event Entry Management</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error.message}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
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
              <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
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
              <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              loading || !isValid ? styles.loginButtonDisabled : null,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color={AppTheme.colors.textWhite} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
    marginTop: AppTheme.spacing.lg,
  } as const,
  title: {
    fontSize: AppTheme.fonts.sizes['3xl'],
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: AppTheme.colors.maroonPrimary,
    marginBottom: AppTheme.spacing.md,
    letterSpacing: -0.5,
  } as const,
  subtitle: {
    fontSize: AppTheme.fonts.sizes.sm,
    color: AppTheme.colors.textSecondary,
    fontWeight: AppTheme.fonts.weights.medium as any,
    letterSpacing: 0.4,
    textAlign: 'center' as const,
  } as const,
  form: {
    marginBottom: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.lg,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.xl,
    ...AppTheme.shadows.lg,
  } as const,
  errorBanner: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
    borderRadius: AppTheme.radius.sm,
  } as const,
  errorBannerText: {
    color: '#c92a2a',
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.medium as any,
    lineHeight: 20,
  } as const,
  fieldGroup: {
    marginBottom: AppTheme.spacing.md,
  } as const,
  label: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.semibold as any,
    color: AppTheme.colors.textPrimary,
    marginBottom: AppTheme.spacing.sm,
    letterSpacing: 0.3,
  } as const,
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textPrimary,
    backgroundColor: '#fafafa',
  } as const,
  inputError: {
    borderColor: AppTheme.colors.error,
    backgroundColor: '#fff5f5',
  } as const,
  fieldErrorText: {
    marginTop: AppTheme.spacing.sm,
    fontSize: AppTheme.fonts.sizes.xs,
    color: AppTheme.colors.error,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
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
  loginButton: {
    backgroundColor: AppTheme.colors.maroonPrimary,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppTheme.spacing.xl,
    ...AppTheme.shadows.lg,
  } as const,
  loginButtonDisabled: {
    backgroundColor: AppTheme.colors.textMuted,
    opacity: AppTheme.opacity.disabled,
  } as const,
  loginButtonText: {
    color: AppTheme.colors.textWhite,
    fontSize: AppTheme.fonts.sizes.base,
    fontWeight: AppTheme.fonts.weights.bold as any,
    letterSpacing: 0.3,
  } as const,
  infoFooter: {
    backgroundColor: '#e8f4f8',
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.info,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    borderRadius: AppTheme.radius.md,
  } as const,
  infoTitle: {
    fontSize: AppTheme.fonts.sizes.sm,
    fontWeight: AppTheme.fonts.weights.bold as any,
    color: '#0c5460',
    marginBottom: AppTheme.spacing.md,
    letterSpacing: 0.2,
  } as const,
  infoText: {
    fontSize: AppTheme.fonts.sizes.xs,
    color: '#0c5460',
    lineHeight: 22,
    marginBottom: AppTheme.spacing.md,
    fontWeight: AppTheme.fonts.weights.medium as any,
  } as const,
});
 