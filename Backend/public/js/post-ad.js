// ================= GLOBAL IMAGE STORE =================
let selectedImages = [];

// ================= IMAGE INPUT =================
const imageInput = document.getElementById("images");
const previewBox = document.getElementById("imagePreview");

// ================= IMAGE SELECT (ONE BY ONE FIX) =================
imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files);

  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    selectedImages.push(file);

    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "90px";
      img.style.margin = "5px";
      img.style.borderRadius = "6px";
      previewBox.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // 🔴 IMPORTANT: reset input so next time single image bhi add ho
  imageInput.value = "";
});

// ================= FORM SUBMIT =================
document.getElementById("postAdForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (selectedImages.length < 3) {
    alert("Minimum 3 images required");
    return;
  }

  const formData = new FormData();

  // TEXT FIELDS
  document.querySelectorAll("#postAdForm input, #postAdForm select, #postAdForm textarea")
    .forEach(el => {
      if (el.name && el.type !== "file") {
        formData.append(el.name, el.value);
      }
    });

  // IMAGES (ACCUMULATED)
  selectedImages.forEach(img => {
  formData.append("images[]", img);
});

  try {
    const res = await fetch("http://localhost:5000/ads", {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = await res.json();

    if (!data.success) {
      alert("Failed to post ad");
      return;
    }

    alert("✅ Ad Posted Successfully");
    window.location.reload();

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});