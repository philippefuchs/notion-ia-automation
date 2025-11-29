require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// TODO: remplace ceci par l'ID de ta base Notion "Prompts IA"
const DATABASE_ID = process.env.NOTION_DB_ID;

async function main() {
  try {
    console.log("Début du script GitHub Actions...");
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 3
    });

    console.log(`Nombre de pages retournées : ${response.results.length}`);
    response.results.forEach((page, i) => {
      console.log(`Page ${i + 1} : ${page.id}`);
    });

    console.log("Script terminé sans erreur.");
    process.exit(0);
  } catch (err) {
    console.error("Erreur dans le script :", err.message);
    process.exit(1);
  }
}

main();
