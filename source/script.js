// ============================================
// CV INTERAKTIF - SCRIPT UTAMA
// ============================================

// Palet warna untuk profil
const colorPalette = [
  { name: "Biru Dongker", value: "#1E3A5F" },
  { name: "Biru Terang", value: "#2E5E8C" },
  { name: "Kelabu Gelap", value: "#34495E" },
  { name: "Biru Tosca", value: "#16A085" },
  { name: "Ungu", value: "#7D3C98" },
  { name: "Merah Maroon", value: "#C0392B" },
  { name: "Hijau Tua", value: "#27AE60" },
  { name: "Oranye", value: "#E67E22" },
  { name: "Biru Laut", value: "#2980B9" },
];

// ============================================
// INISIALISASI SAAT DOM SIAP
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  setupCollapseButtons();
  setupColorPicker();
  setupPrintButton();
  setupCopyable();
});

// ============================================
// FUNGSI COLLAPSE/EXPAND SECTIONS
// ============================================
function setupCollapseButtons() {
  const collapseButtons = document.querySelectorAll(".btn-collapse");

  collapseButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Cari content terdekat
      const content = this.closest(".bagian").querySelector(".bagian-content");

      // Toggle class
      this.classList.toggle("collapsed");
      content.classList.toggle("collapsed");
    });
  });
}

// ============================================
// FUNGSI UBAH WARNA PROFIL
// ============================================
function setupColorPicker() {
  const btnWarna = document.getElementById("btnWarna");

  btnWarna.addEventListener("click", function () {
    showColorPickerDialog();
  });
}

function showColorPickerDialog() {
  // Buat overlay
  const overlay = document.createElement("div");
  overlay.className = "dialog-overlay";
  overlay.addEventListener("click", closeColorPickerDialog);

  // Buat dialog
  const dialog = document.createElement("div");
  dialog.className = "color-picker-dialog";

  // Header
  let dialogHTML = '<div class="dialog-content"><h3>Pilih Warna Profil</h3>';

  // Color Grid
  dialogHTML += '<div class="color-grid">';
  const currentColor = getCSSVariable("--warna-primer");

  colorPalette.forEach((color, index) => {
    const isSelected = color.value === currentColor ? "selected" : "";
    dialogHTML += `
            <div class="color-option ${isSelected}" 
                 style="background-color: ${color.value};" 
                 data-color="${color.value}" 
                 title="${color.name}"
                 onclick="selectColor('${color.value}')">
            </div>
        `;
  });

  dialogHTML += "</div>";

  // Buttons
  dialogHTML += `
        <div class="dialog-buttons">
            <button class="btn-cancel" onclick="closeColorPickerDialog()">Batal</button>
            <button class="btn-confirm" onclick="applySelectedColor()">Terapkan</button>
        </div>
        </div>
    `;

  dialog.innerHTML = dialogHTML;

  // Append ke body
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);

  // Simpan reference global
  window.currentColorDialog = { overlay, dialog };
}

function selectColor(colorValue) {
  // Hapus seleksi sebelumnya
  document.querySelectorAll(".color-option").forEach((el) => {
    el.classList.remove("selected");
  });

  // Tandai yang baru dipilih
  document
    .querySelector(`[data-color="${colorValue}"]`)
    .classList.add("selected");

  // Simpan pilihan
  window.selectedColor = colorValue;
}

function applySelectedColor() {
  if (!window.selectedColor) return;

  const header = document.getElementById("header");
  header.style.backgroundColor = window.selectedColor;

  // Juga ubah CSS variable untuk konsistensi
  document.documentElement.style.setProperty(
    "--warna-primer",
    window.selectedColor,
  );

  // Update button color di toolbar
  document.querySelectorAll(".toolbar button, .btn-collapse").forEach((btn) => {
    btn.style.backgroundColor = window.selectedColor;
  });

  // Close dialog
  closeColorPickerDialog();

  // Simpan ke localStorage
  localStorage.setItem("cvProfileColor", window.selectedColor);

  // Tampilkan notifikasi
  showToast("Warna profil berhasil diubah!");
}

function closeColorPickerDialog() {
  if (window.currentColorDialog) {
    window.currentColorDialog.overlay.remove();
    window.currentColorDialog.dialog.remove();
    window.currentColorDialog = null;
  }
}

