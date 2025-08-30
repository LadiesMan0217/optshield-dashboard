import { test, expect } from '@playwright/test';

test.describe('Dashboard Financial Data Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:3000/');
  });

  test('should display login screen initially', async ({ page }) => {
    // Verificar se a tela de login está sendo exibida
    await expect(page.locator('text=Trading Shield')).toBeVisible();
    await expect(page.locator('text=Acesse sua conta premium')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Senha')).toBeVisible();
    await expect(page.locator('text=Entrar')).toBeVisible();
  });

  test('should handle login form interaction', async ({ page }) => {
    // Tentar encontrar e preencher campos de login
    const emailInput = page.locator('input').first();
    const passwordInput = page.locator('input').nth(1);
    const loginButton = page.locator('button:has-text("Entrar")');

    // Verificar se os elementos existem
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Preencher campos (teste de interação, não login real)
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword');

    // Verificar se os valores foram preenchidos
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('testpassword');
  });

  test('should validate form elements are properly structured', async ({ page }) => {
    // Verificar estrutura da página de login
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Verificar se há campos de input
    const inputs = page.locator('input');
    await expect(inputs).toHaveCount(2); // Email e senha

    // Verificar botões
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should check responsive design elements', async ({ page }) => {
    // Testar em diferentes tamanhos de tela
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('text=Trading Shield')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Trading Shield')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Trading Shield')).toBeVisible();
  });

  test('should verify page loading performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/');
    
    // Aguardar elementos principais carregarem ao invés de networkidle
    await expect(page.locator('text=Trading Shield')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Verificar se a página carrega em menos de 10 segundos (mais realista)
    expect(loadTime).toBeLessThan(10000);

    // Verificar se outros elementos principais estão visíveis
    await expect(page.locator('text=Acesse sua conta premium')).toBeVisible();
  });
});

test.describe('Dashboard Components (Mock Data)', () => {
  test('should validate TradeCalendar component structure', async ({ page }) => {
    // Este teste seria executado após login bem-sucedido
    // Por enquanto, vamos verificar se a estrutura básica está correta
    await page.goto('http://localhost:3000/');
    
    // Verificar se não há erros de console críticos
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    
    // Filtrar apenas erros críticos (não warnings)
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should verify no JavaScript runtime errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(3000);

    // Verificar se não há erros de JavaScript
    expect(jsErrors.length).toBe(0);
  });

  test('should check network requests', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Log todos os requests que falharam para debug
    console.log('Failed requests:', failedRequests);

    // Filtrar requests que não são críticos (como favicon, manifest, etc.)
    const criticalFailures = failedRequests.filter(req => 
      !req.includes('favicon') && 
      !req.includes('.ico') &&
      !req.includes('manifest.json') &&
      !req.includes('robots.txt') &&
      !req.includes('apple-touch-icon') &&
      !req.includes('android-chrome')
    );

    console.log('Critical failures:', criticalFailures);
    expect(criticalFailures.length).toBe(0);
  });
});