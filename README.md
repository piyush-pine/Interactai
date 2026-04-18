# InteractAI Project

This repository contains the backend server and self-hosted code execution engine (Piston) for the InteractAI platform.

## Project Structure
- `/server`: The Node.js/Express backend server.
- `/piston`: Docker-based self-hosted code execution engine.

---

## 🚀 Quick Start (For Teammates)

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **npm**
- **Docker & Docker Compose**

### 2. Setup Code Execution (Piston)
To run code assessments without hitting third-party API limits, we use a self-hosted Piston instance.

1. Navigate to the piston folder:
   ```bash
   cd piston
   ```
2. Start the service and install language runtimes:
   ```bash
   sudo ./setup_piston.sh
   ```
   *Note: This will start a Docker container and install common languages (Python, Java, C++, etc.).*

3. Verify it's running:
   ```bash
   curl http://localhost:2000/api/v2/runtimes
   ```

### 3. Setup Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and ensure `PISTON_API_URL` is set to:
   ```env
   PISTON_API_URL=http://localhost:2000/api/v2
   ```
4. Start the server (Development mode):
   ```bash
   npm run dev
   ```

---

## 🛠 Features
- **Code Execution**: Powered by Piston (Self-hosted). Supports Python, C++, Java, Rust, Go, and more.
- **Zoom Integration**: Automated meeting creation and management.
- **AI Moderator**: Integrated with VAPI for real-time guidance.

## 🧪 Testing the Integration
Once both are running, you can test a code execution via curl:
```bash
curl -X POST http://localhost:5000/api/execute \
-H "Content-Type: application/json" \
-d '{
  "language": "python",
  "code": "print(\"Server is connected to Local Piston!\")"
}'
```
