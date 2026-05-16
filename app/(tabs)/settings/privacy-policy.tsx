import LegalDocumentScreen from '../../../components/settings/LegalDocumentScreen';
import { getPrivacyPolicy } from '../../../api/settings';
import { useTranslation } from '../../../utils/i18n';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  return (
    <LegalDocumentScreen
      cacheKey="privacy-policy"
      datePrefix={t('legal_effective_date')}
      defaultTitle={t('privacy_policy')}
      errorFallback={t('privacy_policy_load_failed')}
      errorTitle={t('privacy_policy_unable_to_load')}
      headerTitle={t('privacy_policy')}
      loadDocument={getPrivacyPolicy}
    />
  );
}
