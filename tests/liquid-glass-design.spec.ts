import { test, expect } from '@playwright/test';

test.describe('Dashboard Liquid Glass Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3001/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Teste 1: Verificação do Tema Preto Absoluto', async ({ page }) => {
    // Verify that the main background is black
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('Teste 2: Verificação do Efeito "Liquid Glass"', async ({ page }) => {
    // Locate the first KPI card by its content
    const firstKpiCard = page.locator('div').filter({ hasText: 'Taxa de Acerto' }).first();

    // Verify the card has the liquid glass classes
    await expect(firstKpiCard).toHaveClass(/bg-neutral-900\/50/);
    await expect(firstKpiCard).toHaveClass(/backdrop-blur-lg/);
    await expect(firstKpiCard).toHaveClass(/border-neutral-700/);
  });

  test('Teste 3: Verificação da Ausência da Cor Azul', async ({ page }) => {
    // Locate the "Mensal" period button (should be active)
    const mensalButton = page.locator('button').filter({ hasText: 'Mensal' });

    // Verify it has white background and black text (not blue)
    await expect(mensalButton).toHaveClass(/bg-white/);
    await expect(mensalButton).toHaveClass(/text-black/);
  });

  test('Teste 4: Verificação dos Ícones Modernos', async ({ page }) => {
    // Locate the bottom navigation
    const bottomNav = page.locator('nav').last();

    // Verify SVG icons are present (Lucide icons render as SVG)
    const svgIcon = bottomNav.locator('svg').first();
    await expect(svgIcon).toBeVisible();
    
    // Verify the icon has proper dimensions (Lucide default)
    await expect(svgIcon).toHaveAttribute('width');
    await expect(svgIcon).toHaveAttribute('height');
  });
});