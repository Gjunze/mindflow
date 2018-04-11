import { AppPage } from './app.po';
import { browser, by, element } from 'protractor';

describe('ng-test2 App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should login', async () => {
    await page.navigateTo('/login');
    await element(by.name('email')).sendKeys('ligang@me.com')
    await element(by.name('password')).sendKeys('xxxxxx')
    await element(by.name('login-button')).click();
    await browser.sleep(1000)
    expect(browser.getCurrentUrl()).toEqual('http://localhost:4200/docs')
  });
});
