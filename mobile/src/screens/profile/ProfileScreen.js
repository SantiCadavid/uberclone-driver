// AI-assisted: see docs/AI_LOG.md #21, #22, #25, #29
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { signOutDriver, updateDriverProfile } from '../../services/driverService';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import LanguageSelector from '../../components/common/LanguageSelector';
import Button from '../../components/common/Button';
import {
  GENDER_OPTIONS,
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../../config/registration';
import { TRIP_CONFIG } from '../../config/trip';
import { optionLabel, translateOptions } from '../../i18n';
import { buildProfileUpdate, hasProfileChanges, validateProfileData } from '../../utils/profileValidators';
import { hasErrors } from '../../utils/validators';
import { formatDate } from '../../utils/dates';
import { withTimeout } from '../../utils/withTimeout';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

// Firestore returns Timestamps; the profile also tolerates plain Dates or missing values
const toDate = (value) => value?.toDate?.() ?? (value instanceof Date ? value : null);
const toForm = (driver) => ({ fullName: driver.fullName ?? '', phone: driver.phone ?? '', gender: driver.gender ?? null });
const initials = (name) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ProfileContent({ uid, driver }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => toForm(driver));
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Same validators as the sign-up, recalculated when the form or the language changes
  const errors = useMemo(() => validateProfileData(form, t), [form, t]);
  const genderOptions = useMemo(() => translateOptions(GENDER_OPTIONS, t), [t]);
  const changed = hasProfileChanges(driver, form);
  const errorFor = (field) => (touched[field] ? errors[field] : null);

  const updateField = useCallback((field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setTouched((previous) => (previous[field] ? previous : { ...previous, [field]: true }));
    setMessage(null);
  }, []);

  const handleSave = async () => {
    setTouched({ fullName: true, phone: true, gender: true });
    if (hasErrors(errors) || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await withTimeout(updateDriverProfile(uid, buildProfileUpdate(form)), TRIP_CONFIG.actionTimeoutMs);
      setMessage({ type: 'success', text: t('profile.saved') });
    } catch (saveError) {
      setMessage({ type: 'error', text: t('profile.saveError') });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOutDriver(uid, driver.isAvailable);
      // RootNavigator shows the Login when the session ends
    } catch (logoutError) {
      setMessage({ type: 'error', text: t('profile.logoutError') });
      setLoggingOut(false);
    }
  };

  const vehicle = driver.vehicle ?? {};
  const documents = driver.documents;
  const inspection = documents?.technicalInspection;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          {/* Cloudinary photo when it exists; initials for accounts created before step 21 */}
          {driver.profilePhotoUrl ? (
            <Image source={{ uri: driver.profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(driver.fullName)}</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.name}>{driver.fullName}</Text>
            <Text style={styles.muted}>{driver.email}</Text>
          </View>
        </View>

        <Text style={styles.section}>{t('profile.language')}</Text>
        {/* Changing it here updates the whole app and is copied to the profile by LanguageContext */}
        <LanguageSelector showLabel={false} />
        <Text style={styles.note}>{t('profile.languageNote')}</Text>

        <Text style={styles.section}>{t('profile.personal')}</Text>
        <TextField
          label={t('profile.fullName')}
          value={form.fullName}
          onChangeText={(text) => updateField('fullName', text)}
          error={errorFor('fullName')}
          autoCapitalize="words"
          maxLength={RULES.maxFullNameLength}
        />
        <TextField
          label={t('profile.phone')}
          value={form.phone}
          onChangeText={(text) => updateField('phone', text)}
          error={errorFor('phone')}
          keyboardType="number-pad"
          maxLength={RULES.phoneDigits}
        />
        <SelectField
          label={t('profile.gender')}
          value={form.gender}
          options={genderOptions}
          onChange={(value) => updateField('gender', value)}
          error={errorFor('gender')}
        />
        <InfoRow label={t('profile.email')} value={driver.email ?? '—'} />
        <InfoRow label={t('profile.documentId')} value={driver.documentId ?? '—'} />
        <InfoRow label={t('profile.birthDate')} value={formatDate(toDate(driver.birthDate))} />
        <Text style={styles.note}>{t('profile.readOnlyNote')}</Text>

        <Button
          label={t('profile.save')}
          onPress={handleSave}
          disabled={!changed}
          loading={saving}
          style={styles.saveButton}
        />
        {message && (
          <Text style={[styles.message, { color: message.type === 'success' ? colors.success : colors.error }]}>
            {message.text}
          </Text>
        )}

        <Text style={styles.section}>{t('profile.vehicle')}</Text>
        {vehicle.photoUrl && (
          <Image
            source={{ uri: vehicle.photoUrl }}
            style={styles.vehiclePhoto}
            accessibilityLabel={t('profile.vehiclePhoto')}
          />
        )}
        <InfoRow label={t('profile.category')} value={optionLabel(VEHICLE_CATEGORY_OPTIONS, vehicle.category, t)} />
        <InfoRow label={t('profile.plate')} value={vehicle.plate ?? '—'} />
        <InfoRow label={t('profile.brandModel')} value={`${vehicle.brand ?? '—'} ${vehicle.model ?? ''}`.trim()} />
        <InfoRow label={t('profile.year')} value={vehicle.year ? String(vehicle.year) : '—'} />
        <InfoRow label={t('profile.color')} value={optionLabel(VEHICLE_COLOR_OPTIONS, vehicle.color, t)} />
        <InfoRow label={t('profile.capacity')} value={vehicle.capacity ? String(vehicle.capacity) : '—'} />

        <Text style={styles.section}>{t('profile.documents')}</Text>
        {documents ? (
          <>
            <InfoRow label={t('profile.licenseNumber')} value={documents.license?.number ?? '—'} />
            <InfoRow label={t('profile.licenseExpiry')} value={formatDate(toDate(documents.license?.expiresAt))} />
            <InfoRow label={t('profile.soatExpiry')} value={formatDate(toDate(documents.soat?.expiresAt))} />
            <InfoRow
              label={t('profile.inspection')}
              value={inspection?.required ? formatDate(toDate(inspection.expiresAt)) : t('profile.notApplicable')}
            />
            <InfoRow label={t('profile.mercadoPagoEmail')} value={documents.mercadoPagoEmail ?? '—'} />
            <InfoRow
              label={t('profile.commission')}
              value={
                Number.isFinite(documents.acceptedCommissionRate)
                  ? `${Math.round(documents.acceptedCommissionRate * 100)} %`
                  : '—'
              }
            />
          </>
        ) : (
          <Text style={styles.note}>{t('profile.noDocuments')}</Text>
        )}
        <Text style={styles.note}>{t('profile.vehicleNote')}</Text>

        <Button
          label={t('profile.logout')}
          variant="danger"
          onPress={handleLogout}
          loading={loggingOut}
          style={styles.logoutButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ProfileScreen() {
  const { uid, driver, loading, error } = useDriver();
  const { t } = useLanguage();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error || !driver) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('profile.notFound')}</Text>
      </View>
    );
  }
  // key: the form starts again from the profile if a different driver logs in
  return <ProfileContent key={uid} uid={uid} driver={driver} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.xl, paddingBottom: space.xxl + space.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 24, color: colors.primaryText },
  headerText: { marginLeft: space.lg, flex: 1 },
  name: type.cardTitle,
  muted: { ...type.caption, marginTop: 2 },
  section: { ...type.section, marginTop: space.xl, marginBottom: space.md },
  vehiclePhoto: { width: '100%', height: 180, borderRadius: radius.card, marginBottom: space.sm, backgroundColor: colors.surface },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: space.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { ...type.body, color: colors.muted },
  infoValue: { ...type.body, flexShrink: 1, textAlign: 'right', marginLeft: space.md },
  note: { ...type.caption, marginTop: space.sm },
  saveButton: { marginTop: space.lg },
  message: { fontFamily: fonts.semibold, fontSize: 14, textAlign: 'center', marginTop: space.md },
  logoutButton: { marginTop: space.xxl },
  errorText: { ...type.body, color: colors.error, textAlign: 'center' },
});