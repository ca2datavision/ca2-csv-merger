import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { LanguageSelector } from '../LanguageSelector';

const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('LanguageSelector', () => {
  it('renders language options correctly', () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('en');
    expect(options[1]).toHaveValue('ro');
  });

  it('changes language when a new option is selected', async () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    
    // Change to Romanian
    fireEvent.change(select, { target: { value: 'ro' } });
    expect(i18n.language).toBe('ro');
    
    // Change back to English
    fireEvent.change(select, { target: { value: 'en' } });
    expect(i18n.language).toBe('en');
  });

  it('displays language names in current language', async () => {
    renderWithI18n(<LanguageSelector />);
    
    // Initially in English
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Romanian')).toBeInTheDocument();
    
    // Change to Romanian
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ro' } });
    
    // Should now show language names in Romanian
    expect(screen.getByText('Engleză')).toBeInTheDocument();
    expect(screen.getByText('Română')).toBeInTheDocument();
  });
});