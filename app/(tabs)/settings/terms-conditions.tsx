import LegalDocumentScreen from '../../../components/settings/LegalDocumentScreen';
import { getTermsOfService } from '../../../api/settings';
import { useTranslation } from '../../../utils/i18n';

export default function TermsConditionsScreen() {
  const { t } = useTranslation();
  return (
    <LegalDocumentScreen
      cacheKey="terms-of-service"
      datePrefix={t('legal_last_updated')}
      defaultTitle={t('terms_of_service')}
      errorFallback={t('terms_load_failed')}
      errorTitle={t('terms_unable_to_load')}
      headerTitle={t('terms_of_service')}
      loadDocument={getTermsOfService}
    />
  );
}
