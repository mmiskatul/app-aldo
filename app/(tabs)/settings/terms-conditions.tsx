import LegalDocumentScreen from '../../../components/settings/LegalDocumentScreen';
import { getTermsOfService } from '../../../api/settings';

export default function TermsConditionsScreen() {
  return (
    <LegalDocumentScreen
      cacheKey="terms-of-service"
      datePrefix="Last updated"
      defaultTitle="Terms of Service"
      errorFallback="Failed to load terms and conditions."
      errorTitle="Unable to load terms"
      headerTitle="Terms of Service"
      loadDocument={getTermsOfService}
    />
  );
}
