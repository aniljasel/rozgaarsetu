// Known skills to match against in the transcript
export const KNOWN_SKILLS = [
    'electrician', 'plumber', 'painter', 'carpenter',
    'driver', 'tailor', 'cook', 'mechanic', 'cleaner', 'maid'
];

/**
 * Parses a Hindi/English transcript and attempts to extract a Name and a Job Skill.
 * @param {string} transcript - The transcribed text from the user's speech.
 * @returns {Object} - { name: string | null, skill: string | null }
 */
export const extractProfileData = (transcript) => {
    let extractedName = null;
    let extractedSkill = null;

    const lowerTranscript = transcript.toLowerCase().trim();

    // 1. Array of Regex patterns to extract Name (Focusing on common Hindi structures)
    // English Patterns
    const namePatterns = [
        /mera naam\s+([a-z\u0900-\u097F\s]+?)\s+(hai|he)/i,
        /main\s+([a-z\u0900-\u097F\s]+?)\s+hu/i,
        /mai\s+([a-z\u0900-\u097F\s]+?)\s+hu/i,
        /me\s+([a-z\u0900-\u097F\s]+?)\s+hu/i,
        /i am\s+([a-z\s]+?)(?:\s|$|\.)/i,
        /my name is\s+([a-z\s]+?)(?:\s|$|\.)/i,
        // Devnagari Patterns
        /मैं\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(हूं|हूँ)/i,
        /मेरा नाम\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(है|हे)/i,
        /मै\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(हूं|हूँ)/i
    ];

    for (const pattern of namePatterns) {
        const match = lowerTranscript.match(pattern);
        if (match && match[1]) {
            // Found a name, clean it up (remove common trailing words just in case)
            let rawName = match[1].trim();
            // Optional: filter out words like 'aur', 'and' if they got caught
            const stopWords = ['aur', 'and', 'plumber', 'electrician', 'driver', 'carpenter', 'प्लंबर', 'नलसाज', 'इलेक्ट्रीशियन'];

            // Basic cleanup
            for (const sw of stopWords) {
                if (rawName.endsWith(` ${sw}`)) {
                    rawName = rawName.substring(0, rawName.length - sw.length - 1);
                }
            }

            // Capitalize First letters
            extractedName = rawName.replace(/\b[a-z]/g, c => c.toUpperCase());
            break;
        }
    }

    // 2. Extract Skill
    // We map both English and Hindi known keywords to our specific DB skill slugs
    const skillMap = {
        'electrician': 'electrician', 'इलेक्ट्रीशियन': 'electrician', 'बिजली': 'electrician',
        'plumber': 'plumber', 'प्लंबर': 'plumber', 'नलसाज': 'plumber',
        'painter': 'painter', 'पेंटर': 'painter', 'पुताई': 'painter',
        'carpenter': 'carpenter', 'कारपेंटर': 'carpenter', 'बढ़ई': 'carpenter',
        'driver': 'driver', 'ड्राइवर': 'driver', 'गाड़ी': 'driver',
        'tailor': 'tailor', 'दर्जी': 'tailor', 'टेलर': 'tailor',
        'cook': 'cook', 'कुक': 'cook', 'रसोइया': 'cook', 'खाना': 'cook',
        'mechanic': 'mechanic', 'मैकेनिक': 'mechanic', 'मिस्त्री': 'mechanic',
        'cleaner': 'cleaner', 'क्लीनर': 'cleaner', 'सफाई': 'cleaner',
        'maid': 'maid', 'मेड': 'maid', 'बाई': 'maid'
    };

    for (const [keyword, slug] of Object.entries(skillMap)) {
        if (lowerTranscript.includes(keyword)) {
            extractedSkill = slug;
            break;
        }
    }

    // 3. Optional Fallback: Look for name if user just says their name (with or without a skill)
    if (!extractedName) {
        let remaining = lowerTranscript;

        // Strip out the exact skill word
        for (const keyword of Object.keys(skillMap)) {
            remaining = remaining.replace(new RegExp(`(?:^|\\s)${keyword}(?=\\s|$)`, 'gi'), ' ');
        }

        // Remove filler words safely without breaking partial names (e.g 'hu' inside 'rahul')
        const fillers = ["i am", "my name is", "mera naam", "mai", "main", "hu", "hai", "he", "मैं", "मेरा नाम", "है", "हूँ", "हूं", "aur", "and", "aam", "ka", "kaam", "karta", "karti", "wale", "wala"];
        for (const filler of fillers) {
            remaining = remaining.replace(new RegExp(`(?:^|\\s)${filler}(?=\\s|$)`, 'gi'), ' ');
        }

        remaining = remaining.replace(/\s+/g, ' ').trim();

        // If the remaining string is 1 to 3 words, it's highly likely to be the name
        if (remaining && remaining.split(' ').length <= 3 && !/\d/.test(remaining)) {
            extractedName = remaining.replace(/\b[a-z]/g, c => c.toUpperCase());
        }
    }

    return {
        name: extractedName,
        skill: extractedSkill
    };
};
