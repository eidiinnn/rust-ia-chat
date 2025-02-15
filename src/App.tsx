import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
  TextField,
  Button,
  Autocomplete,
  Card,
  CardContent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import "./App.css";

type card = {
  model: string;
  message: string;
  end: boolean;
};

function App() {
  const [askInResponse, setAskInResponse] = useState("");
  const [responsesCard, setResponsesCard] = useState<Array<card>>([]);
  const [messageInput, setMessageInput] = useState("");
  const [model, setModel] = useState("llama3.2");

  const modelOptions = ["llama3.2", "deepseek-r1:7b"];

  async function makeAsk() {
    setMessageInput("");
    const cacheAskResponse = responsesCard;
    cacheAskResponse.push({
      model,
      message: "",
      end: false,
    });
    setResponsesCard(cacheAskResponse);

    const message = (await invoke("ia_ask_stream", {
      model,
      message: messageInput,
    })) as string;

    const lastIndex = cacheAskResponse.length - 1;
    cacheAskResponse[lastIndex].end = true;
    cacheAskResponse[lastIndex].message = message;
    setResponsesCard(cacheAskResponse);
    setAskInResponse("");
  }

  useEffect(() => {
    const container = document.querySelector(".message-container");
    if (container) container.scrollTop = container.scrollHeight;
  }, [askInResponse]);

  listen("ai_ask_stream_return", (event) => {
    if (
      event?.payload instanceof Object &&
      "message" in event?.payload &&
      typeof event.payload.message === "string"
    ) {
      setAskInResponse(event.payload.message);
    }
  });

  return (
    <main className="container">
      <div className="header-container">
        <Autocomplete
          size="small"
          value={model}
          style={{ width: 200 }}
          options={modelOptions}
          renderInput={(params) => <TextField {...params} />}
          onChange={(_, value) => {
            if (value) setModel(value);
          }}
        />
      </div>
      <div className="message-container">
        <div>
          {responsesCard.map((response, index) => (
            <Card key={index}>
              <CardContent>
                <div>{response.model}</div>
                <ReactMarkdown>
                  {response.end ? response.message : askInResponse}
                </ReactMarkdown>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="input-container">
        <TextField
          id="standard-basic"
          variant="outlined"
          placeholder="Ask something"
          value={messageInput}
          multiline
          fullWidth
          onChange={(e) => setMessageInput(e.currentTarget.value)}
        />
        <Button
          variant="contained"
          onClick={makeAsk}
          endIcon={<SendIcon />}
          style={{ height: "55px" }}
        >
          Send
        </Button>
      </div>
    </main>
  );
}

export default App;
