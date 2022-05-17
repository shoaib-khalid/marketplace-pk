import { Voucher } from "../../vouchers/vouchers.types";

export interface Order
{
    appliedDiscount             : number;
    appliedDiscountDescription  : string;
    beingProcess                : string;
    cartId                      : string;
    completionStatus            : string;
    created                     : string;
    customer                    : string;
    customerId                  : string;
    customerNotes               : string;
    deliveryCharges             : number;
    deliveryDiscount            : number;
    deliveryDiscountDescription : string;
    deliveryDiscountMaxAmount   : number;
    deliveryType                : string;
    discountCalculationType     : string;
    discountCalculationValue    : number;
    discountId                  : string;
    discountMaxAmount           : number;
    id                          : string;
    invoiceId                   : string;
    klCommission                : number;
    orderPaymentDetail  : 
    {
        accountName                 : string;
        couponId                    : string;
        deliveryQuotationAmount     : number;
        deliveryQuotationReferenceId: string;
        gatewayId                   : string;
        orderId                     : string;
        time                        : string;
    }
    orderShipmentDetail : 
    {
        address                     : string;
        city                        : string;
        country                     : string;
        customerTrackingUrl         : string;
        deliveryProviderId          : string;
        deliveryType                : string;
        email                       : string;
        merchantTrackingUrl         : string;
        orderId                     : string;
        phoneNumber                 : string;
        receiverName                : string;
        state                       : string;
        storePickup                 : boolean;
        trackingNumber              : string;
        trackingUrl                 : string;
        zipcode                     : string;
    }
    paymentStatus       : string;
    paymentType         : string;
    privateAdminNotes   : string;
    store: {
        id: string;
        name: string;
        city: string;
        address: string;
        clientId: string;
        postcode: string;
        state: string;
        contactName: string;
        phone: string;
        phoneNumber: string;
        email: string;
        verticalCode: string;
        serviceChargesPercentage: number;
        paymentType: string;
        invoiceSeqNo: number;
        nameAbreviation: string
    }
    storeId: string;
    storeServiceCharges: number;
    storeShare: number;
    subTotal: number;
    total: number;
    updated: string;
}

export interface OrderDetails
{
    id                          : string;
    storeId                     : string;
    subTotal                    : number;
    deliveryCharges             : number;
    total                       : number;
    completionStatus            : string;
    paymentStatus               : string;
    customerNotes               : string;
    privateAdminNotes           : string;
    cartId                      : string;
    customerId                  : string;
    created                     : string;
    updated                     : string;
    invoiceId                   : string;
    totalReminderSent           : string;
    klCommission                : string;
    storeServiceCharges         : string;
    storeShare                  : string;
    paymentType                 : string;
    deliveryType                : string;
    appliedDiscount             : string;
    deliveryDiscount            : string;
    appliedDiscountDescription  : string;
    deliveryDiscountDescription : string;
    beingProcess                : string;
    discountId                  : string;
    discountCalculationType     : string;
    discountCalculationValue    : string;
    discountMaxAmount           : string;
    deliveryDiscountMaxAmount   : string;
    isRevised                   : string;
    orderShipmentDetail         : OrderShipmentDetail;
    orderPaymentDetail          : OrderPaymentDetail;
    store                       : Store;
    customer                    : Customer;
    orderRefund                 : String;
    orderItemWithDetails        : OrderItemWithDetails;
    voucherDetail               : Voucher
}

export interface OrderShipmentDetail
{
    receiverName        : string;
    phoneNumber         : string;
    address             : string;
    city                : string;
    zipcode             : string;
    email               : string;
    deliveryProviderId  : string;
    state               : string;
    country             : string;
    trackingUrl         : string;
    orderId             : string;
    storePickup         : string;
    merchantTrackingUrl : string;
    customerTrackingUrl : string;
    trackingNumber      : string;
    deliveryType        : string;
    vehicleType         : string;
    fulfilmentType      : string;
    deliveryServiceProvider: 
        {
        id  : string;
        name: string
    };
    deliveryPeriodDetails: {
        id          : string;
        name        : string;
        description : string;
    }
}

