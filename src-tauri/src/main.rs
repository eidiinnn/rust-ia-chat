mod ia;

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // let ia = IaInterface::new("test".to_string(), "llama3.2".to_string(), None);
    // ia.ask(String::from("test"));
    ia_chat_lib::run()
}
