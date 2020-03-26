const ACME = require('acme-v2');
const CSR = require('@root/csr');
const PEM = require('@root/pem');
const Keypairs = require('@root/keypairs');
const punycode = require('punycode');
const fs = require("fs");

const pkg = require('./package.json');
const packageAgent = `test-${pkg.name}/${pkg.version}`;

const maintainerEmail = 'kratochvilp@post.cz';
const subscriberEmail = 'kratochvilp@post.cz';
const customerEmail = 'kratochvilp@post.cz';

function notify(ev, msg) {
    if ('error' === ev || 'warning' === ev) {
        errors.push(ev.toUpperCase() + ' ' + msg.message);
        return;
    }
    // be brief on all others
    console.log(ev, msg.altname || '', msg.status || '');
}
const acme = ACME.create({ maintainerEmail, packageAgent, notify });

const directoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory';

(async () => {
    await acme.init(directoryUrl);
    var accountKeypair = await Keypairs.generate({ kty: 'EC', format: 'jwk' });
    var accountKey = accountKeypair.private;

    console.info('registering new ACME account...');

    var account = await acme.accounts.create({
        subscriberEmail,
        accountKey,
        agreeToTerms: true
    });
    console.info('created account with id', account.key.kid);
    const serverKeypair = await Keypairs.generate({ kty: 'RSA', format: 'jwk' });
    var serverKey = serverKeypair.private;
    var serverPem = await Keypairs.export({ jwk: serverKey });
    await fs.promises.writeFile('./privkey.pem', serverPem, 'ascii');
    var domains = ['example.com'];
    domains = domains.map(function(name) {
        return punycode.toASCII(name);
    });

    const encoding = 'der';
    const typ = 'CERTIFICATE REQUEST';

    const csrDer = await CSR.csr({ jwk: serverKey, domains, encoding });
    const csr = PEM.packBlock({ type: typ, bytes: csrDer });
    var challenges = {
        'http-01': {
            set: async function(args) {
                const {token} = args.challenges.filter((challenge) => challenge.type === "http-01")[0];
                await fs.writeFile(`/shared/${token}`, token);
                console.log(args);
            },
            get: async function(args) {
                console.log(args);
                // check the TXT record exists
            },
            remove: async function(args) {
                console.log(args);
            },
        }
    };

    console.info('validating domain authorization for ' + domains.join(' '));
    const pems = await acme.certificates.create({
        account,
        accountKey,
        csr,
        domains,
        challenges
    });

    const fullchain = pems.cert + '\n' + pems.chain + '\n';

    await fs.promises.writeFile('fullchain.pem', fullchain, 'ascii');
    console.info('wrote ./fullchain.pem');
})();
