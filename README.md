# 🛡️ CyberShield: Explainable AI Agent for Cybersecurity Awareness

## 📌 1. Project Overview

Users often struggle to recognize suspicious emails, phishing links, and social-engineering tactics.

**CyberShield** is a full-stack AI-powered cybersecurity awareness agent that analyzes suspicious messages, identifies warning signs, and explains the reasoning behind its risk assessment.

Unlike traditional black-box spam filters, CyberShield combines Machine Learning, rule-based indicator extraction, and Retrieval-Augmented Generation (RAG) to provide evidence-based security explanations.

### Key Features

- **Message Analysis:** Analyze suspicious email and SMS text.
- **Phishing Detection:** Predict whether a message may be malicious.
- **Red-Flag Identification:** Highlight suspicious phrases, URLs, urgency, credential requests, and impersonation attempts.
- **Explainable Results:** Explain why a message has been flagged.
- **Cybersecurity Knowledge Retrieval:** Retrieve relevant guidance from trusted sources such as CISA, NIST, and the FTC.
- **Safe-Response Checklist:** Provide practical steps to take when a suspicious message is detected.
- **AI-Powered Explanations:** Use Google Gemini when additional reasoning is required.
- **Interactive Chat Interface:** Communicate with CyberShield through a modern React-based chat interface.
- **Conversation Management:** Create new scans, switch between conversations, and view chat history during the current session.

### How CyberShield Works — 4-Tool Workflow

1. **Machine Learning Classification:** A Logistic Regression model trained on message datasets predicts the probability that the submitted text is malicious.
2. **Indicator Extraction:** A Python-based rule engine uses regular expressions (Regex) to identify warning signs such as urgency, suspicious URLs, credential requests, and impersonation.
3. **Knowledge Retrieval:** The system matches identified indicators with a curated JSON knowledge base containing cybersecurity guidance from trusted sources.
4. **Router and LLM Generation:** A smart router evaluates the available evidence:
   - If the ML prediction is highly confident and multiple warning signs are detected, a local Python template generates the explanation.
   - If the evidence is uncertain or requires additional reasoning, the system calls the Google Gemini LLM to generate a contextual explanation.

The system also considers prompt-injection risks when processing untrusted message content.

> **Disclaimer:** CyberShield is a cybersecurity warning and awareness tool, not a guarantee that a message is safe or malicious. Always verify suspicious messages through official channels.

---

## 🏗️ 2. System Architecture and Technology Stack

CyberShield follows a client-server architecture in which the React frontend communicates with the Python FastAPI backend through HTTP requests.

### Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend Framework | React | Build an interactive and component-based user interface |
| Frontend Build Tool | Vite | Development server and frontend build process |
| Programming Language | TypeScript | Add static typing and improve frontend code reliability |
| Styling | Tailwind CSS | Create a responsive and modern user interface |
| Icons | Lucide React | Provide consistent interface icons |
| Markdown Rendering | React Markdown (`react-markdown`) | Render formatted explanations returned by the backend |
| Frontend State Management | React Hooks (`useState`, `useEffect`) | Manage messages, conversations, loading states, and UI interactions |
| Backend | Python 3.13, FastAPI | Handle API requests and application logic |
| Server | Uvicorn | Run the FastAPI application |
| Machine Learning | Scikit-learn | Train and execute the classification model |
| Text Processing | TF-IDF | Convert messages into numerical features |
| Data Processing | Pandas | Load and process datasets |
| Model Storage | Joblib | Save and load trained ML models |
| LLM Integration | Google GenAI SDK | Generate contextual explanations |
| Knowledge Base | JSON | Store verified cybersecurity guidance |

### Frontend Overview

The original frontend, which was developed using HTML, CSS, and Vanilla JavaScript, has been migrated to a modern **React + TypeScript application using Vite and Tailwind CSS**.

The updated frontend provides an interactive chat-based interface for communicating with the CyberShield backend.

**Major frontend components and functionality:**

- **Interactive Sidebar:** Displays conversations and provides navigation between previous scans.
- **New Scan:** Allows users to start a fresh conversation.
- **Dynamic Conversation Titles:** Automatically generates a conversation title based on the first user message.
- **Chat Interface:** Displays user messages and CyberShield's analysis in separate chat bubbles.
- **Loading Animation:** Displays three bouncing dots while the backend processes a submitted message.
- **Markdown Rendering:** Uses React Markdown to display structured backend responses, including headings, bullet points, and bold text.
- **Message Actions:** Provides copy, like, and dislike buttons for interacting with responses.
- **Responsive Design:** Uses Tailwind CSS to adapt the interface to different screen sizes.
- **Session-Based History:** Maintains conversation history in React state while the application remains active.

