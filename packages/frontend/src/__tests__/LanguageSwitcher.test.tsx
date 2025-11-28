import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

describe('LanguageSwitcher Component', () => {
    beforeEach(() => {
        // Reset language to English before each test
        i18n.changeLanguage('en')
    })

    it('should render language switcher buttons', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        )

        const englishBtn = screen.getByText('English')
        const spanishBtn = screen.getByText('Español')

        expect(englishBtn).toBeDefined()
        expect(spanishBtn).toBeDefined()
    })

    it('should highlight English button when English is selected', () => {
        i18n.changeLanguage('en')

        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        )

        const englishBtn = screen.getByText('English')
        expect(englishBtn.className).toContain('bg-blue-600')
    })

    it('should highlight Spanish button when Spanish is selected', () => {
        i18n.changeLanguage('es')

        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        )

        const spanishBtn = screen.getByText('Español')
        expect(spanishBtn.className).toContain('bg-blue-600')
    })

    it('should change language when button is clicked', async () => {
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        )

        const spanishBtn = screen.getByText('Español')
        fireEvent.click(spanishBtn)

        // Give i18n time to process
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(i18n.language).toBe('es')
    })

    it('should switch back to English from Spanish', async () => {
        i18n.changeLanguage('es')

        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        )

        const englishBtn = screen.getByText('English')
        fireEvent.click(englishBtn)

        // Give i18n time to process
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(i18n.language).toBe('en')
    })
})
