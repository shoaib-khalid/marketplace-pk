import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
    selector     : 'edit-profile-page',
    templateUrl  : './edit-profile.component.html',
    styles       : ['.ql-container { height: 156px; }'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class EditProfileComponent implements OnInit
{
 
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;

    panels: any[] = [];
    selectedPanel: string = 'account';

    /**
     * Constructor
     */
    constructor(
 
    )
    {
        // this.checkExistingURL = debounce(this.checkExistingURL, 300);
        // this.checkExistingName = debounce(this.checkExistingName,300);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
       
        // Setup available panels
        this.panels = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Account',
                description: 'Manage your public profile and private information'
            },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Security',
                description: 'Manage your password and 2-step verification preferences'
            },
            // {
            //     id         : 'plan-billing',
            //     icon       : 'heroicons_outline:credit-card',
            //     title      : 'Plan & Billing',
            //     description: 'Manage your subscription plan, payment method and billing information'
            // },
        ]
    }

    ngAfterViewInit(): void{
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }
}