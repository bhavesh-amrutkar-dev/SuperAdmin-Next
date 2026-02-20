export { };

declare global {
    interface Window {
        ATHM_Checkout: any;
        cancelATHM?: () => Promise<void>;
        authorizationATHM?: () => Promise<void>;
        expiredATHM?: () => Promise<void>;
        findPaymentATHM?: () => Promise<any>;
        authorization?: () => Promise<any>;
    }
}
