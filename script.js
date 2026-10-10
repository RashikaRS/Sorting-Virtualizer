const barsContainer = document.getElementById("barsContainer");
const algoSelect = document.getElementById("algoSelect");
const sizeRange = document.getElementById("sizeRange");
const speedRange = document.getElementById("speedRange");
const sizeValue = document.getElementById("sizeValue");
const generateBtn = document.getElementById("generateBtn");
const sortBtn = document.getElementById("sortBtn");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const statusText = document.getElementById("statusText");

let array = [];
let bars = [];
let comparisons = 0;
let swaps = 0;
let sorting = false;

function generateArray() {
  const size = parseInt(sizeRange.value, 10);
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 300) + 10);
  renderBars();
  resetStats();
  statusText.textContent = "Ready";
}

function renderBars() {
  barsContainer.innerHTML = "";
  bars = array.map((val) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = val + "px";
    barsContainer.appendChild(bar);
    return bar;
  });
}

function resetStats() {
  comparisons = 0;
  swaps = 0;
  comparisonsEl.textContent = "0";
  swapsEl.textContent = "0";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelay() {
  // Higher speed value = faster = shorter delay
  const speed = parseInt(speedRange.value, 10);
  return 210 - speed * 2;
}

async function markCompare(i, j) {
  comparisons++;
  comparisonsEl.textContent = comparisons;
  bars[i].classList.add("comparing");
  bars[j].classList.add("comparing");
  await sleep(getDelay());
  bars[i].classList.remove("comparing");
  bars[j].classList.remove("comparing");
}

async function markSwap(i, j) {
  swaps++;
  swapsEl.textContent = swaps;
  bars[i].classList.add("swapping");
  bars[j].classList.add("swapping");
  [array[i], array[j]] = [array[j], array[i]];
  bars[i].style.height = array[i] + "px";
  bars[j].style.height = array[j] + "px";
  await sleep(getDelay());
  bars[i].classList.remove("swapping");
  bars[j].classList.remove("swapping");
}

async function overwrite(i, value) {
  bars[i].classList.add("swapping");
  array[i] = value;
  bars[i].style.height = value + "px";
  await sleep(getDelay());
  bars[i].classList.remove("swapping");
}

function markSorted() {
  bars.forEach((bar) => bar.classList.add("sorted"));
}

// ---------- ALGORITHMS ----------

async function bubbleSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      await markCompare(j, j + 1);
      if (array[j] > array[j + 1]) {
        await markSwap(j, j + 1);
      }
    }
    bars[n - i - 1].classList.add("sorted");
  }
  bars[0].classList.add("sorted");
}

async function selectionSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      await markCompare(minIdx, j);
      if (array[j] < array[minIdx]) minIdx = j;
    }
    if (minIdx !== i) await markSwap(i, minIdx);
    bars[i].classList.add("sorted");
  }
  bars[n - 1].classList.add("sorted");
}

async function insertionSort() {
  const n = array.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      await markCompare(j - 1, j);
      if (array[j - 1] > array[j]) {
        await markSwap(j - 1, j);
        j--;
      } else {
        break;
      }
    }
  }
  markSorted();
}

async function quickSort(low = 0, high = array.length - 1) {
  if (low < high) {
    const pivotIdx = await partition(low, high);
    await quickSort(low, pivotIdx - 1);
    await quickSort(pivotIdx + 1, high);
  }
  if (low === 0 && high === array.length - 1) markSorted();
}

async function partition(low, high) {
  const pivot = array[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    await markCompare(j, high);
    if (array[j] < pivot) {
      i++;
      if (i !== j) await markSwap(i, j);
    }
  }
  if (i + 1 !== high) await markSwap(i + 1, high);
  return i + 1;
}

async function mergeSort(start = 0, end = array.length - 1) {
  if (start >= end) return;
  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid + 1, end);
  await merge(start, mid, end);
  if (start === 0 && end === array.length - 1) markSorted();
}

async function merge(start, mid, end) {
  const left = array.slice(start, mid + 1);
  const right = array.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;

  while (i < left.length && j < right.length) {
    comparisons++;
    comparisonsEl.textContent = comparisons;
    if (left[i] <= right[j]) {
      await overwrite(k, left[i]);
      i++;
    } else {
      await overwrite(k, right[j]);
      j++;
    }
    k++;
  }
  while (i < left.length) {
    await overwrite(k, left[i]);
    i++; k++;
  }
  while (j < right.length) {
    await overwrite(k, right[j]);
    j++; k++;
  }
}

const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  quick: () => quickSort(),
  merge: () => mergeSort(),
};

async function startSort() {
  if (sorting) return;
  sorting = true;
  toggleControls(true);
  statusText.textContent = "Sorting...";
  resetStats();

  const algo = algorithms[algoSelect.value];
  await algo();

  statusText.textContent = "Sorted!";
  sorting = false;
  toggleControls(false);
}

function toggleControls(disabled) {
  generateBtn.disabled = disabled;
  sortBtn.disabled = disabled;
  algoSelect.disabled = disabled;
  sizeRange.disabled = disabled;
}

sizeRange.addEventListener("input", () => {
  sizeValue.textContent = sizeRange.value;
  if (!sorting) generateArray();
});

generateBtn.addEventListener("click", () => {
  if (!sorting) generateArray();
});

sortBtn.addEventListener("click", startSort);

generateArray();
