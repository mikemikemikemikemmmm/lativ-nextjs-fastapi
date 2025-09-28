import os
import uvicorn
from src.utils.env import load_env
load_env()

port = os.getenv("PORT")
env = os.getenv("ENVIRONMENT")
if not port :
    raise Exception("no PORT env")
if not env :
    raise Exception("no ENVIRONMENT env")
is_dev =  env == "dev"
if __name__ == "__main__":
    print("try to start")
    print(f"port = {int(port)}")
    print(f"reload = {True if is_dev else False}")
    uvicorn.run("src.app:app", port=int(port), host="127.0.0.1", log_level="info",reload=True if is_dev else False)