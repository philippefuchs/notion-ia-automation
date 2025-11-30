const { Client } = require('@notionhq/client');
const axios = require('axios');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DB_ID;

async function main() {
  try {
    console.log("Début du script GitHub Actions...");

    // 1. Lire les pages avec Statut = "À exécuter"
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Statut',
        select: {
          equals: 'À exécuter'
        }
      }
    });

    console.log('Nombre de pages à traiter : ${response.results.length}');

    for (const page of response.results) {
      const pageId = page.id;
      const prompt =
        page.properties.Prompt.rich_text[0]?.plain_text || '';

      if (!prompt) {
        console.log(Page ${pageId} sans prompt, ignorée.);
        continue;
      }

      console.log(Appel Perplexity pour la page ${pageId}...);

      // 2. Appel API Perplexity
      const completion = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar',
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            Authorization: Bearer ${process.env.PERPLEXITY_API_KEY},
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = completion.data.choices[0].message.content;

      // 3. Mettre à jour la page Notion
      await notion.pages.update({
        page_id: pageId,
        properties: {
          Résultat: {
            rich_text: [
              {
                type: 'text',
                text: { content: answer }
              }
            ]
          },
          Statut: {
            select: { name: 'Exécuté' }
          }
        }
      });

      console.log(Page ${pageId} mise à jour.);
    }

    console.log("Script terminé sans erreur.");
    process.exit(0);
  } catch (err) {
    console.error("Erreur dans le script :", err.message);
    process.exit(1);
  }
}

main();
