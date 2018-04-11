import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(url) {
    return browser.get(url || '/');
  }

  getParagraphText() {
    return element(by.css('h2')).getText();
  }
}
