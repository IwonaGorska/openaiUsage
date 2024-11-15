const fs = require('fs');
const axios = require('axios');
const { OPENAI_API_KEY } = require('./config');

function readArticle(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

async function generateHtmlContent(articleText) {
    const prompt = `Stwórz kod HTML na podstawie poniższego artykułu, który zawiera tylko znacznik <body> z odpowiednią strukturą treści:
    - Użyj tagów HTML takich jak <h1>, <h2>, <p>, <img> i <figcaption> do strukturyzacji treści.
    - Wskaż miejsca na grafiki, używając tagu <img> z atrybutem src="image_placeholder.jpg". Dodaj do niego atrybut alt z opisem odpowiedniego obrazu.
    - Umieść podpisy pod grafikami w tagu <figcaption>.

    Artykuł:
    ${articleText}`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Jesteś asystentem, który generuje HTML na podstawie artykułów." },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.5,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Błąd przy komunikacji z API OpenAI:", error);
        throw error;
    }
}

function saveHtml(filePath, htmlContent) {
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
}

(async () => {
    const articleText = readArticle('assets/article.txt');

    const htmlContent = await generateHtmlContent(articleText);

    saveHtml('assets/artykul.html', htmlContent);

    console.log("Plik artykul.html został wygenerowany.");
})();