@echo off
echo Starting Backend Server...
start cmd /k "cd backend && npx ts-node src/server.ts"

echo Starting Hardhat Local Blockchain...
start cmd /k "cd blockchain && npx hardhat node"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo ==============================================
echo SecureVote System is starting up!
echo ==============================================
echo 1. Wait a moment for all servers to initialize.
echo 2. Frontend will be available at: http://localhost:5173
echo 3. Backend will be available at: http://localhost:5000
echo 4. Hardhat RPC will be available at: http://127.0.0.1:8545
echo ==============================================
pause
