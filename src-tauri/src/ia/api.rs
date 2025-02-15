use bytes::Bytes;
use reqwest::Client;
use reqwest::Error;
use serde_json::json;
use tokio_stream::Stream;

// #[derive(Clone)]
#[derive(serde::Deserialize)]
pub struct IaResponse {
    pub model: String,
    pub created_at: String,
    pub response: String,
    pub done: bool,
    pub context: Option<Vec<i32>>,
}

pub struct API {
    base_url: String,
    ia_model: String,
}

impl API {
    pub fn new(base_url: String, ia_model: String) -> Self {
        Self { base_url, ia_model }
    }

    pub async fn generate(
        &self,
        prompt: String,
        context: Option<Vec<i32>>,
    ) -> Result<IaResponse, Box<dyn std::error::Error>> {
        let client = Client::new();

        let payload = json!({
            "model": self.ia_model,
            "prompt": prompt,
            "stream": false,
            "context": context,
        });

        let response = client
            .post(format!("{}/generate", self.base_url))
            .json(&payload)
            .send()
            .await
            .unwrap();

        //   let json: IaResponse = response.json().await.unwrap();
        let json: IaResponse = serde_json::from_slice(&response.bytes().await.unwrap()).unwrap();
        Ok(json)
    }

    pub async fn generate_stream(
        &self,
        prompt: String,
        context: Option<Vec<i32>>,
    ) -> Result<impl Stream<Item = Result<Bytes, Error>>, Error> {
        let client = Client::new();

        let payload = json!({
            "model": self.ia_model,
            "prompt": prompt,
            "stream": true,
            "context": context,
        });

        match client
            .post(format!("{}/generate", self.base_url))
            .json(&payload)
            .send()
            .await
        {
            Ok(response) => Ok(response.bytes_stream()),
            Err(err) => Err(err),
        }
    }
}
