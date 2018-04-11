import { Routes, RouterModule } from '@angular/router';

import { DocListComponent } from './home/index';

import { AuthGuard, AdminGuard, LandingGuard} from './_guards/index';

const appRoutes: Routes = [
    { path: 'docs', loadChildren:'./home/doclist.module#DocListModule', canActivate: [AuthGuard]},
    { path: 'flow/:id', loadChildren: './diagram/diagram.module#DiagramModule', canActivate: [AuthGuard]},
    { path: 'mind/:id', loadChildren: './mind-diagram/mind-diagram.module#MDModule', canActivate: [AuthGuard]},
    { path: 'share', loadChildren: './share/share.module#ShareModule' },
    { path: 'save', loadChildren: './share/share.module#ShareModule', data:{action:'save'}, canActivate: [AuthGuard] },
    { path: 'landing', loadChildren: './landing/landing.module#LandingModule'},
    { path: 'login', loadChildren: './login/login.module#LoginModule'},
    { path: 'register', loadChildren: './register/register.module#RegisterModule'},
    { path: 'mergeUser', loadChildren: './merge-user/mergeUser.module#MergeUserModule'},
    // otherwise redirect to home
    { path: '',  loadChildren: './landing/landing.module#LandingModule' , canActivate: [LandingGuard]},
    { path: '**',  redirectTo: 'docs' },
];

export const routing = RouterModule.forRoot(appRoutes);