use super::API;
use bytes::Bytes;
use reqwest::Error;
use tokio_stream::Stream;

pub struct IaInterface {
    pub name: String,
    pub ia_model: String,
    api_client: API,
}

#[derive(Debug)]
enum LogType {
    Info,
    Error,
    Warn,
}

impl IaInterface {
    pub fn new(name: String, ia_model: String, base_url: Option<String>) -> Self {
        let base_url: String = match base_url {
            Some(base_url) => base_url,
            None => "http://localhost:11434/api".to_owned(),
        };

        let api_client = API::new(base_url, ia_model.clone());

        Self {
            name,
            ia_model,
            api_client,
        }
    }

    pub async fn ask(&self, ask: String) -> Result<String, String> {
        self.print(LogType::Info, format!("asking the question: \"{}\"", &ask));

        match self.api_client.generate(ask, None).await {
            Ok(response) => {
                self.print(
                    LogType::Info,
                    format!("ia response \"{}\"", response.response),
                );
                Ok(response.response)
            }
            Err(err) => {
                self.print(
                    LogType::Error,
                    format!("Error to use the ia API erro: \"{}\"", err),
                );
                Err(err.to_string())
            }
        }
    }

    pub async fn ask_stream(
        &self,
        ask: String,
    ) -> Result<impl Stream<Item = Result<Bytes, Error>>, Error> {
        self.print(LogType::Info, format!("asking the question: \"{}\"", &ask));
        match self.api_client.generate_stream(ask, None).await {
            Ok(stream) => Ok(stream),
            Err(error) => Err(error),
        }
    }

    pub fn clean_context(&self) {}

    fn make_request(&self) {}

    fn print(&self, log_type: LogType, text: String) {
        println!("{:?}: [IA] [{}] {}", log_type, self.name, text)
    }
}
