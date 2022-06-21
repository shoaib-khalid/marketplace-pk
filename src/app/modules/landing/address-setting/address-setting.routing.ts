import { Route } from '@angular/router';
import { CustomerAddressResolver } from '../landing.resolvers';
import { AddressSettingsComponent } from './address-setting.component';


export const addressSettingsRoutes: Route[] = [
    {
        path     : '',
        children   : [
            {
                path: '',
                resolve  : {
                    address: CustomerAddressResolver
                },
                data: {
                    headerTitle: 'My Address'
                },
                component: AddressSettingsComponent,
            }
        ],
    }

]; 
