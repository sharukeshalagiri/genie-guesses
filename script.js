function Start() {
  document.getElementById("startBtn").style.display = "none";
  setTitle("Alright, hotshot. Pick a number (1–100)! 🔢");

  const revealOnLoss = document.getElementById("revealOnLoss")?.checked;

  const input = document.createElement("input");
  input.type = "number";
  input.id = "num";
  input.placeholder = "Type 1–100…";
  input.min = "1";
  input.max = "100";
  input.autofocus = true;
  input.inputMode = "numeric";
  input.setAttribute("aria-label", "Enter a number from 1 to 100.");

  const button = document.createElement("button");
  button.innerText = "LOCK IT IN!";
  button.id = "enterBtn";

  const result = document.getElementById("result");
  result.parentNode.insertBefore(input, result);
  result.parentNode.insertBefore(button, result);

  const secret = Math.floor(Math.random() * 100) + 1;
  let attempt = 0;
  let low = 1, high = 100;
  const HOT = 5, WARM = 10;
  const startedAt = Date.now();

  const BEST_KEY = "gg_best";
  const STREAK_KEY = "gg_streak";

  const meta = document.getElementById("meta");
  const range = document.getElementById("range");
  const historyBox = document.getElementById("history");
  const genieEl = document.getElementById("genie");
  historyBox.innerHTML = "";
  historyBox.classList.add("hidden");

  let guessLog = [];
  let giveUpBtn = null;

  function setTitle(t){ document.getElementById("title").innerText = t; }
  function say(msg){ document.getElementById("result").innerText = msg; }
  function setGenie(src){ genieEl.src = src; }
  function bounce(el){ el.classList.add("shake"); setTimeout(()=>el.classList.remove("shake"), 350); }

  function best(){ return Number(localStorage.getItem(BEST_KEY)) || null; }
  function setBest(v){ localStorage.setItem(BEST_KEY, String(v)); }
  function streak(){ return Number(localStorage.getItem(STREAK_KEY)) || 0; }
  function setStreak(v){ localStorage.setItem(STREAK_KEY, String(v)); }

  function tickMeta(){
    const t = ((Date.now() - startedAt)/1000).toFixed(1);
    meta.innerText = `Attempts: ${attempt}. Time: ${t}s. Best: ${best() ?? "—"}. Streak: ${streak()}.`;
  }

  function updateRange(){
    range.innerText = `Still possible: ${low} – ${high}.`;
  }

  function logPill(text, cls = "", tip = "") {
    guessLog.push({ text, cls, tip });
  }

  function renderHistory() {
    historyBox.innerHTML = "";
    for (const h of guessLog) {
      const span = document.createElement("span");
      span.className = `pill ${h.cls || ""}`;
      span.innerText = h.text;
      if (h.tip) span.title = h.tip;
      historyBox.appendChild(span);
    }
  }

  function ensureGiveUpButton() {
    if (giveUpBtn) return;
    giveUpBtn = document.createElement("button");
    giveUpBtn.id = "giveUpBtn";
    giveUpBtn.innerText = "Give up";
    giveUpBtn.style.marginLeft = "10px";
    button.insertAdjacentElement("afterend", giveUpBtn);

    giveUpBtn.onclick = function(){
      say(`You gave up. The number was ${secret}. That is why she left you, LOSER.`);
      setGenie("imgs/BadAnss.png");
      setStreak(0);
      tickMeta();
      renderHistory();
      historyBox.classList.remove("hidden");
      bounce(genieEl);
      showPlayAgainOptions(input, button);
      if (giveUpBtn) { giveUpBtn.remove(); giveUpBtn = null; }
    };
  }

  say("I’ve picked a number. Beat me! 😈");
  setGenie("imgs/Logo.png");
  tickMeta();
  updateRange();

  input.addEventListener("keydown", (e)=>{ if(e.key === "Enter") button.click(); });

  button.onclick = function(){
    const raw = input.value.trim();
    const guess = parseInt(raw, 10);

    if (!/^\d+$/.test(raw) || isNaN(guess) || guess < 1 || guess > 100){
      say("Bro, give me a whole number from 1 to 100!");
      setGenie("imgs/BadAnss.png");
      bounce(input);
      bounce(genieEl);
      input.focus();
      return;
    }

    attempt++;
    if (attempt >= 3 && !giveUpBtn) {
      ensureGiveUpButton();
    }

    if (guess === secret){
      const time = ((Date.now() - startedAt)/1000).toFixed(1);
      say(`BOOM! 🎯 ${guess} it is. You did it in ${attempt} attempt${attempt>1?"s":""} and ${time}s.`);
      setGenie("imgs/CorrectAnss.png");

      logPill(`${guess}`, "correct", "Correct guess.");

      const b = best();
      if (!b || attempt < b) setBest(attempt);
      setStreak(streak()+1);
      tickMeta();

      renderHistory();
      historyBox.classList.remove("hidden");

      if (giveUpBtn) { giveUpBtn.remove(); giveUpBtn = null; }
      showPlayAgainOptions(input, button);
      return;
    }

    const diff = Math.abs(secret - guess);
    let line = (guess > secret) ? "Too high." : "Too low.";
    let tag = "cold";

    if (diff <= HOT){
      line = "Man, this guy is coming close! 🔥";
      tag = "hot";
    } else if (diff <= WARM){
      line += " Warm.";
    }

    if (guess < secret) { low = Math.max(low, guess+1); }
    else { high = Math.min(high, guess-1); }

    say(line);

    if (diff <= 5) {
      setGenie("imgs/AlmostThere.png");
    } else {
      setGenie("imgs/BadAnss.png");
    }

    bounce(genieEl);

    logPill(`${guess} (${diff})`, tag, `Guess ${guess} → ${diff} away.`);
    tickMeta();
    updateRange();
    input.select();
  };
}

function showPlayAgainOptions(inputEl, buttonEl){
  inputEl.remove();
  buttonEl.remove();

  const res = document.getElementById("result");

  const br = document.createElement("br");
  const note = document.createTextNode("Run it back?");
  const yesBtn = document.createElement("button");
  const noBtn = document.createElement("button");

  yesBtn.innerText = "One more round!";
  noBtn.innerText = "I’m done for now.";
  yesBtn.style.margin = "10px";
  noBtn.style.margin = "10px";

  res.appendChild(br);
  res.appendChild(note);
  res.appendChild(yesBtn);
  res.appendChild(noBtn);

  yesBtn.onclick = function(){
    document.getElementById("genie").src = "imgs/Logo.png";
    location.reload();
  };

  noBtn.onclick = function(){
    document.getElementById("genie").src = "imgs/Logo.png";
    document.querySelector("h2").innerText = "GGs. Thanks for playing! 👋";
    res.innerHTML = "";
    const STREAK_KEY = "gg_streak";
    localStorage.setItem(STREAK_KEY, "0");
  };
}
