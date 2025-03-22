import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-5 h-5 text-gray-600" />
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">{t('language.en')}</option>
        <option value="ro">{t('language.ro')}</option>
      </select>
    </div>
  );
};