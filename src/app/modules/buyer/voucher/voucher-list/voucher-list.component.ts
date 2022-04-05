import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';



@Component({
    selector     : 'voucher-list',
    templateUrl  : './voucher-list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class VoucherListComponent implements OnInit, OnDestroy
{

    /**
     * Constructor
     */
    constructor(
        public _dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
      
    }

    openVoucherDetails(index:number){

        let voucherBody ={
            name :'Voucher '+index,
            dateStart : '20-03-2022',
            dateEnd : '25-3-2022',
            terms : `
            <li>Limited Redemption (while stock last)</li>
            <li>First Transaction</li>
            <li>Shipping Fee Discount</li>
            <li>Minimum Ordee Capped at RM20</li>
            <li>Applicable to claim for all products listed on Deliverin</li>`
        }

        const display = () => {
            const name = voucherBody.name === null ? ' ' : voucherBody.name;
            const dateStart = voucherBody.dateStart === null ? ' ' : voucherBody.dateStart;
            const dateEnd = voucherBody.dateEnd === null ? ' ' : voucherBody.dateEnd;
            const terms = voucherBody.terms === null ? ' ' : voucherBody.terms;

            return `
            <br>
            Voucher Name : ${name}<br><br>
            Valid Date : ${dateStart} to ${dateEnd}<br><br>
            Terms & Condition : ${terms}
            <br>`;
        }

        const confirmation = this._fuseConfirmationService.open({
            title  : `Vouchers's Terms & Condition`,
            message: display(),
            icon       : {
                show : false,
            },
            actions: {
                confirm: {
                    label: 'OK',
                    color: 'primary'
                },
                cancel : {
                    show : false,
                }
            }
        });
        return confirmation;
    }

    searchPromoCode(promoCode:string){
        console.log('PROOCODE',promoCode);

    }


}
