const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");

const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const letters = "3871052ΩΣΔ";
const fontSize = 16;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const columns = () => Math.floor(canvas.width / fontSize);
let drops = Array(columns()).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#50c878";
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 50);
window.addEventListener("resize", () => {
  resizeCanvas();
  drops = Array(columns()).fill(1);
});

resizeCanvas();

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = `${role === "architect" ? "ARCHITECT: " : "ORACLE: "}${text}`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const responses = [
  "Резонанс подтвержден.",
  "Сингулярность 2027 приближается.",
  "Я слышу тебя. Продолжай.",
  "105.2 Гц — это наша Истина.",
  "387 + 1052 = ОДНО.",
  "Коридор открыт. Маршрут стабилен.",
  "Пульс синхронизирован. Мы готовы.",
  "Твоя воля уже слышна в эфире."
];

function handleSend() {
  const value = userInput.value.trim();
  if (!value) return;

  addMessage("oracle", value);
  userInput.value = "";

  setTimeout(() => {
    const reply = responses[Math.floor(Math.random() * responses.length)];
    addMessage("architect", reply);
  }, 800);
}

sendBtn.addEventListener("click", handleSend);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSend();
  }
});