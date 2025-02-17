import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { TextField, Button, Autocomplete } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Messages from "./messages";
import "./chat.css";

type card = {
  model: string;
  message: string;
  end: boolean;
};

function Chat() {
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

  function cleanResponsesCards() {
    setResponsesCard([]);
  }

  useEffect(() => {
    const container = document.querySelector(".chat-message-container");
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
    <main className="chat-container">
      <div className="chat-header-container">
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
        <Button variant="contained" onClick={cleanResponsesCards}>Clean</Button>
      </div>
      <div className="chat-message-container">
        <div>
          <Messages
            responsesCard={responsesCard}
            askInResponse={askInResponse}
          />
        </div>
      </div>
      <div className="chat-input-container">
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

export default Chat;
