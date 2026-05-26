// config/notion.js

// Load environment variables
require('dotenv').config();

// Import Notion SDK
const { Client } = require('@notionhq/client');

// Validate that NOTION_SECRET exists
if (!process.env.NOTION_SECRET) {
  console.error("❌ NOTION_SECRET is missing from environment variables.");
  process.exit(1); // Exit process to avoid undefined auth
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_SECRET, // Use 'ntn_...' format
});

module.exports = notion;
