# AI-OS Integration Manual

## ✅ Status: Connected
The AI-OS is successfully connected to your Notion backend!
We automatically detected and configured the following databases:
*   **Prompt Library** (Connected)
*   **AI Tools Hub** (Connected)

## 🆕 New Requirement: Commercial Packs
To enable the Commercial Packs tab in your AI Wallet, you need to set up one more database.

### 1. Create "Commercial Packs" Database
1. Create a new Database in Notion.
2. Name it **Commercial Packs**.
3. Add the following properties:
   * **Pack Name** (Title): The name of the pack (e.g., "SaaS Agency Pack").
   * **Asset Count** (Number): How many assets are in the pack.
   * **Revenue Potential** (Text): e.g., "$$$", "High".
   * **Efficiency Boost** (Text): e.g., "+40%".

### 2. Connect It
1. Get the Database ID from the URL (similar to how you did before).
2. Open your `.env` file.
3. Add this line:
   ```env
   VITE_NOTION_COMMERCIAL_DATABASE_ID=your_database_id_here
   ```

## 🚀 How to Add Data
The app shows items from your Notion databases. To see content, add items in Notion:

### 1. Adding AI Prompts
1. Go to **Prompt Library**.
2. Create a new page.
3. Fill in these properties (Spelling matters!):
   *   **Prompt Title** (Title): e.g., "Email Polisher".
   *   **Category** (Select): `Marketing`, `Dev`, `Productivity`.
   *   **Purpose** (Text): Short description of what it does.
   *   **Example Input** (Text): The actual prompt template (this is what gets copied!).
   *   **Tags** (Multi-select): Add tags like `Email`, `Writing`.
   *   **Favorite** (Checkbox): Check this to make it appear in your "Saved Prompts" wallet tab.

### 2. Adding AI Tools
1. Go to **AI Tools Hub**.
2. Create a new page.
3. Fill in:
   *   **Tool Name** (Title): e.g., "ChatGPT".
   *   **Category** (Select): e.g., "Productivity".
   *   **Tool URL** (URL): Link to the tool.
   *   **Pricing** (Select): `Paid` or `Premium` triggers the badge.

## 🔄 Syncing
The app fetches data from Notion every time you load the page. If you add an item in Notion, just refresh the app to see it!