### Frontend and Backend Communication

The React frontend communicates with the FastAPI backend using the JavaScript `fetch()` API.

When a user submits a message:

1. React captures the submitted text.
2. The frontend sends a POST request to the backend's `/analyze` endpoint.
3. The message is sent in JSON format.
4. FastAPI processes the message using the CyberShield detection workflow.
5. The backend returns a JSON response containing the analysis.
6. React receives the response and displays the explanation using React Markdown.

**Backend API endpoint:**

`http://127.0.0.1:8000/analyze`

**Request format:**

```json
{
  "message": "Your account will be blocked. Share your OTP immediately."
}
```

### Datasets Used

CyberShield combines the following datasets:

1. **UCI SMS Spam Collection:** SMS messages labelled as spam or legitimate.
2. **Phishing Validation Emails Dataset:** Email samples labelled as safe or phishing.
3. **Multiclass NLP Dataset for Phishing and Social Engineering:** Examples covering phishing, malware, scareware, baiting, pretexting, and non-malicious messages.

**Combined dataset size:** 8,196 rows, as currently reported by the project.

### Model Performance

| Evaluation Metric | Reported Result |
|---|---:|
| Overall Accuracy | 98% |
| Malicious Message Recall | 96% |

*Note: These are the project's reported results. For reproducibility, document the train-test split, preprocessing, class distribution, and evaluation procedure. Confirm the final dataset row count after cleaning and duplicate removal.*

---

## 🚀 3. Setup and Installation Guide

Follow these steps to set up and run CyberShield on your local machine.

### Prerequisites

Make sure the following software is installed:

- **Python 3.13 or compatible version**
- **Node.js and npm**
- **Git**
- **Visual Studio Code** (recommended)

### Step 1: Clone the Repository

Open your terminal and execute:

```bash
git clone https://github.com/Nitish-Goregaonkar/CyberShield-AI-Agent.git
```

Navigate to the project directory:

```bash
cd CyberShield-AI-Agent
```

### Step 2: Create a Python Virtual Environment

A virtual environment keeps project dependencies separate from your system-wide Python installation.

Create the environment:

```bash
python -m venv venv
```

**Activate on Windows (PowerShell):**

```powershell
venv\Scripts\Activate.ps1
```

**Activate on Windows (Command Prompt):**

```cmd
venv\Scripts\activate
```

**Activate on macOS/Linux:**

```bash
source venv/bin/activate
```

Once activated, your terminal should display `(venv)`.

### Step 3: Install Backend Dependencies

With the virtual environment active, install the required Python packages:

```bash
python -m pip install fastapi uvicorn scikit-learn pandas google-genai python-multipart openpyxl joblib python-dotenv
```

These packages provide the backend framework, machine learning functionality, data processing, Gemini integration, and environment-variable support.

### Step 4: Install Frontend Dependencies

CyberShield uses React, TypeScript, Vite, Tailwind CSS, Lucide React, and React Markdown for its frontend.

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

This installs the packages specified in the frontend's `package.json` file.

### Step 5: Configure the Gemini API Key

CyberShield uses Google Gemini to generate additional explanations when the local ML model and rule-based evidence require further reasoning.

**1. Generate an API key**

- Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
- Sign in with your Google account.
- Create an API key and copy it.

**2. Configure the environment variable**

For Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

For Windows Command Prompt:

```cmd
set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

For macOS/Linux:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**3. Access the key from your backend**

In `backend/agent.py`, retrieve the key using:

```python
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
```

Do not paste your real API key into frontend React or TypeScript files or commit it to GitHub.

If you prefer using a `.env` file, install and use `python-dotenv`, load it with `load_dotenv()`, and add `.env` to `.gitignore`.

### Step 6: Run the Backend Server

Open a terminal and navigate to the backend directory from the project root:

```bash
cd backend
```

Start the FastAPI backend:

```bash
python main.py
```

Keep this terminal open while using the application.

The backend should be accessible at:

`http://127.0.0.1:8000`

### Step 7: Run the React Frontend

Open another terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display a local development URL in the terminal, usually:

`http://localhost:5173`

Open the displayed URL in your browser to access the CyberShield application.

**Important:** Keep both the FastAPI backend and React frontend terminals running while using the application.

---

## 🧪 4. Testing the CyberShield Agent

After launching the application, enter the following sample messages into the CyberShield chat interface to test its workflow.

### Test Case 1: High-Confidence Phishing Message

**Expected behaviour:** The ML model and rule engine identify multiple suspicious indicators. The router uses a local Python template when its confidence and evidence conditions are met.

**Sample message:**

> URGENT: Your Netflix account is on hold. We could not validate your billing information. Please update your payment details immediately at http://netflix-billing-update.com to avoid suspension.

**Indicators to identify:**

- Urgent language and pressure.
- Suspicious external URL.
- Request for payment information.
- Threat of account suspension.

### Test Case 2: Potential Social-Engineering Message

**Expected behaviour:** The message may require additional contextual analysis. If the router's uncertainty conditions are met, Gemini generates a cautious explanation.

**Sample message:**

> Hi, this is Sarah from the HR department. Are you at your desk? I need you to quickly review a confidential document before our meeting. Let me know when you are free.

**Potential indicators:**

- Claimed authority or identity.
- Request involving confidential information.
- Pressure to respond quickly.

*This is an ambiguous example, not proof of an attack. A legitimate HR employee could send a similar message.*

### Test Case 3: Normal Personal Message

**Expected behaviour:** The model predicts a low malicious probability, and the system returns a low-risk assessment.

**Sample message:**

> Hey mom, just letting you know I will be home around 7 PM tonight. Do you want me to pick up some pizza on the way back?

**Expected result:** Low Signal / Low Risk.

---

## 👥 5. Project Team

This project was developed as part of the B.Tech curriculum.

| Team Member | PRN NO. |
|---|---|
| Nitish Naresh Goregaonkar | 2503033111245507 |
| Dnyaneshwar Yashwant Kamblekar | 2503033111245508 |

---

## 📜 6. References and Bibliography

| Source / Organization | Title and Description | Link |
|---|---|---|
| NIST | Phishing Guidance for Small Businesses — Guidance on recognizing phishing and social-engineering threats. | [Visit NIST](https://www.nist.gov/itl/smallbusinesscyber/guidance-topic/phishing) |
| CISA | Recognize and Report Phishing — Guidance on identifying suspicious links, unexpected attachments, and reporting phishing. | [Visit CISA](https://www.cisa.gov/secure-our-world/recognize-and-report-phishing) |
| FTC | How to Recognize and Avoid Phishing Scams — Consumer guidance on recognizing phishing and responding safely. | [Visit FTC](https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams) |
| UCI Machine Learning Repository | SMS Spam Collection Dataset — Public SMS dataset used for baseline text classification. | [View Dataset](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) |
| Zenodo | Phishing Validation Emails Dataset (Miltchev et al.) — Email samples labelled as safe or phishing. | [View Dataset](https://zenodo.org/records/13378848) |
| Zenodo | Multiclass NLP Dataset for Phishing and Social Engineering — Dataset covering phishing, malware, scareware, baiting, pretexting, and non-malicious messages. | [View Dataset](https://zenodo.org/records/15235123) |
| Google AI | Gemini API Documentation — Documentation for integrating Gemini into applications. | [View Documentation](https://ai.google.dev/gemini-api/docs) |
| React | React Documentation — Documentation for building component-based user interfaces. | [View Documentation](https://react.dev/learn) |
| Vite | Vite Documentation — Documentation for frontend development and build tooling. | [View Documentation](https://vite.dev/guide/) |
| TypeScript | TypeScript Documentation — Documentation for static typing in JavaScript applications. | [View Documentation](https://www.typescriptlang.org/docs/) |
| Tailwind CSS | Tailwind CSS Documentation — Documentation for utility-first CSS styling. | [View Documentation](https://tailwindcss.com/docs) |
| Lucide | Lucide Icons — Open-source icon library used in the React frontend. | [View Documentation](https://lucide.dev/guide/packages/lucide-react) |
| React Markdown | React Markdown Documentation — Documentation for rendering Markdown content in React. | [View Documentation](https://github.com/remarkjs/react-markdown) |

---

## 📄 7. License

This project was developed for academic and educational purposes as part of the B.Tech curriculum.

Dataset usage remains subject to the respective dataset licenses and terms of use.