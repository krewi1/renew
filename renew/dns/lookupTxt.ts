import {resolveTxt} from "dns";
import {promisify} from "util";
const resolveTxtAsync = promisify(resolveTxt);

export function findTxt(subDomain: string, domain: string) {
    const callResolve = () => resolveTxtAsync(`${subDomain}.${domain}`);
    return new Promise((res) => {
        function callTxt() {
            callResolve().then(isFound)
                .then(result => result ?  res() : setTimeout(callTxt, 5000))
                .catch(ignore)
                .catch(() => setTimeout(callTxt, 5000))
        }
        callTxt();
    })
}

function isFound(records: string[][]) {
    console.log("found records:", records);
    return records.length > 0
}

function ignore(e: Error) {
    console.log("Dns lookup returned error but we will ignore it", e);
    throw e;
}