// ============================================
// FUNGSI PRINT CV
// ============================================
function setupPrintButton() {
  const btnPrint = document.getElementById("btnPrint");

  btnPrint.addEventListener("click", function () {
    // Simpan state collapsed sections
    const collapsedSections = [];
    document.querySelectorAll(".btn-collapse.collapsed").forEach((btn) => {
      collapsedSections.push(btn.closest(".bagian"));
    });

    // Buka semua sections untuk print
    collapsedSections.forEach((section) => {
      const btn = section.querySelector(".btn-collapse");
      const content = section.querySelector(".bagian-content");
      btn.classList.remove("collapsed");
      content.classList.remove("collapsed");
    });

    // Hide toolbar saat print
    const toolbar = document.querySelector(".toolbar");
    const toolbarDisplay = window.getComputedStyle(toolbar).display;
    toolbar.style.display = "none";

    // Print
    window.print();

    // Restore toolbar
    toolbar.style.display = toolbarDisplay;

    // Restore collapsed sections
    collapsedSections.forEach((section) => {
      const btn = section.querySelector(".btn-collapse");
      const content = section.querySelector(".bagian-content");
      btn.classList.add("collapsed");
      content.classList.add("collapsed");
    });
  });
}

// ============================================
// FUNGSI COPY TELEPON DAN EMAIL
// ============================================
function setupCopyable() {
  const copyableElements = document.querySelectorAll(".copyable");

  copyableElements.forEach((element) => {
    element.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      let textToCopy = "";

      if (type === "phone") {
        textToCopy = "+62-851-4326-8748";
      } else if (type === "email") {
        textToCopy = "muhamad.10111033@student.polsub.ac.id";
      }

      if (textToCopy) {
        copyToClipboard(textToCopy, type);
      }
    });
  });
}

function copyToClipboard(text, type) {
  // Gunakan Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Tampilkan animasi
        showCopyAnimation(type);

        // Tampilkan notifikasi
        const label = type === "phone" ? "Nomor Telepon" : "Email";
        showToast(`${label} berhasil disalin!`);
      })
      .catch(() => {
        // Fallback untuk browser lama
        fallbackCopyToClipboard(text, type);
      });
  } else {
    fallbackCopyToClipboard(text, type);
  }
}

function fallbackCopyToClipboard(text, type) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    showCopyAnimation(type);
    const label = type === "phone" ? "Nomor Telepon" : "Email";
    showToast(`${label} berhasil disalin!`);
  } catch (err) {
    showToast("Gagal menyalin teks", "error");
  }

  document.body.removeChild(textArea);
}

function showCopyAnimation(type) {
  const element = document.querySelector(`[data-type="${type}"]`);
  element.classList.add("copied");

  // Reset animation setelah selesai
  setTimeout(() => {
    element.classList.remove("copied");
  }, 600);
}

// ============================================
// FUNGSI TOAST NOTIFICATION
// ============================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  if (type === "error") {
    toast.style.background = "#f44336";
  }

  document.body.appendChild(toast);

  // Hapus setelah 3 detik
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// FUNGSI UTILITY
// ============================================
function getCSSVariable(variableName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

// ============================================
// LOAD SAVED COLOR DARI LOCALSTORAGE
// ============================================
window.addEventListener("load", function () {
  const savedColor = localStorage.getItem("cvProfileColor");
  if (savedColor) {
    // Apply warna yang tersimpan
    const header = document.getElementById("header");
    header.style.backgroundColor = savedColor;
    document.documentElement.style.setProperty("--warna-primer", savedColor);

    // Update toolbar dan buttons
    document
      .querySelectorAll(".toolbar button, .btn-collapse")
      .forEach((btn) => {
        btn.style.backgroundColor = savedColor;
      });
  }
});

// ============================================
// RESPONSIVE TOOLBAR
// ============================================
if (window.innerWidth < 600) {
  const toolbar = document.querySelector(".toolbar");
  if (toolbar) {
    toolbar.style.flexDirection = "column";
  }
}

window.addEventListener("resize", () => {
  const toolbar = document.querySelector(".toolbar");
  if (window.innerWidth < 600) {
    toolbar.style.flexDirection = "column";
  } else {
    toolbar.style.flexDirection = "row";
  }
});
