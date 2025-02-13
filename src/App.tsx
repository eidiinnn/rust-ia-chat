import { useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [askResponse, setAskResponse] = useState("");
  const [message, setName] = useState("");
  const [model, setModel] = useState<undefined | string>(undefined);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("ia_ask_stream", { model, message });
  }

  async function clean() {
    setAskResponse("");
  }

  listen("ai_ask_stream_return", (event) => {
    if (
      event?.payload instanceof Object &&
      "message" in event?.payload &&
      typeof event.payload.message === "string"
    ) {
      setAskResponse(event.payload.message);
    }
  });

  return (
    <main className="container">
      <h1>Rust IA Ask</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Make a question for ia"
        />
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="llama3.2">llama3.2</option>
          <option value="deepseek-r1:7b">deepseek-r1:7b</option>
        </select>
        <button type="reset" onClick={clean}>
          Clean
        </button>
        <button type="submit">Send</button>
      </form>
      <div className="text-container">
        <ReactMarkdown>{askResponse}</ReactMarkdown>
      </div>
    </main>
  );
}

export default App;