export interface OrderPaymentDetail {
    accountName                 : string;
    gatewayId                   : string;
    couponId                    : string;
    time                        : string;
    orderId                     : string;
    deliveryQuotationReferenceId: string;
    deliveryQuotationAmount     : string
}

export interface Store 
{
    id                      : string;
    name                    : string;
    city                    : string;
    address                 : string;
    clientId                : string;
    postcode                : string;
    state                   : string;
    contactName             : string;
    phone                   : string;
    phoneNumber             : string;
    email                   : string;
    verticalCode            : string;
    serviceChargesPercentage: string;
    paymentType             : string;
    invoiceSeqNo            : string;
    nameAbreviation         : string;
    regionCountry: {
        currency      :  string;
        currencyCode  :  string;
        currencySymbol:  string;
        id            :  string;
        name          :  string;
        region        :  string;
        timezone      :  string;
    }
    regionCountryId: string;
    regionCountryStateId: string;
    regionVertical: {
        code: string; 
        name: string; 
        description: string;
        regionId: string; 
        thumbnailUrl: string;
    };
    storeAssets: {
        assetDescription: string;
        assetFile: string;
        assetType: string;
        assetUrl: string;
        id: string;
        storeId: string;
    };
    storeDeliveryDetail: {
        storeId: string;
        type: string; 
        itemType: string; 
        maxOrderQuantityForBike: number;}
    storeDescription: string;
    storeLogoUrl: string;
    storeTiming:[
    {
        closeTime: string;
        day: string;
        isOff: false
        openTime: string;
        storeId: string;
    }
    ];
    storeId: string;
    storeServiceCharges: number;
    storeShare: number;
    subTotal: number;
    total: number;
    totalReminderSent: number;
    updated: string;
}

export interface Customer 
{
    id          : string;
    name        : string;
    phoneNumber : string;
    email       : string;
    created     : string;
    updated     : string;
}

export interface OrderItemWithDetails
{
    id                      : string;
    orderId                 : string;
    productId               : string;
    price                   : number;
    productPrice            : number;
    weight                  : string;
    quantity                : number;
    itemCode                : string;
    productName             : string;
    specialInstruction      : string;
    productVariant          : string;
    discountId              : string;
    normalPrice             : string;
    discountLabel           : string;
    status                  : string;
    originalQuantity        : string;
    discountCalculationType : string;
    discountCalculationValue: string;
    orderSubItem            : string;
    SKU                     : string;
    itemAssetDetails: [
        {
        id        : string;
        itemCode  : string;
        name      : string;
        url       : string;
        productId : string;
        }
    ];
    productInventory:
    {
        compareAtprice: number
        itemCode: string;
        price: number
        product:
        {
            allowOutOfStockPurchases: boolean;
            categoryId: string;
            description: string;
            id: string;
            isPackage: boolean;
            minQuantityForAlarm: number;
            name: string;
            region: string;
            seoUrl: string;
            status: string;
            storeId: string;
            thumbnailUrl: string;
            trackQuantity: boolean;
            vehicleType: string;
            vendor: string;

        }
        productInventoryItems: []
        quantity: number;
        sku: string;
    }
}



export interface OrderItem
{
    id: string;
    orderId: string;
    productId: string;
    price: number;
    productPrice: number;
    weight: string;
    quantity: number;
    itemCode: string;
    productName: string;
    specialInstruction: string;
    productVariant: string;
    SKU: string;
}

export interface DeliveryRiderDetails
{
    name: string;
    phoneNumber: string;
    plateNumber: string;
    trackingUrl: string;
    orderNumber: string;
    provider: {
        id : number;
        name : string;
        providerImage : string;
    }
    airwayBill: string;
}

export interface OrderPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface OrdersCountSummary
{
    label?: string;
    completionStatus: string;
    count: number;
}
