document.addEventListener("DOMContentLoaded", () => {
    const namaInput = document.getElementById("nama");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const whatsappInput = document.getElementById("whatsapp");
    const imageInput = document.getElementById("image");
    const imagePreview = document.getElementById("imagePreview");
    const faceCanvas = document.getElementById("faceCanvas");
    const registerBtn = document.getElementById("registerBtn");
    const faceValidation = document.getElementById("faceValidation");

    namaInput.addEventListener("input", () => {
        namaInput.value = namaInput.value.replace(/[^a-zA-Z\s]/g, '');
        namaInput.value = namaInput.value
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    });

    usernameInput.addEventListener("input", () => {
        usernameInput.value = usernameInput.value.toLowerCase().replace(/[^a-z0-9]/g, "");
    });

    passwordInput.addEventListener("input", () => {
        const value = passwordInput.value;
        const isValid = /[a-z]/.test(value) &&
                        /[A-Z]/.test(value) &&
                        /[0-9]/.test(value) &&
                        /[^a-zA-Z0-9]/.test(value);
        passwordInput.setCustomValidity(isValid ? "" : "Password harus ada huruf besar, kecil, angka, dan simbol.");
    });

    togglePassword.addEventListener("change", () => {
        passwordInput.type = togglePassword.checked ? "text" : "password";
    });

    whatsappInput.addEventListener("input", () => {
        whatsappInput.value = whatsappInput.value.replace(/^0/, "62").replace(/[^0-9]/g, "");
    });

    imageInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.includes("jpeg")) {
                faceValidation.textContent = "Hanya file JPG yang diperbolehkan!";
                return;
            }

            if (file.size < 50000 || file.size > 500000) {
                faceValidation.textContent = "Ukuran file harus antara 50KB - 500KB!";
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove("hidden");

                await detectFace(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    async function detectFace(imageSrc) {
        const img = new Image();
        img.src = imageSrc;

        img.onload = async () => {
            const model = await blazeface.load();
            const canvas = faceCanvas;
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const predictions = await model.estimateFaces(canvas, false);

            if (predictions.length > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                predictions.forEach((prediction) => {
                    const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight);
                    const confidence = (prediction.probability * 100).toFixed(2);

                    ctx.strokeStyle = "green";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, width - x, height - y);
                    ctx.fillStyle = "green";
                    ctx.font = "50px Arial";  
                    ctx.fillText(`Confidence: ${confidence}%`, x, y - 10);
                });

                faceCanvas.classList.remove("hidden");
                faceValidation.textContent = `✅ Muka terdeteksi!`;
                registerBtn.disabled = false;
            } else {
                faceValidation.textContent = "❌ Muka tidak terdeteksi!";
                registerBtn.disabled = true;
            }
        };
    }
});
