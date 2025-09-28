use dotenv;
use serde::Deserialize;
use std::env;
use std::path::PathBuf;
use std::sync::OnceLock;

/// 設定結構
#[derive(Debug, Deserialize, Clone)]
pub struct Settings {
    pub sql_url: String,
    pub environment: String,
    pub frontend_guest_origin: String,
    pub port:String,
    pub monitor_origin:String
}

impl Settings {
    /// 從環境變數載入，並指定 .env 檔案
    fn create_err_str(key:&str)->String{
       return format!("{} environment variable is missing", key);
    }
    pub fn load_env_file() -> Result<Self, String> {
        // 專案根目錄
        let project_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

        // 取得 ENVIRONMENT
        let current_env =
            env::var("ENVIRONMENT").map_err(|_| "ENVIRONMENT is empty".to_string())?;
        let env_file_name = format!(".env.{}", current_env);

        let env_file_path = project_root.join(env_file_name);

        if !env_file_path.exists() {
            return Err(format!(
                ".env file for environment '{}' not found at {:?}",
                current_env, env_file_path
            ));
        }
        dotenv::from_path(env_file_path).map_err(|e| format!("Failed to load .env: {}", e))?;
        // 讀取必填環境變數
        let sql_url = env::var("DATABASE_URL")
            .map_err(|_| Self::create_err_str("DATABASE_URL"))?;
        let frontend_guest_origin = env::var("FRONTEND_GUEST_ORIGIN")
            .map_err(|_| Self::create_err_str("FRONTEND_GUEST_ORIGIN"))?;
        let port = env::var("PORT")
            .map_err(|_| Self::create_err_str("PORT"))?;
        let monitor_origin = env::var("MONITOR_ORIGIN")
            .map_err(|_| Self::create_err_str("MONITOR_ORIGIN"))?;

        Ok(Self {
            sql_url,
            environment: current_env,
            frontend_guest_origin,
            port,
            monitor_origin
        })
    }

    /// 是否為開發環境
    pub fn is_dev_environment(&self) -> bool {
        self.environment == "dev"
    }
}

static SETTINGS: OnceLock<Settings> = OnceLock::new();

pub fn get_settings() -> &'static Settings {
    SETTINGS.get_or_init(|| {
        // 如果載入設定失敗，直接 panic
        Settings::load_env_file().expect("Failed to load Settings")
    })
}