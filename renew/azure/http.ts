import {writeFile, unlink} from "fs";
import {promisify} from "util";

const writeFileAsync = promisify(writeFile);
const deleteFileAsync = promisify(unlink);

export async function createHttpChallenge(token: string) {
    return writeFileAsync(`/shared/${token}`, token);
}

export async function deleteHttpChallenge(token: string) {
    return deleteFileAsync(`/shared/${token}`);
}