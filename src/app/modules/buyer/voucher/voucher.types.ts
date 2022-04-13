export interface Voucher
{
    id                : string;
    name              : string;
    storeId           : string;
    discountValue     : number;
    maxDiscountAmount : number;
    voucherCode       : string;
    totalQuantity     : number;
    totalRedeem       : number;
    status            : string;
    voucherType       : string;
    discountType      : string;
    calculationType   : string;
    startDate         : string;
    endDate           : string;
}

export interface CustomerVoucher
{
    id          : string;
    customerId  : string;
    voucherId   : string;
    isUsed      : boolean;
    created     : string;
    voucher     : Voucher;
}