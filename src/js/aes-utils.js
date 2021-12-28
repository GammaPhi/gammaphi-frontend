
import forge from 'forge';

export function encryptAes(message, keyHex) {
    let key = forge.util.hexToBytes(keyHex);
    let cipher = forge.cipher.createCipher('AES-ECB', key);
    cipher.start();//{iv: iv});
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
    cipher.finish();
    let encrypted = cipher.output.toHex();
    // outputs encrypted hex
    console.log(encrypted);
    return encrypted;
}

export function decryptAes(encryptedHexStr, keyHex) {
    let key = forge.util.hexToBytes(keyHex);
    let encrypted = forge.util.hexToBytes(encryptedHexStr);
    let decipher = forge.cipher.createDecipher('AES-ECB', key);
    decipher.start();//{iv: iv});
    decipher.update(forge.util.createBuffer(encrypted));
    let result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    let decrypted = forge.util.decodeUtf8(decipher.output);
    console.log(decrypted);
    return decrypted;
}