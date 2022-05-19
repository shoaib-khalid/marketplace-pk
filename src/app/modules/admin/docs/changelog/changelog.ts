/* eslint-disable max-len */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector       : 'changelog',
    templateUrl    : './changelog.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogComponent
{
    changelog: any[] = [
        // v0.2.0
        {
            version    : 'v0.1.0',
            releaseDate: 'Apr 04, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(HomePage) Add link in logo'
                    ]
                }
            ]
        },
        // v0.1.0
        {
            version    : 'v0.1.0',
            releaseDate: 'Apr 04, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(MyOrders) Introduce my orders',
                        '(MyVouchers) Introduce my orders',
                        '(MyProfile) Introduce my profile',
                        '(MyCarts) Introduce my carts'
                    ]
                }
            ]
        },
        // v0.0.2
        {
            version    : 'v0.0.2',
            releaseDate: 'Apr 04, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(Changelog) Added buyer, order, checkout adressess, order details',
                    ]
                }
            ]
        },
        // v0.0.1
        {
            version    : 'v0.0.1',
            releaseDate: 'Mar 25, 2022',
            changes    : [
                {
                    type: 'Added',
                    list: [
                        '(Changelog) Added login, signup, reset password, logout page',
                        '(Changelog) Added the ChangeLog page'
                    ]
                }
            ]
        },
        // v13.6.0
        // {
        //     version    : 'v13.6.0',
        //     releaseDate: 'Aug 31, 2021',
        //     changes    : [
        //         {
        //             type: 'Added',
        //             list: [
        //                 '(QuickChat) Added the QuickChat bar'
        //             ]
        //         },
        //         {
        //             type: 'Changed',
        //             list: [
        //                 '(dependencies) Updated Angular & Angular Material to v12.2.3',
        //                 '(dependencies) Updated various other packages',
        //                 '(layout) Separated the Settings drawer from the layout component'
        //             ]
        //         },
        //         {
        //             type: 'Fixed',
        //             list: [
        //                 '(@fuse/drawer) Final opacity of the overlay is not permanent due to player being destroyed right after the animation'
        //             ]
        //         }
        //     ]
        // }
    ];

    /**
     * Constructor
     */
    constructor()
    {
    }
}
