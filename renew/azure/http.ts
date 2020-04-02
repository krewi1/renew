import {writeFile, unlink} from "fs";
import {promisify} from "util";

const writeFileAsync = promisify(writeFile);
const deleteFileAsync = promisify(unlink);

export async function createHttpChallenge(token: string, keyAuthorization: string) {
    return writeFileAsync(`/shared/${token}`, keyAuthorization);
}

export async function deleteHttpChallenge(token: string) {
    return deleteFileAsync(`/shared/${token}`);
}