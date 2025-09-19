import { useState } from "react";
import ConnectPanel from "./components/ConnectPanel";
import SendCommandCard from "./components/SendCommandCard";
import TerminalOutput from "./components/TerminalOutput";
import "./App.css";

function App() {
  const [output, setOutput] = useState<string>("");
  const [connected, setConnected] = useState(false);

  return (
    <main
      className="container"
      style={{ display: "grid", gap: 16, gridTemplateColumns: "auto 1fr" }}
    >
      <div style={{ display: "grid", gap: 16, width: 380 }}>
        <ConnectPanel onLog={setOutput} isConnected={connected} onConnectedChange={setConnected} />
        <SendCommandCard setOutput={setOutput} isConnected={connected} />
      </div>
      <TerminalOutput log={output} height={480} />
    </main>
  );
}

export default App;
