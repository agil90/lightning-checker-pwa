// =========================================
// Lightning Multi Address Checker
// app.js v1.1 Final
// =========================================

// ===== ELEMENT =====

const addressInput = document.getElementById("addressInput");
const fileInput = document.getElementById("fileInput");

const uploadBtn = document.getElementById("uploadBtn");
const startBtn = document.getElementById("startBtn");
const exportBtn = document.getElementById("exportBtn");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const totalWallet = document.getElementById("totalWallet");
const checkedWallet = document.getElementById("checkedWallet");
const activeWallet = document.getElementById("activeWallet");
const usdTotal = document.getElementById("usdTotal");

const resultContainer =
document.getElementById("resultContainer");

// ===============================

let results = [];

// ===============================
// Event
// ===============================

uploadBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", loadTxtFile);

startBtn.addEventListener("click", startChecking);

exportBtn.addEventListener("click", () => {

    if(results.length===0){

        alert("Belum ada data.");

        return;

    }

    exportCSV(results);

});

// ===============================
// Load TXT
// ===============================

function loadTxtFile(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        addressInput.value = e.target.result;

    }

    reader.readAsText(file);

}

// ===============================
// Reset Dashboard
// ===============================

function resetDashboard(){

    results=[];

    resultContainer.innerHTML="";

    totalWallet.textContent="0";

    checkedWallet.textContent="0";

    activeWallet.textContent="0";

    usdTotal.textContent="$0.00";

    progressBar.style.width="0%";

    progressText.textContent="0 / 0";

    exportBtn.disabled=true;

}
// ===============================
// Start Checking
// ===============================

async function startChecking() {

    resetDashboard();

    const addresses = addressInput.value
        .split("\n")
        .map(a => a.trim())
        .filter(a => a.length > 0);

    if (addresses.length === 0) {

        alert("Masukkan minimal satu Spark Address.");

        return;

    }

    totalWallet.textContent = addresses.length;

    let checked = 0;
    let active = 0;
    let totalUsd = 0;

    startBtn.disabled = true;

    for (const address of addresses) {

        progressText.textContent =
            `Checking ${checked + 1} / ${addresses.length}`;

        try {

            const result = await checkAddress(address);

            checked++;

            if (result.success) {

                results.push(result);

                if (result.status === "ACTIVE") {

                    active++;

                }

                totalUsd += Number(result.usd);

                addRow(result);

            } else {

                addErrorRow(address);

            }

        } catch (err) {

            console.error(err);

            checked++;

            addErrorRow(address);

        }

        checkedWallet.textContent = checked;

        activeWallet.textContent = active;

        usdTotal.textContent =
            "$" + totalUsd.toFixed(2);

        const percent =
            (checked / addresses.length) * 100;

        progressBar.style.width =
            percent + "%";

        progressText.textContent =
            checked + " / " + addresses.length;

    }

    exportBtn.disabled = false;

    startBtn.disabled = false;

}
// ===============================
// Wallet Card
// ===============================
function timeAgo(dateString) {

    if (!dateString) return "No transactions";

    const now = new Date();
    const date = new Date(dateString);

    const seconds = Math.floor((now - date) / 1000);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";

    if (minutes < 60)
        return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";

    if (hours < 24)
        return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

    if (days < 30)
        return days + " day" + (days > 1 ? "s" : "") + " ago";

    return date.toLocaleDateString();

}
function addRow(item) {const number = results.length;

    const card = document.createElement("div");

    let statusClass = "empty";
    let statusIcon = "🟡";

    if (item.status === "ACTIVE") {

        statusClass = "active";
        statusIcon = "🟢";

    } else if (item.status === "ERROR") {

        statusClass = "error";
        statusIcon = "🔴";

    }

    const lastActivity = timeAgo(item.lastActivity);

    card.className = "wallet-card";

    card.innerHTML = `

<div class="wallet-header">

    <div class="wallet-status ${statusClass}">
        ${number}. ${statusIcon} ${item.status}
    </div>

</div>

<div class="wallet-address">

${item.address.length > 40
    ? item.address.substring(0, 40) + "..."
    : item.address}

</div>

<div class="wallet-grid">

    <div class="wallet-item">

        <span>💵 USD</span>

        <strong>$${Number(item.usd).toFixed(2)}</strong>

    </div>

    <div class="wallet-item">

        <span>🕒 Last Activity</span>

        <strong>${lastActivity}</strong>

    </div>

</div>

`;

    resultContainer.appendChild(card);

}

// ===============================
// Error Card
// ===============================

function addErrorRow(address){

    const card = document.createElement("div");

    card.className = "wallet-card";

    card.innerHTML = `

<div class="wallet-header">

    <div class="wallet-status error">

        🔴 ERROR

    </div>

</div>

<div class="wallet-address">

${address}

</div>

<div class="wallet-grid">

    <div class="wallet-item">

        <span>Status</span>

        <strong>API Error</strong>

    </div>

</div>

`;

    resultContainer.appendChild(card);

}