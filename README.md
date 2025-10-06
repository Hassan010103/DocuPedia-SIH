# 🚇 DocuPedia: Intelligent Document Workflow & Decision System

**Transforming document overload into actionable intelligence for Kochi Metro Rail Limited (KMRL).**

DocuPedia is an AI-powered enterprise solution designed to automate document management, streamline workflows, ensure compliance, and preserve institutional knowledge.  
It combines **AI, NLP, Blockchain, and Knowledge Graphs** to turn scattered, multilingual documents into structured, verified, and instantly usable insights.

---

## 🦯 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Module Breakdown](#module-breakdown)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🧩 Overview

Every day, **KMRL** handles thousands of documents — from safety circulars and engineering drawings to invoices and HR directives — scattered across SharePoint, WhatsApp, and email.  
This results in **delays, duplication, compliance risks, and knowledge loss**.

DocuPedia acts as a **one-stop intelligent document ecosystem** that:
- Automates document ingestion and categorization.  
- Creates AI-generated workflows and balanced work assignments.  
- Enables natural-language document querying via chatbot.  
- Ensures document authenticity through blockchain + QR verification.  
- Maintains traceable, department-linked knowledge graphs.

---

## 🚀 Key Features

### 🔹 Smart Ingestion Pipeline
- Connects to **SharePoint, Email, WhatsApp**, and cloud storage.  
- OCR-enabled for multilingual (English + Malayalam) text extraction.  
- Normalizes file formats and stores structured metadata.

### 🔹 AI Workflow Creation
- Auto-generates **multi-step task flows** from new documents (e.g., HR → Compliance → Manager).  
- Reduces manual routing and delays.

### 🔹 AI Workload Distribution
- Dynamically assigns incoming tasks based on **real-time staff workload**.  
- Uses predictive analytics to balance efficiency and avoid bottlenecks.

### 🔹 Knowledge Graph Integration
- Builds a **graph of linked documents** across departments (Engineering ↔ Procurement ↔ HR).  
- Provides cross-department traceability and eliminates data silos.

### 🔹 AI Knowledge Chatbot
- Answers queries in natural language using **semantic search + knowledge graph**.  
- Retains insights like a **retiring employee’s brain**, ensuring knowledge continuity.

### 🔹 Blockchain + QR Verification
- Hashes every document on blockchain for **tamper-proof authenticity**.  
- QR codes allow instant verification of source, version, and timestamp.

### 🔹 Summarization & Insights (InfoSynth AI)
- Condenses lengthy reports into **3-point actionable insights**, highlighting deadlines, risks, and costs.

---

## 🧱 System Architecture

```plaintext
📄 Document Sources → 📥 Ingestion Hub → ⚙️ Preprocessing & Categorization
     ↓
🥉 Knowledge Graph ↔ 🤓 AI Workflow Engine ↔ 🤖 Workload Distribution
     ↓
💬 AI Chatbot  ↔  🔐 Blockchain + QR  ↔  📊 Reports & Dashboards
```

---

## 🤰 Technology Stack

| Layer | Technologies Used |
|-------|--------------------|
| **Frontend** | React.js, Angular, Tailwind |
| **Backend** | FastAPI, Python, Node.js |
| **AI / NLP Models** | T5, BERT, BART, IndicBERT, SpaCy |
| **Knowledge Graph** | Neo4j |
| **Database** | PostgreSQL, MongoDB |
| **Blockchain Layer** | Hyperledger Fabric, IPFS |
| **Cloud & Infra** | AWS / Azure, Kafka, RabbitMQ |
| **Version Control** | Git, GitHub |

---

## ⚙️ Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/DocuPedia.git
   cd DocuPedia
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate     # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   Create a `.env` file and add the following:
   ```bash
   GEMINI_API_KEY = "Your Gemini API Key"
   NEO4J_URI = "Your Neo4j URI"
   NEO4J_USERNAME = "Your Username"
   NEO4J_PASSWORD = "Your Password"
   ```

5. **Run the Application**
   ```bash
   python manage.py runserver
   ```

---

## 💻 Usage

### Web Interface:
- Access via `http://127.0.0.1:8000`
- Features:
  - Document upload & tracking
  - Workflow approval panel
  - AI chatbot interface
  - QR verification dashboard

### Command-line:
```bash
python scripts/summarize.py --input "SafetyCircular.pdf"
```

---

## 🥮 Module Breakdown

| Module | Function |
|--------|-----------|
| **Ingestion Hub** | Gathers and OCRs documents from all sources |
| **Preprocessing Engine** | Cleans and extracts metadata |
| **Workflow Engine** | Builds and routes AI-generated task chains |
| **Workload Manager** | Predictive balancing of staff assignments |
| **Knowledge Graph** | Interlinks related documents |
| **Chatbot Module** | Semantic search + institutional knowledge |
| **Security Layer** | Blockchain + QR verification |
| **Analytics Module** | Summarization, insights, and reports |

---

## 🗂️ File Structure

```plaintext
DocuPedia/
├── manage.py
├── settings.py
├── urls.py
├── requirements.txt
├── ingestion/
│   ├── ocr.py
│   ├── connectors.py
│   └── preprocess.py
├── workflow/
│   ├── generator.py
│   ├── assigner.py
│   └── models.py
├── chatbot/
│   ├── nlp_engine.py
│   ├── semantic_search.py
│   └── chat_interface.html
├── blockchain/
│   ├── qr_module.py
│   └── ledger.py
├── static/
│   └── assets/
└── templates/
    ├── dashboard.html
    ├── chatbot.html
    └── verification.html
```

---

## 🧪 Contributing

We welcome contributions!  
To contribute:
1. Fork the repository  
2. Create a new branch  
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes  
   ```bash
   git commit -am "Add new feature"
   ```
4. Push to your branch  
   ```bash
   git push origin feature/YourFeature
   ```
5. Submit a Pull Request 🎉  

---

## 🧪 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for more details.

---

## 📬 Contact

For queries or collaboration:  
**Team DocuPedia**  
📧 Email: team.docupedia@gmail.com  
🏩 Developed for **Smart India Hackathon 2025**

---

### ✨ *DocuPedia — Turning document overload into intelligent, trusted workflows.*
