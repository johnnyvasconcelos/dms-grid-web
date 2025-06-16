let gridSize = 12;
const grid = document.getElementById("grid");
let draggedToken = null;

const tokenSources = [
  "assets/token-1.png",
  "assets/token-2.png",
  "assets/token-3.png",
  "assets/token-4.png",
];

function createToken(src) {
  const token = document.createElement("img");
  token.src = src;
  token.classList.add("token");
  token.setAttribute("draggable", "true");

  token.addEventListener("dragstart", (e) => {
    draggedToken = e.target;
    setTimeout(() => (draggedToken.style.display = "none"), 0);
  });

  token.addEventListener("dragend", () => {
    draggedToken.style.display = "block";
    draggedToken = null;
  });

  return token;
}

function createGrid(savedTokenPositions = []) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    cell.addEventListener("dragover", (e) => {
      if (!cell.querySelector(".token")) e.preventDefault();
    });

    cell.addEventListener("drop", () => {
      if (draggedToken && !cell.querySelector(".token")) {
        cell.appendChild(draggedToken);
      }
    });

    grid.appendChild(cell);
    cell.addEventListener("dblclick", () => {
      let overlay = cell.querySelector(".cell-overlay");
      if (overlay) {
        overlay.remove(); // Toggle OFF
      } else {
        overlay = document.createElement("div");
        overlay.classList.add("cell-overlay");
        cell.appendChild(overlay); // Toggle ON
      }
    });
  }

  if (savedTokenPositions.length > 0) {
    savedTokenPositions.forEach(({ src, position }) => {
      if (position < grid.children.length) {
        const token = createToken(src);
        grid.children[position].appendChild(token);
      }
    });
  } else {
    tokenSources.forEach((src) => {
      const token = createToken(src);
      const emptyCell = Array.from(grid.children).find(
        (cell) => !cell.hasChildNodes()
      );
      if (emptyCell) emptyCell.appendChild(token);
    });
  }
}

function changeGridSize(delta) {
  const tokenPositions = [];
  const cells = Array.from(grid.children);

  cells.forEach((cell, index) => {
    const token = cell.querySelector(".token");
    if (token) {
      tokenPositions.push({ src: token.src, position: index });
    }
  });

  gridSize = Math.max(2, Math.min(16, gridSize + delta));

  createGrid(tokenPositions);
}

grid.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.touches[0];
    const touchedElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    if (touchedElement && touchedElement.classList.contains("token")) {
      draggedToken = touchedElement;
    }
  },
  { passive: false }
);

grid.addEventListener("touchend", (e) => {
  if (!draggedToken) return;

  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);

  if (
    target &&
    target.classList.contains("cell") &&
    !target.querySelector(".token")
  ) {
    animateTokenMove(draggedToken, target);
  }

  draggedToken = null;
});
function animateTokenMove(token, targetCell) {
  const startRect = token.getBoundingClientRect();
  const endRect = targetCell.getBoundingClientRect();

  const deltaX = endRect.left - startRect.left;
  const deltaY = endRect.top - startRect.top;

  const clone = token.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = startRect.left + "px";
  clone.style.top = startRect.top + "px";
  clone.style.width = startRect.width + "px";
  clone.style.height = startRect.height + "px";
  clone.style.transition = "transform 0.3s ease";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);

  token.style.visibility = "hidden";

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
      targetCell.appendChild(token);
      token.style.visibility = "visible";
      document.body.removeChild(clone);
    }, 300);
  });
}
createGrid();
