import {createDnsTxtToken, deleteDnsTxt} from "./azure/dns";
import {createHttpChallenge, deleteHttpChallenge} from "./azure/http";
import {Challenge} from "acme-client/types/rfc8555";
import * as acme from "acme-client";
import {configuration} from "./config/configuration";

function log(s: string) {
    console.log(s);
}

function createChallengeResolver(domain: string) {
    return async function challengeCreateFn(authz: acme.Authorization, challenge: Challenge, keyAuthorization: string) {
        if (challenge.type === 'dns-01') {
            log("DNS challenge");
            await createDnsTxtToken(domain, challenge.token, keyAuthorization);
        }
        if (challenge.type === "http-01") {
            log("HTTP challenge");
            return await createHttpChallenge(challenge.token, keyAuthorization);
        }
    }
}


function createChallengeRemoved(domain: string) {
    return async function challengeRemoveFn(authz: acme.Authorization, challenge: Challenge) {
        if (challenge.type === 'dns-01') {
            return await deleteDnsTxt(domain);
        }
        if (challenge.type === "http-01") {
            return await deleteHttpChallenge(challenge.token)
        }
    }
}

type SupportedChallenges = "http" | "dns";

function assertSupportedChallenges(type: string): asserts type is SupportedChallenges {
    if (type !== "http" && type !== "dns") {
        throw new Error("Can accept only http and dns challenges")
    }
}

function toChallengeType(type: string) {
    assertSupportedChallenges(type);
    switch (type) {
        case "dns":
            return "dns-01";
        case "http":
            return "http-01";
        default:
            const _:never = type
    }
}


(async function() {
    /* Init client */
    const [_bin, _runable, resolve, domain]= process.argv;
    log(`Challenge type: ${resolve} for domain: ${domain}`);
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.staging,
        accountKey: await acme.forge.createPrivateKey()
    });

    const [key, csr] = await acme.forge.createCsr({
        commonName: domain,
    });

    try {
        const cert = await client.auto({
            csr,
            challengePriority: [
                toChallengeType(resolve)
            ],
            email: configuration.ownerEmail,
            termsOfServiceAgreed: true,
            challengeCreateFn: createChallengeResolver(domain),
            challengeRemoveFn: createChallengeRemoved(domain)
        });
        log(`Private key:\n${key.toString()}`);
        log(`Certificate:\n${cert.toString()}`);
    } catch (e) {
        log("catch after call");
        log(e)
    }
})();