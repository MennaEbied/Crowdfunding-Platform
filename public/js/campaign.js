function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

document
  .getElementById("campaign-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return alert("Please login first");
    const deadlineInput = document.getElementById("deadline").value;
    const today = new Date().toISOString().split("T")[0];

    if (deadlineInput < today) {
      return alert(
        "The deadline cannot be in the past. Please choose today or a future date.",
      );
    }

    const imageInput = document.getElementById("image");
    if (!imageInput.files.length) return alert("Please upload an image");

    try {
      const imageBase64 = await fileToBase64(imageInput.files[0]);
      const newCampaign = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        goal: Number(document.getElementById("goal").value),
        deadline: document.getElementById("deadline").value,
        image: imageBase64,
        creatorId: user.id,
        isApproved: false,
        currentAmount: 0,
      };

      const res = await fetch("http://localhost:3000/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });

      if (res.ok) {
        alert("Campaign submitted for approval!");
        window.location.href = "profile.html";
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  });
