

const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector("button"),
  win: document.querySelector(".win"),
};

const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
  score: 1000,
  user: null
};

function updateUser(email) {
  state.user = email; 
  console.log("Updated user:", state.user);
}

const userEmail = localStorage.getItem("userEmail");
if (userEmail) {
  updateUser(userEmail);
} else {
  window.location.href = "../pages/login.html";
  console.log("User email not found.");
}

const shuffle = (array) => {
  const clonedArray = [...array];

  for (let i = clonedArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const original = clonedArray[i];

    clonedArray[i] = clonedArray[randomIndex];
    clonedArray[randomIndex] = original;
  }

  return clonedArray;
};

const pickRandom = (array, items) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let i = 0; i < items; i++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);

    randomPicks.push(clonedArray[randomIndex]);
    clonedArray.splice(randomIndex, 1);
  }

  return randomPicks;
};

const calculateScore = () => {
  const baseScore = 1000;
  const moveFactor = 5;
  state.score = baseScore - state.totalFlips * moveFactor;
  return state.score > 0 ? state.score : 0;
};

const updateScore = () => {
  const score = calculateScore();
  const scoreElement = document.querySelector(".score");
  scoreElement.innerText = `Score: ${state.score}`;
};

const generateGame = () => {
  const dimensions = selectors.board.getAttribute("data-dimension");

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be an even number.");
  }

  const emojis = ["😆", "🥰", "🥳", "☠️", "🤡", "🤖", "🤕", "🎃", "👺", "🥵"];
  const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);
  const cards = `
      <section class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
          ${items
            .map(
              (item) => `
              <section class="card">
                  <section class="card-front"></section>
                  <section class="card-back">${item}</section>
              </section>
          `
            )
            .join("")}
     </section>
  `;

  const parser = new DOMParser().parseFromString(cards, "text/html");

  selectors.board.replaceWith(parser.querySelector(".board"));
  const scoreElement = document.createElement("section");
  scoreElement.classList.add("score");
  selectors.boardContainer.appendChild(scoreElement);
};

const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add("disabled");

  state.loop = setInterval(() => {
    state.totalTime++;

    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    updateScore();
  }, 1000);
};

const flipBackCards = () => {
  document.querySelectorAll(".card:not(.matched)").forEach((card) => {
    card.classList.remove("flipped");
  });

  state.flippedCards = 0;
};

const flipCard = (card) => {
  state.flippedCards++;
  state.totalFlips++;

  if (!state.gameStarted) {
    startGame();
  }

  if (state.flippedCards <= 2) {
    card.classList.add("flipped");
  }

  if (state.flippedCards === 2) {
    const flippedCards = document.querySelectorAll(".flipped:not(.matched)");

    if (flippedCards[0].innerText === flippedCards[1].innerText) {
      flippedCards[0].classList.add("matched");
      flippedCards[1].classList.add("matched");
    }

    setTimeout(() => {
      flipBackCards();
    }, 1000);
  }
  if (!document.querySelectorAll(".card:not(.flipped)").length) {
    setTimeout(async () => {
      selectors.boardContainer.classList.add("flipped");
      selectors.win.innerHTML = `
              <span class="win-text">
                  You won!<br />
                  with <span class="highlight">${state.totalFlips}</span> moves<br />
                  and a score of <span class="highlight">${state.score}</span>!!!
              </span>
          `;

      clearInterval(state.loop);
          try{
           // Call the API to insert user and score into the database
           const response =await fetch("http://localhost:3000/score", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              email: state.user,
              score: state.score,
            }),
          });

          const result = await response.text();
          alert(result);
          console.log(result);

        } catch (error) {
          console.error("An error occurred:", error);
        }
    }, 1000);
  }
};

const attachEventListeners = () => {
  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParent = eventTarget.parentElement;

    if (
      eventTarget.className.includes("card") &&
      !eventParent.className.includes("flipped")
    ) {
      flipCard(eventParent);
    } else if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });
};

const scores = () => {
  window.location.href = '../pages/leaderBoard.html';};
generateGame();
console.log(state.user)
attachEventListeners();
