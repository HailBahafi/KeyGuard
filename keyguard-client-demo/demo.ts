/**
 * KeyGuard SDK - E2E Demo with Persistence
 * الهدف: تجربة متكاملة مع حفظ المفاتيح في ملف
 * 
 * ملاحظة: هذا السكربت يولّد مفاتيح extractable لأغراض التطوير والاختبار فقط.
 * في الإنتاج، استخدم SDK العادي مع non-extractable keys.
 */

import * as fs from 'fs';
import { webcrypto } from 'crypto';

const { subtle } = webcrypto;
type CryptoKeyType = webcrypto.CryptoKey;

// 🔴 هام: ضع المفتاح الذي أخذته من الداتابيز هنا (يجب أن يبدأ بـ kg_)
const API_KEY = 'kg_1764671504556_d7hnxgbz79myf0ngvgcyaievh0nxqgt9';

// رابط الباكند (تأكد أن الباكند يعمل على هذا الرابط)
const BACKEND_URL = 'https://keyguard-arhi.onrender.com/api/v1';

// مسار ملف الحفظ
const CREDENTIALS_FILE = './device-credentials.json';

// بصمة ثابتة - لن تتغير بين التشغيلات
const DEVICE_FINGERPRINT = 'persistent-e2e-device';
const DEVICE_LABEL = 'E2E-Laptop-Terminal';

// خوارزمية المفتاح
const ALGORITHM: webcrypto.EcKeyGenParams = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN_ALGORITHM: webcrypto.EcdsaParams = { name: 'ECDSA', hash: { name: 'SHA-256' } };

interface StoredCredentials {
    publicKeyJwk: webcrypto.JsonWebKey;
    privateKeyJwk: webcrypto.JsonWebKey;
    keyId: string;
    savedAt: string;
}

/**
 * تحميل أو توليد مفاتيح التشفير
 */
async function loadOrGenerateKeys(): Promise<{ publicKey: CryptoKeyType; privateKey: CryptoKeyType; keyId: string; isNew: boolean }> {
    // محاولة تحميل المفاتيح من الملف
    if (fs.existsSync(CREDENTIALS_FILE)) {
        try {
            const content = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
            const stored: StoredCredentials = JSON.parse(content);

            const publicKey = await subtle.importKey(
                'jwk', stored.publicKeyJwk, ALGORITHM, true, ['verify']
            );
            const privateKey = await subtle.importKey(
                'jwk', stored.privateKeyJwk, ALGORITHM, true, ['sign']
            );

            console.log('   📂 تم تحميل المفاتيح من الملف المحلي');
            return { publicKey, privateKey, keyId: stored.keyId, isNew: false };
        } catch (error) {
            console.log('   ⚠️ فشل قراءة ملف المفاتيح، سيتم توليد مفاتيح جديدة');
        }
    }

    // توليد مفاتيح جديدة (extractable للتخزين)
    console.log('   🔑 جاري توليد مفاتيح جديدة...');
    const keyPair = await subtle.generateKey(
        ALGORITHM,
        true,  // extractable: true للتخزين في ملف
        ['sign', 'verify']
    );

    // حساب keyId من المفتاح العام
    const spkiBuffer = await subtle.exportKey('spki', keyPair.publicKey);
    const hashBuffer = await subtle.digest('SHA-256', spkiBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const keyId = Array.from(hashArray.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // حفظ المفاتيح في ملف
    const publicKeyJwk = await subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await subtle.exportKey('jwk', keyPair.privateKey);

    const stored: StoredCredentials = {
        publicKeyJwk,
        privateKeyJwk,
        keyId,
        savedAt: new Date().toISOString()
    };

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(stored, null, 2));
    console.log('   💾 تم حفظ المفاتيح في الملف');

    return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey, keyId, isNew: true };
}

/**
 * تصدير المفتاح العام بصيغة Base64 SPKI
 */
async function exportPublicKeyBase64(publicKey: CryptoKeyType): Promise<string> {
    const spki = await subtle.exportKey('spki', publicKey);
    return Buffer.from(spki).toString('base64');
}

/**
 * حساب SHA-256 hash وتحويله لـ Base64
 */
async function hashSha256Base64(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await subtle.digest('SHA-256', data);
    return Buffer.from(hashBuffer).toString('base64');
}

/**
 * توقيع الطلب
 */
