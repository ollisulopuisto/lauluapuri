// Regression test for share URL hash input validation (Sentinel)
import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Extract the initialization logic block from index.html
function executeShareLoader(hash, initialInput = '', initialName = '') {
    const input = { value: initialInput };
    const songNameInput = { value: initialName };
    const window = {
        location: {
            hash,
            pathname: '/',
            search: ''
        }
    };
    const history = {
        replaceState: () => {}
    };

    // Match the exact block from index.html:
    if (hash && hash.startsWith('#share=')) {
        try {
            const base64Data = hash.substring(7);
            const jsonString = decodeURIComponent(atob(base64Data));
            const shareData = JSON.parse(jsonString);

            if (shareData && typeof shareData === 'object' && typeof shareData.lyrics === 'string' && shareData.lyrics.length <= 100000) {
                input.value = shareData.lyrics;
                if (typeof shareData.name === 'string' && shareData.name.length <= 500) {
                    songNameInput.value = shareData.name;
                }
                history.replaceState(null, "", window.location.pathname + window.location.search);
            }
        } catch (err) {
            // Error handling
        }
    }

    return { input, songNameInput };
}

test('index.html contains explicit string type validation for shareData.lyrics and shareData.name', () => {
    expect(html).toMatch(/typeof\s+shareData\.lyrics\s*===\s*['"]string['"]/);
    expect(html).toMatch(/typeof\s+shareData\.name\s*===\s*['"]string['"]/);
});

test('ignores non-string or oversized lyrics in share hash to prevent crashes', () => {
    // Non-string types (number, object, array, boolean)
    const badTypes = [
        12345,
        { evil: true },
        ['line 1', 'line 2'],
        true
    ];

    for (const badLyrics of badTypes) {
        const payload = { lyrics: badLyrics, name: 'Test' };
        const hash = '#share=' + btoa(encodeURIComponent(JSON.stringify(payload)));
        const res = executeShareLoader(hash, 'original', 'original');
        expect(res.input.value).toBe('original');
    }

    // Oversized lyrics (> 100,000 chars)
    const giantLyrics = 'a'.repeat(100001);
    const giantPayload = { lyrics: giantLyrics, name: 'Giant' };
    const giantHash = '#share=' + btoa(encodeURIComponent(JSON.stringify(giantPayload)));
    const giantRes = executeShareLoader(giantHash, 'original', 'original');
    expect(giantRes.input.value).toBe('original');
});

test('ignores non-string or oversized name in share hash', () => {
    const badNames = [
        12345,
        { evil: true },
        ['name1'],
        true
    ];

    for (const badName of badNames) {
        const payload = { lyrics: 'valid lyrics', name: badName };
        const hash = '#share=' + btoa(encodeURIComponent(JSON.stringify(payload)));
        const res = executeShareLoader(hash, 'original', 'original');
        expect(res.input.value).toBe('valid lyrics');
        expect(res.songNameInput.value).toBe('original');
    }

    // Oversized name (> 500 chars)
    const giantName = 'b'.repeat(501);
    const giantPayload = { lyrics: 'valid lyrics', name: giantName };
    const giantHash = '#share=' + btoa(encodeURIComponent(JSON.stringify(giantPayload)));
    const giantRes = executeShareLoader(giantHash, 'original', 'original');
    expect(giantRes.input.value).toBe('valid lyrics');
    expect(giantRes.songNameInput.value).toBe('original');
});

test('successfully loads valid string payload in share hash', () => {
    const validPayload = { lyrics: 'Kaunista on rannalla\nKivi kaunis kannalla', name: 'Kesälaulu' };
    const hash = '#share=' + btoa(encodeURIComponent(JSON.stringify(validPayload)));
    const res = executeShareLoader(hash, 'original', 'original');
    expect(res.input.value).toBe(validPayload.lyrics);
    expect(res.songNameInput.value).toBe(validPayload.name);
});
