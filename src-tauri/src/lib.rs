mod ia;
use ia::{IaInterface, IaResponse};
use tauri::{AppHandle, Emitter, Runtime};
use tokio_stream::StreamExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn ia_ask(message: &str) -> Result<String, String> {
    let ia = IaInterface::new("asking".to_string(), "llama3.2".to_string(), None);
    match ia.ask(message.to_string()).await {
        Ok(result) => Ok(format!("{}", result).to_string()),
        Err(err) => Err(err),
    }
}

#[derive(Clone, serde::Serialize)]
pub struct StreamPayload {
    pub message: String,
}

#[tauri::command]
async fn ia_ask_stream<R: Runtime>(
    app_handle: AppHandle<R>,
    model: Option<String>,
    message: &str,
) -> Result<String, String> {
    let model = match model {
        Some(model) => model,
        None => String::from("llama3.2"),
    };

    let ia = IaInterface::new("asking with stream returning".to_string(), model, None);
    let mut stream = ia.ask_stream(message.to_string()).await.unwrap();

    let mut message = String::new();

    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let response: IaResponse = serde_json::from_slice(&bytes.to_vec()).unwrap();
                message.push_str(&response.response);
                println!("receive: {:?}", &message);

                app_handle
                    .emit(
                        "ai_ask_stream_return",
                        StreamPayload {
                            message: message.clone(),
                        },
                    )
                    .unwrap();
            }
            Err(e) => eprintln!("Error while receiving chunk: {}", e),
        }
    }

    Ok("success".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ia_ask, ia_ask_stream])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
