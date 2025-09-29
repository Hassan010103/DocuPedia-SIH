<div align="center">
  <h1>KMRL DocStream Nexus</h1>
  <p>Cloud-first, production-grade document intelligence and collaboration platform</p>
  <p>
    <i>Ingestion → Processing → Storage & Indexing → Insight & Action → Security → UI → Monitoring</i>
  </p>
</div>

---

## 1) Overview

DocStream Nexus is an end-to-end document management and intelligence platform designed for metro operations at scale. It unifies ingestion from many sources, structures and classifies content, extracts insights, secures records, enables knowledge discovery, and powers collaborative workflows.

The system is modular and microservices-driven, with each capability deployable and scalable independently. This repository hosts the modern React front-end; the backend services and data plane are described below to enable a full production rollout.

Key goals
- Consolidate multi-channel document inflow (email, WhatsApp, SharePoint, scans, uploads)
- OCR, bilingual processing, and metadata enrichment
- Department-wise categorization, auto-tagging, timelines, and a knowledge graph
- AI-powered summarization, clause extraction, priority scoring, and personalization
- Secure access with signatures, audit, and compliance tracking
- Powerful search, chatbot Q&A, visualization, and predictive insights


## 2) High-Level Architecture

Ingestion Layer → Processing Layer → Storage & Indexing Layer → Insight & Action Layer → Security Layer → User Interface Layer → Monitoring & Feedback Layer

- Ingestion: Connectors for Email, WhatsApp PDFs, SharePoint, Cloud Storage, Scanners, and Ad‑hoc uploads; queued by Kafka/RabbitMQ
- Processing: OCR, translation, validation, malware scan, NLP-based metadata & categorization
- Storage & Indexing: Raw in object storage; metadata in PostgreSQL; content indexed in Elasticsearch; relationships in Neo4j
- Insight & Action: Summarization (T5/BART), clause extraction (spaCy + RegEx), smart scoring (Transformer + RL), slide generation, task triggers
- Security: PKI signatures, RBAC/ABAC, blockchain audit, compliance alerts
- UI: React app with dashboards, timelines, knowledge graph, chatbot, analytics
- Monitoring: Prometheus/Grafana and ELK; feedback loop to improve models


## 3) Feature Set by Layer

### A. Ingestion (DocStream)
- Multi-source connectors: Gmail/Microsoft Graph, WhatsApp Business/Twilio, SharePoint, S3/Blob/GCS, secure uploads
- OCR for scans, bilingual handling, malware scanning
- Normalization (PDF/DOCX/images) and metadata extraction
- Streaming via Kafka/RabbitMQ; failure queues and CloudWatch/ELK monitoring

### B. Structuring & Categorization
- Department/type categorization using transformer-based contextualization + logistic regression
- Auto-tagging via NER (spaCy), regex heuristics, and user feedback loops
- Document timelines, versioning, and cross-department linkage via Neo4j knowledge graph
- Succession workflows for staff transfers/retirements

### C. Insight Extraction & Summarization (InfoSynth)
- Abstractive summaries via T5/BART; key issues in ≤3 bullets
- Highlighting of dates, financials, safety clauses (spaCy + RegEx)
- SmartScore: transformer features + reinforcement learning signals for prioritization
- Slide generation for board-ready decks; export to Google Slides/PowerPoint
- Bias monitoring and zero-overload personalization
- Doc-to-action: triggers to enterprise systems (e.g., maintenance, HR) via APIs

### D. Security & Compliance (TrustLayer Vault)
- Digital signatures (PKI), biometric signing (WebAuthn/FIDO2)
- RBAC + ABAC enforcement, row- and query-level filters
- Blockchain audit trail (e.g., Hyperledger Fabric or Ethereum) storing document hashes/timestamps
- Compliance trackers with reminders and escalations

### E. Collaboration & Search (Knowledge Grid)
- Dashboards, timelines, and version comparisons
- Graph visualization of relationships (Neo4j)
- Natural‑language search powered by Elasticsearch + embedding retrieval (FAISS)
- Chatbot: BERT + Knowledge Graph–aware retrieval for precise answers

### F. Automation & Personalization (SmartPulse)
- Deadline notifications, smart alerts (push/email/SMS)
- Personalized feeds via RL and interaction telemetry; caching in Redis
- Airflow‑orchestrated workflows

