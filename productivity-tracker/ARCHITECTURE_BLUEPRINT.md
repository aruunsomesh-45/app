# Master Architecture Blueprint: Personal AI Operating System

## 1. Product Vision
A modular, high-performance productivity application acting as a "Second Brain" and "Action Engine". The system leverages a **Notion Backend** for structured data storage and **Gemini AI** for intelligence, orchestration, and content generation. The frontend is a premium, high-aesthetic React/Vite application.

---

## 2. Core Principles
1.  **Notion as Source of Truth**: All persistent data (Prompts, Tools, Learning, Workflows, Agents) resides in Notion Databases. The app is a "UI Skin" + "Intelligence Layer" over Notion.
2.  **AI as Action Layer**: AI is not just for chat; it transforms data (e.g., Video -> Mind Map, Goal -> Workflow).
3.  **Modular & Scalable**: Distinct modules for distinct asset types, connected via relations.

---

## 3. High-Level System Architecture

### (A) Frontend (UI Layer)
*   **Tech Stack**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
*   **State Management**: React Context / Hooks for local UI state + SWR/TanStack Query for Notion data fetching.
*   **Routing**: React Router v7.
*   **Theme**: "Premium Productivity" (Clean whites, rich darks, subtle gradients, glassmorphism).

### (B) Orchestration Layer (Middleware/BFF)
*   **API Interactions**:
    *   **Notion Client**: Fetches/Updates data from Notion DBs.
    *   **Gemini Client**: Sends prompts/context to Google Gemini execution models.
    *   **Proxy/Serverless Functions (Optional)**: To hide API keys and handle long-running tasks (like YouTube transcript fetching) if client-side is insufficient.

### (C) Data Layer (Notion)
*   Five core databases linked relationally.

---

## 4. Module Architecture & Database Schema

### Module 1: Prompt Library (The Vault)
**Purpose**: Storage for reusable, high-quality AI prompts.
**Notion Database**: `Prompts DB`
**Schema**:
*   `Name` (Title): Prompt Title.
*   `Content` (Text/Rich Text): The actual prompt body.
*   `Category` (Select): Development, Marketing, Design, Productivity.
*   `Purpose` (Text): Brief description of use case.
*   `Tags` (Multi-select): Specific keywords.
*   `Variables` (Multi-select/Text): e.g., `{{project_name}}`, `{{audience}}`.
*   `Status` (Status): Draft, Verified, Best.
*   `Tools Relation` (Relation): Linked to `Tools DB`.

**AI Features**:
*   **Refiner**: Input raw prompt -> Output structured prompt with variables.

### Module 2: AI Tools Hub (The Toolbelt)
**Purpose**: Directory of external AI tools.
**Notion Database**: `Tools DB`
**Schema**:
*   `Name` (Title): Tool name (e.g., ChatGPT, Midjourney).
*   `URL` (URL): Direct link.
*   `Category` (Select): Chat, Image, Video, Code, Automation.
*   `Subscription` (Select): Free, Paid, Enterprise.
*   `Best Use Case` (Text): When to use this tool.
*   `Prompts Relation` (Relation): Linked to `Prompts DB`.

**AI Features**:
*   **Recommender**: User task -> AI suggests Tool + Prompt.

### Module 3: Learning Hub (The Notebook)
**Purpose**: Ingest content (YouTube) and transform into knowledge (Notes, Mind Maps).
**Notion Database**: `Learning DB`
**Schema**:
*   `Title` (Title): Video/Article title.
*   `URL` (URL): Source link.
*   `Type` (Select): Video, Article, Book.
*   `Summary` (Text/Rich Text): AI-generated quick summary.
*   `Deep Notes` (Text/Rich Text): Structured detailed notes.
*   `Mind Map JSON` (Code Block): JSON representation of the concept graph.
*   `Concepts` (Multi-select): Key entities extracted.
*   `Status` (Status): To Watch, Processing, Completed.

