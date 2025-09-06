"use client"; // 如果用 App Router

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // App Router
import { baseFetch } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
import { dispatchError } from "@/store/method";
import { TOKEN_KEY } from "@/utils/constant";
import { verifyToken } from "@/utils/verifyToken";
import { setToken } from "@/utils/localstorage";
interface Token { "access_token": string, "token_type": string }
export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const checkPassword = () => {
    if (password === "") {
      dispatchError("請輸入密碼")
      return false
    }
    return true
  }
  const loginByAdmin = async () => {
    if (!checkPassword()) {
      return
    }
    const formData = new URLSearchParams();
    formData.append("username", "username");
    formData.append("password", password);
    const { data, error } = await baseFetch<Token>("login/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:formData
    },
      "登入",
      true,
      true
    );

    if (error) {
      return errorHandler(error)
    }

    setToken(data.access_token)
    router.push("/");
  }

  const loginByGuest = async () => {
    const { data, error } = await baseFetch<Token>("login/guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    },
      "登入",
      true,
      true
    );

    if (error) {
      return errorHandler(error)
    }
    setToken(data.access_token)
    router.push("/");
  }
  const checkToken = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return
    }
    const result = await verifyToken()
    if (result === "token_not_pass") {
      return
    }
    router.push("/");
  }
  useEffect(() => {
    checkToken()
  }, [])
  return (
    <div className="h-96 flex-center flex-col">
      <div className="">
        <div className="inline-block">密碼</div>
        <input
          type="password"
          className="mp2 border inline-block"
          value={password}
          onChange={e => setPassword(e.target.value)} />
      </div>
      <div>
        <button className="btn mp2" onClick={() => loginByGuest()}>
          以訪客身分登入
        </button>
        <button className="btn mp2" onClick={() => loginByAdmin()}>
          登入
        </button>
      </div>
    </div>
  );
}