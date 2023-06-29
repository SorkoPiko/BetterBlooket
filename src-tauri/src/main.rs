// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    State
};

use declarative_discord_rich_presence::{
    DeclarativeDiscordIpcClient,
    activity::{Activity, Timestamps, Assets},
};

#[tauri::command]
fn set_activity(discord_ipc_client: State<'_, DeclarativeDiscordIpcClient>, state: &str, large_image: &str, large_text: &str, small_image: &str, small_text: &str, timestamp_start: i64) {
    if let Err(why) = discord_ipc_client.set_activity(Activity::new()
        .state(state)
        // .details(details)
        .assets(Assets::new()
            .large_image(large_image)
            .large_text(large_text)
            .small_image(small_image)
            .small_text(small_text))
        .timestamps(Timestamps::new().start(timestamp_start))
    ) {
        println!("Failed to set presence: {}", why);
    }
}

#[tauri::command]
fn set_activity_countdown(discord_ipc_client: State<'_, DeclarativeDiscordIpcClient>, state: &str, large_image: &str, large_text: &str, small_image: &str, small_text: &str, timestamp_start: i64, timestamp_end: i64) {
    if let Err(why) = discord_ipc_client.set_activity(Activity::new()
        .state(state)
        // .details(details)
        .assets(Assets::new()
            .large_image(large_image)
            .large_text(large_text)
            .small_image(small_image)
            .small_text(small_text))
        .timestamps(Timestamps::new()
            .start(timestamp_start)
            .end(timestamp_end))
    ) {
        println!("Failed to set presence: {}", why);
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {

            let discord_ipc_client = DeclarativeDiscordIpcClient::new("1123754003889655838");

            discord_ipc_client.enable();
        
            if let Err(why) = discord_ipc_client.set_activity(Activity::new().state("real")) {
                  println!("Failed to set presence: {}", why);
              }
              app.manage(discord_ipc_client);
              Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_activity, set_activity_countdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
