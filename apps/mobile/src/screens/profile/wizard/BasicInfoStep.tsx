import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function BasicInfoStep({ data, onNext, isFirst }: Props) {
  const [formData, setFormData] = useState({
    full_name: data.full_name || '',
    location_state: data.location_state || '',
    location_district: data.location_district || '',
    location_city: data.location_city || '',
    phone: data.phone || '',
    whatsapp_number: data.whatsapp_number || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatePicker, setShowStatePicker] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.location_state) {
      newErrors.location_state = 'State is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Let's start with the basics</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself to create your PoultryCo profile
          </Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.full_name && styles.inputError]}
              value={formData.full_name}
              onChangeText={(text) => {
                setFormData({ ...formData, full_name: text });
                if (errors.full_name) {
                  setErrors({ ...errors, full_name: '' });
                }
              }}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
            {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
          </View>

          {/* State */}
          <View style={styles.field}>
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.picker, errors.location_state && styles.inputError]}
              onPress={() => setShowStatePicker(!showStatePicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !formData.location_state && styles.pickerPlaceholder,
                ]}
              >
                {formData.location_state || 'Select your state'}
              </Text>
            </TouchableOpacity>
            {errors.location_state && (
              <Text style={styles.errorText}>{errors.location_state}</Text>
            )}

            {/* Simple State Picker */}
            {showStatePicker && (
              <ScrollView style={styles.stateList} nestedScrollEnabled>
                {INDIAN_STATES.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateItem,
                      formData.location_state === state && styles.stateItemSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, location_state: state });
                      setShowStatePicker(false);
                      if (errors.location_state) {
                        setErrors({ ...errors, location_state: '' });
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.stateItemText,
                        formData.location_state === state && styles.stateItemTextSelected,
                      ]}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* District */}
          <View style={styles.field}>
            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              value={formData.location_district}
              onChangeText={(text) => setFormData({ ...formData, location_district: text })}
              placeholder="Enter your district"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* City/Town */}
          <View style={styles.field}>
            <Text style={styles.label}>City/Town</Text>
            <TextInput
              style={styles.input}
              value={formData.location_city}
              onChangeText={(text) => setFormData({ ...formData, location_city: text })}
              placeholder="Enter your city or town"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => {
                setFormData({ ...formData, phone: text });
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              placeholder="+91 9876543210"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* WhatsApp */}
          <View style={styles.field}>
            <Text style={styles.label}>WhatsApp Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.whatsapp_number}
              onChangeText={(text) => setFormData({ ...formData, whatsapp_number: text })}
              placeholder="If different from phone"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
            <Text style={styles.hint}>Leave blank if same as phone number</Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleNext}>
          <Text style={styles.buttonPrimaryText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  picker: {
    justifyContent: 'center',
  },
  pickerText: {
    ...typography.body,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textTertiary,
  },
  stateList: {
    maxHeight: 200,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  stateItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stateItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  stateItemText: {
    ...typography.body,
    color: colors.text,
  },
  stateItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});

