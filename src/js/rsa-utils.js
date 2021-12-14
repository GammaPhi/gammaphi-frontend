
import forge from 'forge';

var rsa = forge.pki.rsa;
var pki = forge.pki;

export function generatePrivateKey(callback, nbits=512, workers=2) {
    rsa.generateKeyPair({bits: nbits, workers: workers}, function(err, keypair) {
        callback(keypair.privateKey);
    });
}

export function privateKeyToPem(privateKey) {
    return pki.privateKeyToPem(privateKey)
}

export function loadPrivateKeyFromPem(pem) {
    return pki.privateKeyFromPem(pem);
};

export function getNandE(privateKey) {
    let n = privateKey.n.toString(10);
    let e = privateKey.e.toString(10);
    console.log("N: "+n);
    console.log("E: "+e);
    return [n, e];
}

export function decrypt(encryptedHexStr, privateKey) {
    return privateKey.decrypt(forge.util.hexToBytes(encryptedHexStr), 'RSAES-PKCS1-V1_5');
}

export function storePemFileInBrowser(vk, pem) {
    sessionStorage.setItem("rsa_pem_"+vk, pem);
    localStorage.setItem("rsa_pem_"+vk, pem);
};

export function retrievePemFileFromBrowser(vk) {
    return localStorage.getItem("rsa_pem_"+vk) || sessionStorage.getItem("rsa_pem_"+vk);
}