async function signRequest(
    privateKey: CryptoKeyType,
    keyId: string,
    params: { method: string; url: string; body: string }
): Promise<Record<string, string>> {
    const urlObj = new URL(params.url);
    const pathAndQuery = urlObj.pathname + urlObj.search;
    const timestamp = new Date().toISOString();
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
    const bodySha256 = await hashSha256Base64(params.body || '');

    // Canonical payload
    const payload = `kg-v1|${timestamp}|${params.method.toUpperCase()}|${pathAndQuery}|${bodySha256}|${nonce}|${API_KEY}|${keyId}`;

    // Sign
    const data = new TextEncoder().encode(payload);
    const signatureBuffer = await subtle.sign(SIGN_ALGORITHM, privateKey, data);
    const signature = Buffer.from(signatureBuffer).toString('base64');

    return {
        'x-keyguard-api-key': API_KEY,
        'x-keyguard-key-id': keyId,
        'x-keyguard-timestamp': timestamp,
        'x-keyguard-nonce': nonce,
        'x-keyguard-body-sha256': bodySha256,
        'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
        'x-keyguard-signature': signature
    };
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║       KeyGuard E2E Demo - Persistent Device Test          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    try {
        // ---------------------------------------------------------
        // خطوة 1: تحميل أو توليد المفاتيح
        // ---------------------------------------------------------
        console.log('\n📲 1. جاري التأكد من المفاتيح...');
        const { publicKey, privateKey, keyId, isNew } = await loadOrGenerateKeys();

        if (isNew) {
            console.log('   🆕 تم توليد مفاتيح جديدة');
        } else {
            console.log('   ✅ تم استخدام المفاتيح المحفوظة');
        }

        console.log(`   📦 معرف المفتاح: ${keyId}`);
        console.log(`   📦 بصمة الجهاز: ${DEVICE_FINGERPRINT}`);

        // ---------------------------------------------------------
        // خطوة 2: التسجيل (Enrollment)
        // ---------------------------------------------------------
        const publicKeyBase64 = await exportPublicKeyBase64(publicKey);

        const enrollmentPayload = {
            publicKey: publicKeyBase64,
            keyId,
            deviceFingerprint: DEVICE_FINGERPRINT,
            label: DEVICE_LABEL,
            userAgent: `Node.js/${process.version}`,
            metadata: { platform: 'Node.js', type: 'E2E-Testing' }
        };

        console.log(`\n📡 جاري إرسال طلب التسجيل إلى الباكند...`);

        const enrollResponse = await fetch(`${BACKEND_URL}/keyguard/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-keyguard-api-key': API_KEY
            },
            body: JSON.stringify(enrollmentPayload)
        });

        const enrollResult = await enrollResponse.json() as { status: string; id: string };

        if (!enrollResponse.ok) {
            console.error('❌ فشل التواصل مع الباكند:');
            console.error('Status:', enrollResponse.status);
            console.error('Body:', JSON.stringify(enrollResult, null, 2));
            return;
        }

        console.log('✅ رد الباكند:', JSON.stringify(enrollResult, null, 2));

        // عرض الحالة
        const status = enrollResult.status;
        if (status === 'PENDING') {
            console.log('\n⏳ الجهاز في حالة انتظار الموافقة!');
            console.log('   👉 قم بالموافقة على الجهاز من لوحة التحكم ثم أعد تشغيل السكربت.');
        } else if (status === 'ACTIVE') {
            console.log('\n🎉 الجهاز مفعل ويمكنه إرسال طلبات موقعة!');
        } else if (status === 'SUSPENDED') {
            console.log('\n⚠️ الجهاز معلق! تواصل مع المدير.');
        }

        // ---------------------------------------------------------
        // خطوة 3: التوقيع والإرسال (فقط إذا كان الجهاز ACTIVE)
        // ---------------------------------------------------------
        if (status === 'ACTIVE') {
            console.log('\n✍️  2. تجربة توقيع طلب وإرساله للبروكسي...');

            const targetUrl = `${BACKEND_URL}/proxy/openai/v1/chat/completions`;

            const body = JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Hello from KeyGuard E2E test!" }]
            });

            const headers = await signRequest(privateKey, keyId, {
                method: 'POST',
                url: targetUrl,
                body
            });

            console.log('   ✅ تم التوقيع.');

            const proxyResponse = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body
            });

            if (proxyResponse.ok) {
                const data = await proxyResponse.json();
                console.log('\n🎉🎉 نجاح! رد الـ AI:');
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log('\n⚠️ الطلب فشل:');
                console.log('Status:', proxyResponse.status);
                console.log('Response:', await proxyResponse.text());
            }
        } else {
            console.log('\n⏸️  تخطي اختبار التوقيع لأن الجهاز ليس ACTIVE.');
        }

    } catch (error: any) {
        console.error('❌ Error Exception:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

main();