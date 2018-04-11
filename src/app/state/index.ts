import { NgModule } from '@angular/core';
import { BusyService } from '../_services/busy.service';
import { HomeState } from './home.state';
import { PageState } from './page.state';
import { Config } from './config';
export { HomeState, PageState, Config };
@NgModule({
  providers: [BusyService, HomeState, PageState, Config]
})
export class AppStateModule {
};
