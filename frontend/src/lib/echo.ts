import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "90110a13b652f1f786af",
  cluster: "eu",
  forceTLS: true,

  authEndpoint: "http://localhost:8000/broadcasting/auth",

  auth: {
    headers: {
      Accept: "application/json",
      Authorization: localStorage.getItem("token")
        ? `Bearer ${localStorage.getItem("token")}`
        : "",
    },
  },
});

// ==========================
// SAFE TOKEN UPDATE
// ==========================
export const updateEchoToken = (token: string | null) => {
  if (!echo.options.auth) return;

  if (token) {
    echo.options.auth.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Echo token updated");
  } else {
    delete echo.options.auth.headers.Authorization;
  }
};

export default echo;
