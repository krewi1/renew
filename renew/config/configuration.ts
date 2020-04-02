export interface Configuration {
    tenantId: string;
    servicePrincipalId: string;
    servicePrincipalPass: string;
    subscriptionId: string;
    resourceGroup: string;
    ownerEmail: string;
    environment: "staging"|"production";
}

export const configuration: Configuration = {
    tenantId: process.env.TENANT_ID,
    servicePrincipalId: process.env.SERVICE_PRINCIPAL_ID,
    servicePrincipalPass: process.env.SERVICE_PRINCIPAL_PASS,
    subscriptionId: process.env.SUBSCRIPTION_ID,
    resourceGroup: process.env.RESOURCE_GROUP,
    ownerEmail: process.env.OWNER_EMAIL,
    environment: process.env.ENV as "staging"|"production"
};