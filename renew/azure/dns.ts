import DnsManagementClient from "azure-arm-dns";
import * as msrestAzure from "ms-rest-azure";
import {configuration} from "../config/configuration";
import * as models from "azure-arm-dns/lib/models";
import {findTxt} from "../dns/lookupTxt";
const relativeRecordSetName = "_acme-challenge";
const recordType = "TXT";

export async function createDnsTxtToken(zoneName: string, token: string, signedToken: string): Promise<models.RecordSet> {
    const credentials = await msrestAzure.loginWithServicePrincipalSecret(configuration.servicePrincipalId, configuration.servicePrincipalPass, configuration.tenantId);
    const client = new DnsManagementClient(credentials, configuration.subscriptionId);
    await client.recordSets.createOrUpdate(configuration.resourceGroup, zoneName, relativeRecordSetName, recordType, {
        tTL: 60,
        txtRecords: [
            {
                value: [
                    `${signedToken}`
                ]
            }
        ]
    });
    return await findTxt(relativeRecordSetName, zoneName);
}

export async function deleteDnsTxt(zoneName: string) {
    const credentials = await msrestAzure.loginWithServicePrincipalSecret(configuration.servicePrincipalId, configuration.servicePrincipalPass, configuration.tenantId);
    const client = new DnsManagementClient(credentials, configuration.subscriptionId);
    return client.recordSets.deleteMethod(configuration.resourceGroup, zoneName, relativeRecordSetName, recordType);
}

