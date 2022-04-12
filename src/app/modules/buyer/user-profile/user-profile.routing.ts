import { Route } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
// import { EditProfileComponent } from './edit-profile/edit-profile.component';

export const userProfileRoutes: Route[] = [
    {
        path     : '',
        component: EditProfileComponent,
        // resolve  : {
        //     clients: GetClientResolver,
        //     profilePayment: GetProfilePaymentResolver
        // },
    }
];
