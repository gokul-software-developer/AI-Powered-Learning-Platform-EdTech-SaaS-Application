const axios = require('axios');
const { NotionToken } = require('../models');

const notionClientId = process.env.NOTION_CLIENT_ID;
const notionClientSecret = process.env.NOTION_CLIENT_SECRET;
const redirectUri = process.env.NOTION_REDIRECT_URI;

exports.notionLogin = (req, res) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${notionClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  console.log("🔗 Redirecting to Notion OAuth:", authUrl);
  return res.redirect(authUrl);
};

exports.notionCallback = async (req, res) => {
  const code = req.query.code;
  const userId = req.session.userId; // or req.user.id if using JWT/auth middleware

  console.log("➡️ Callback hit");
  console.log("🔑 Code:", code);
  console.log("👤 Session user ID:", userId);

  if (!code || !userId) {
    return res.status(400).json({ error: "Missing code or user not logged in." });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri, // e.g. http://localhost:3000/api/notion/callback
      }),
      {
        auth: {
          username: process.env.NOTION_CLIENT_ID,
          password: process.env.NOTION_CLIENT_SECRET,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const {
      access_token,
      refresh_token,
      workspace_id,
      workspace_name,
      bot_id,
      owner,
    } = tokenResponse.data;

    const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // ✅ Save to NotionToken table
    await NotionToken.upsert({
      user_id_foreign_key: userId,
      access_token,
      refresh_token,
      access_token_expires_at: accessTokenExpiresAt,
      workspace_id,
      workspace_name,
      bot_id,
      notion_user_id: owner?.user?.id || null,
    });

    console.log("💾 Saved access token for user:", userId);

    // ✅ OPTIONAL: Fetch available pages to let user pick a parent page
    const pagesResponse = await axios.post(
      "https://api.notion.com/v1/search",
      {
        filter: { property: "object", value: "page" }
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    );

    const pages = pagesResponse.data.results;

    // ✅ Store pages in session so frontend can fetch them later
req.session.fetchedPages = pages;

// Redirect to fixed frontend route
return res.redirect(`http://localhost:5173/connect-notion`);
  // res.redirect('http://localhost:5173/connect-notion');
  } catch (error) {
    console.error("❌ Notion OAuth error:", error.response?.data || error.message);
    return res.status(500).send("Failed to authenticate with Notion");
  }
};


// GET /api/notion/status
exports.checkNotionStatus = async (req, res) => {
  const { NotionToken } = require('../models');
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ connected: false });
  }

  try {
    const token = await NotionToken.findOne({ where: { user_id_foreign_key: userId } });

    if (!token) {
      return res.json({ connected: false, hasParentPage: false });
    }

    const expired =
      token.access_token_expires_at &&
      new Date(token.access_token_expires_at) < new Date();

    const hasParentPage = Boolean(token.parent_page_id);

    return res.json({
      connected: !expired,
      hasParentPage,
    });
  } catch (err) {
    console.error("Failed to check Notion status:", err);
    return res.status(500).json({ error: "Server error checking Notion connection." });
  }
};

exports.selectPage = async (req, res) => {
  const { NotionToken } = require('../models');
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const token = await NotionToken.findOne({ where: { user_id_foreign_key: userId } });
  if (!token) return res.status(404).json({ error: 'No Notion token found' });

  try {
    const response = await axios.post(
      'https://api.notion.com/v1/search',
      { filter: { property: 'object', value: 'page' } },
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      }
    );

    const pages = response.data.results.map((page) => ({
      id: page.id,
      title:
        page.properties?.title?.title?.[0]?.plain_text ||
        page?.properties?.Name?.title?.[0]?.plain_text ||
        'Untitled',
    }));

    res.json({ pages });
  } catch (err) {
    console.error('🔴 Error fetching pages:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch Notion pages' });
  }
};


exports.setParentPage = async (req, res) => {
  const { NotionToken } = require('../models');
  const userId = req.session.userId;
  const { parent_page_id } = req.body;

  if (!userId || !parent_page_id) {
    return res.status(400).json({ error: 'Missing user or parent_page_id' });
  }

  try {
    const token = await NotionToken.findOne({ where: { user_id_foreign_key: userId } });
    if (!token) return res.status(404).json({ error: 'Token not found' });

    token.parent_page_id = parent_page_id;
    await token.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Error setting parent page:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getFetchedPages = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = await NotionToken.findOne({ where: { user_id_foreign_key: userId } });
    if (!token) return res.status(404).json({ error: 'Notion token not found' });

    const response = await axios.post(
      'https://api.notion.com/v1/search',
      { filter: { property: 'object', value: 'page' } },
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      }
    );

    const filteredPages = response.data.results
      .filter(page => page.object === 'page')
      .map(page => {
        let title =
          page.properties?.title?.title?.[0]?.plain_text ||
          page.properties?.Name?.title?.[0]?.plain_text ||
          page?.title?.[0]?.plain_text ||
          'Untitled';

        return {
          id: page.id,
          title,
        };
      });

    return res.json({ pages: filteredPages });
  } catch (err) {
    console.error("Failed to fetch live Notion pages:", err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch Notion pages' });
  }
};




