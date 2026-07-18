# 🏭 FactoryMind AI

> An AI-powered Smart Manufacturing Assistant built with **NitroStack** and the **Model Context Protocol (MCP)**.

FactoryMind AI enables engineers, plant managers, and maintenance teams to interact with factory systems using natural language. It connects AI with manufacturing data to provide real-time insights, automate maintenance workflows, and improve operational efficiency in Industry 4.0 environments.

---

## ✨ Features

- 🤖 AI-powered manufacturing assistant
- 🔧 Machine health analysis
- 📈 Executive KPI dashboard
- ⚠️ Predictive maintenance recommendations
- 📦 Spare part availability checking
- 👨‍🔧 Automatic technician assignment
- 🎫 Maintenance ticket creation
- 🏭 Factory production monitoring
- 💬 Natural language interaction with factory systems using MCP

---

## 🛠 Tech Stack

- **NitroStack**
- **Model Context Protocol (MCP)**
- TypeScript
- Node.js
- OpenAI
- REST APIs

---

## 📁 Project Structure

```
FactoryMind-AI/
│
├── src/
│   ├── prompts/
│   ├── tools/
│   ├── services/
│   ├── workflows/
│   └── index.ts
│
├── .env.example
├── package.json
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/FactoryMind-AI.git

cd FactoryMind-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from `.env.example`.

Example:

```env
OPENAI_API_KEY=your_api_key
FACTORY_API_URL=http://localhost:3000
FACTORY_API_TOKEN=your_token
```

---

## ▶️ Run the Project

Development

```bash
npm run dev
```

Production

```bash
npm run build
npm start
```

---

# MCP Setup

FactoryMind AI is built on the **Model Context Protocol (MCP)** using **NitroStack**.

Configure your MCP server and register the available tools before starting the application.

Example MCP configuration:

```json
{
  "mcpServers": {
    "factorymind": {
      "command": "npm",
      "args": ["run", "start"]
    }
  }
}
```

Once connected, the assistant can invoke manufacturing tools through MCP.

---

# Example Prompts

```
Analyze machine M-102.
```

```
Show the factory dashboard.
```

```
Show executive KPI dashboard.
```

```
Check spare part availability for machine M-102.
```

```
Assign the appropriate technician for machine M-102.
```

```
Create a maintenance ticket for machine M-102.
```

```
Analyze machine M-102, check spare part availability,
assign a technician, and create a maintenance ticket.
```

---

# Example Workflow

```
User
   │
   ▼
FactoryMind AI
   │
   ▼
NitroStack
   │
   ▼
Model Context Protocol (MCP)
   │
   ├── Machine Health Tool
   ├── Production Dashboard Tool
   ├── Spare Parts Tool
   ├── Technician Assignment Tool
   └── Maintenance Ticket Tool
   │
   ▼
Factory Systems / APIs
```

---

## 🔒 Security

- Never commit API keys or secrets.
- Use environment variables.
- Keep sensitive configuration inside `.env`.
- The repository includes `.env.example` for reference.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 👨‍💻 Author

**Advaith K S**

Built for smart manufacturing using **NitroStack** and the **Model Context Protocol (MCP)** to simplify factory operations through AI.
