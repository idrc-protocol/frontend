import { useEffect, useState } from "react";

export function useTurnstile() {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [userIp, setUserIp] = useState("");

  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();

        setUserIp(data.ip);
      } catch (error) {
        throw error;
      }
    };

    fetchUserIp();
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken("");
  };

  return {
    turnstileToken,
    setTurnstileToken,
    userIp,
    resetTurnstile,
  };
}
