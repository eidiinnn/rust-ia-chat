import { Card, CardContent, CircularProgress } from "@mui/material";
import ReactMarkdown from "react-markdown";

type CardProps = {
  responsesCard: Array<{ model: string; message: string; end: boolean }>;
  askInResponse: string;
};

export default function Messages({
  responsesCard,
  askInResponse,
}: CardProps) {
  return (
    <div className="chat-message-container">
      <div>
        {responsesCard.map((response, index) => (
          <Card key={index}>
            <CardContent>
              <div>{response.model}</div>
              {!response.end && !askInResponse && (
                <CircularProgress size={30} />
              )}
              <ReactMarkdown>
                {response.end ? response.message : askInResponse}
              </ReactMarkdown>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