### G. AI Analytics & Predictive Insights (CognitiCore)
- Bias detection and explainability (SHAP/LIME)
- Forecasting using ARIMA/Prophet
- Auto succession planning and query intelligence
- Deepfake/tampering checks for embedded images/signatures

### H. Monitoring, Feedback & Continuous Learning
- System health dashboards (Prometheus/Grafana) and log analytics (ELK)
- User feedback capture; active learning & scheduled retraining (Airflow)


## 4) Technology Stack

- UI: React + TypeScript, Vite, Tailwind
- APIs/Gateway: Node/Express, AWS API Gateway or Kong
- Messaging: Apache Kafka or RabbitMQ
- OCR: AWS Textract / Tesseract / Google Vision
- NLP/ML: Transformers (T5/BART/BERT), spaCy, scikit‑learn, PyTorch/TensorFlow
- Vector/Search: Elasticsearch, FAISS
- Graph: Neo4j or Amazon Neptune
- Datastores: PostgreSQL (metadata), S3/Blob/GCS (raw), MongoDB (aux), Redis (cache)
- Security: OpenSSL / AWS KMS, WebAuthn/FIDO2, RBAC/ABAC, Blockchain audit (Hyperledger/Ethereum)
- Orchestration & Schedules: Apache Airflow, Celery
- Monitoring: Prometheus, Grafana, ELK


## 5) Repository Structure

This repo contains the front‑end app.

```
.
├─ components/              # UI components
├─ contexts/                # i18n + theme providers
├─ data/                    # demo data for local UI
├─ services/                # client-side service stubs
├─ locales/                 # bundled i18n JSON
├─ types.ts                 # shared types
├─ vite.config.ts
├─ package.json
└─ README.md                # you are here
```

Backend microservices, workers, and infrastructure are deployable as separate services (not included in this UI repo).


## 6) Getting Started (Front‑end)

Prerequisites
- Node.js 18+

Install and run
```bash
npm install
npm run dev
```

Build for production
```bash
npm run build
npm run preview
```

Deploy to Vercel
1. Push this repo to GitHub/GitLab
2. Import in Vercel and set required environment variables (see below)
3. Framework preset: Vite; Build Command: `npm run build`; Output: `dist`


## 7) Environment Variables (reference)

Create `.env`/project secrets as needed by your deployment. Not all are required for the UI alone, but are listed for the full platform.

```
# Ingestion
GMAIL_API_KEY=
MS_GRAPH_CLIENT_ID=
MS_GRAPH_CLIENT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Storage & Indexing
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AZURE_BLOB_CONNECTION_STRING=
ELASTICSEARCH_URL=
POSTGRES_URL=
MONGODB_URI=

# Graph / Vector
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
FAISS_INDEX_PATH=

# OCR / Translation
OCR_PROVIDER_KEY=
TRANSLATE_API_KEY=

# Messaging / Orchestration
KAFKA_BROKERS=
RABBITMQ_URL=
AIRFLOW_BASE_URL=

# Security & Auth
JWT_SECRET=
WEB_AUTHN_RP_ID=
BLOCKCHAIN_NODE_URL=

# Monitoring
PROMETHEUS_PUSHGATEWAY=
```


## 8) Data & Model Notes

- Categorization: transformer embeddings + logistic regression per department/type
- Entity extraction: spaCy pipelines + curated regex for dates, deadlines, safety/finance clauses
- Summarization: T5/BART with domain fine‑tuning; configurable length/format
- Scoring: hybrid (transformer features + RL from user interactions)
- Chatbot: BERT encoder + KG‑aware retrieval + Elasticsearch re‑ranking
- Forecasting: ARIMA/Prophet for compliance and workload predictions


## 9) Security & Compliance

- PKI‑based digital signatures and WebAuthn for strong authentication
- RBAC/ABAC with policy enforcement at query time
- Blockchain audit trail storing content hashes + timestamps to guarantee integrity
- Compliance monitors and deadline alerts


## 10) Roadmap

- Multi-tenant tenancy and org‑level policies
- Red‑blue deployment for model updates
- Human‑in‑the‑loop review queues for high‑risk docs
- Data retention and legal hold workflows
- Mobile companion app (capture + approvals)


## 11) Team Submission (Appendix)

- Problem Statement ID: SIH25080
- Title: Document Overload at Kochi Metro Rail Limited (KMRL) – An automated solution
- Theme: Smart Automation
- PS Category: Software
- Team Name: DocuPedia


## 12) License

Copyright © 2025. All rights reserved.

