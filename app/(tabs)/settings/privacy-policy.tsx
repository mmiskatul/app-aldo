import LegalDocumentScreen from '../../../components/settings/LegalDocumentScreen';
import { getPrivacyPolicy } from '../../../api/settings';

export default function PrivacyPolicyScreen() {
  return (
    <LegalDocumentScreen
      cacheKey="privacy-policy"
      datePrefix="Effective date"
      defaultTitle="Privacy Policy"
      errorFallback="Failed to load privacy policy."
      errorTitle="Unable to load privacy policy"
      headerTitle="Privacy Policy"
      loadDocument={getPrivacyPolicy}
    />
  );
}
