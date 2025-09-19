mod ssh;
use ssh::SshClient;

use std::sync::Mutex;
use tauri::State;

struct SshState {
    session: Mutex<Option<SshClient>>,
}

impl SshState {
    fn new() -> Self {
        Self {
            session: Mutex::new(None),
        }
    }
}

// 先にSSH接続だけを確立する
#[tauri::command]
async fn ssh_connect(
    state: State<'_, SshState>,
    username: String,
    password: String,
    host: String,
    port: u16,
) -> Result<String, String> {
    let mut client = SshClient::new(username, password, host, port);
    match client.connect() {
        Ok(()) => {
            let mut guard = state.session.lock().unwrap();
            *guard = Some(client);
            Ok("SSH connected".into())
        }
        Err(e) => Err(format!("Connect failed: {e}")),
    }
}

// 接続を破棄する
#[tauri::command]
fn ssh_disconnect(state: State<SshState>) -> String {
    let mut guard = state.session.lock().unwrap();
    let existed = guard.is_some();
    *guard = None;
    if existed {
        "SSH disconnected".into()
    } else {
        "No active SSH".into()
    }
}

// 学習用: 既存のTauriコマンド。保持済みセッションでコマンド実行
#[tauri::command]
fn ssh_exec(state: State<SshState>, command: &str) -> String {
    let guard = state.session.lock().unwrap();
    let Some(client) = guard.as_ref() else {
        return "Not connected. Call ssh_connect first.".into();
    };
    match client.exec(command) {
        Ok(output) => format!("Command output:\n{output}"),
        Err(e) => format!("Exec failed: {e}"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SshState::new())
        .invoke_handler(tauri::generate_handler![
            ssh_connect,
            ssh_disconnect,
            ssh_exec
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
