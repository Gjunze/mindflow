import { AppPage } from './app.po';

describe('ng-test2 App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo('/');
    expect(page.getParagraphText()).toEqual('极简思维导图');
  });
});