**AI Features**:
*   **Ingest**: Youtube URL -> Transcript -> Summary + Notes.
*   **Visualize**: Summary -> Mermaid/JSON Mind Map.
*   **Tutor**: Chat with the specific note context.

### Module 4: Workflow Logics (The Engine)
**Purpose**: Define standardized operating procedures (SOPs).
**Notion Database**: `Workflows DB`
**Schema**:
*   `Name` (Title): Workflow name.
*   `Goal` (Text): What this achieves.
*   `Steps` (Text/JSON): Ordered list of steps.
*   `Tools Required` (Relation): Linked to `Tools DB`.
*   `Prompts Required` (Relation): Linked to `Prompts DB`.
*   `Frequency` (Select): Daily, Weekly, Ad-hoc.

**AI Features**:
*   **Generator**: "I need to launch a product" -> AI generates full SOP with 10 steps.

### Module 5: Autonomous Agents (The Workforce)
**Purpose**: Configuration for AI agents that execute specific roles.
**Notion Database**: `Agents DB`
**Schema**:
*   `Name` (Title): Agent Name (e.g., "Growth Architect").
*   `Role` (Text): Professional persona description.
*   `System Instructions` (Text): Core prompt for the agent.
*   `Toolbelt` (Relation): Linked to `Tools DB` (tools this agent "knows").
*   `Knowledge Base` (Relation): Linked to `Learning DB`.

**AI Features**:
*   **Simulator**: Run the agent in a chat interface using its System Instructions and Access to linked Tools/Knowledge.

---

## 5. API Flow Pseudo-Code

### General Data Fetch (App Load)
```typescript
async function fetchDashboardData() {
  const notion = new NotionClient({ auth: API_KEY });
  const [prompts, tools, learning] = await Promise.all([
     notion.databases.query({ database_id: PROMPTS_DB_ID }),
     notion.databases.query({ database_id: TOOLS_DB_ID }),
     notion.databases.query({ database_id: LEARNING_DB_ID }),
  ]);
  return { prompts, tools, learning };
}
```

### Video Ingestion Pipeline (Module 3)
```typescript
async function ingestVideo(url: string) {
  // 1. Fetch Metadata
  const metadata = await YouTubeAPI.getInfo(url);
  
  // 2. Get Transcript
  const transcript = await TranscriptService.fetch(url);
  
  // 3. AI Processing
  const summary = await Gemini.generate(`Summarize this: ${transcript}`);
  const mindmap = await Gemini.generate(`Create JSON mindmap from: ${summary}`);
  
  // 4. Save to Notion
  await Notion.pages.create({
    parent: { database_id: LEARNING_DB_ID },
    properties: {
      Title: metadata.title,
      URL: url,
      Summary: summary,
      "Mind Map JSON": mindmap
    }
  });
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Current Status: Partial)
*   [x] Frontend UI Shell (Dashboard, Nav)
*   [x] Basic Component Structure (Prompts, Tools, Agents UI)
*   [ ] **CRITICAL**: Connect Notion API.
*   [ ] **CRITICAL**: Create Notion Databases & Get IDs.

### Phase 2: Logic Connectivity
*   [ ] Wire `AIPromptLibrary` to read/write from Notion.
*   [ ] Wire `AITools` to read from Notion.
*   [ ] Implement `NanoBananaAI` content generation logic (using Gemini) to populate Notion.

### Phase 3: Advanced Intelligence
*   [ ] Build "YouTube to Notes" pipeline in `AINotebook`.
*   [ ] Implement Mind Map rendering (using React Flow or similar) from JSON data.
*   [ ] Build "Agent Runner" interface in `AIAgents`.

---

## 7. Next Immediate Steps
1.  **Notion Setup**: Create the 5 Databases in your Notion workspace.
2.  **Environment Config**: Add `VITE_NOTION_API_KEY` and Database IDs to `.env`.
3.  **Data Fetching Service**: Create `src/services/notionService.ts`.
