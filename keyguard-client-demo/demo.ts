import { KeyGuardClient, MemoryStorageAdapter } from '@keyguard/sdk';

// 1. الإعدادات (ضع المفتاح الذي نسخته من الداشبورد هنا)
const API_KEY = 'sk-generated-9z67k';
const BACKEND_URL = 'https://keyguard-arhi.onrender.com/api/v1';

// إعداد بصمة وهمية للتيرمينال
const nodeFingerprint = {
    getFingerprint: async () => ({
        visitorId: `node-e2e-${Date.now()}`,
        label: 'E2E-Test-Laptop',
        metadata: { platform: 'Node.js' }
    })
};

async function main() {
    console.log('🚀 بدء اختبار E2E الكامل...');

    const client = new KeyGuardClient({
        apiKey: API_KEY,
        apiBaseUrl: BACKEND_URL, // مهم جداً عشان الـ SDK يعرف وين يسجل الجهاز
        storage: new MemoryStorageAdapter(),
        fingerprintProvider: nodeFingerprint
    });

    try {
        // 2. تسجيل الجهاز
        console.log('\n📲 1. تسجيل الجهاز...');
        await client.enroll();
        console.log('   ✅ تم إرسال طلب التسجيل.');

        // 3. (خطوة يدوية) - لو كان النظام يتطلب موافقة، سنحتاج للموافقة عليه من الداشبورد الآن
        // سنفترض الآن أننا سنحاول الإرسال مباشرة

        // 4. توقيع الطلب
        console.log('\n✍️  2. توقيع طلب OpenAI...');
        const targetUrl = `${BACKEND_URL}/proxy/openai/v1/chat/completions`; // رابط البروكسي

        const body = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'KeyGuard works!'" }]
        });

        const headers = await client.signRequest({
            method: 'POST',
            url: targetUrl,
            body: body
        });

        // 5. الإرسال الفعلي
        console.log('\n📨 3. إرسال الطلب للبروكسي...');
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (response.ok) {
            const data = await response.json();
            console.log('\n🎉 نجاح!! رد الذكاء الاصطناعي:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('\n⚠️ الطلب رُفض (وهذا قد يكون صحيحاً إذا كان الجهاز يحتاج موافقة)');
            console.log('Status:', response.status);
            console.log('Response:', await response.text());
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

main();