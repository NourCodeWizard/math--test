// Elements
const idInput = document.getElementById("id");
const nextBtn = document.getElementById("nextBtn");
const formSection = document.getElementById("formSection");
const testSection = document.getElementById("testSection");
const teacherSection = document.getElementById("teacherSection");
const questionsContainer = document.getElementById("questionsContainer");
const backBtn = document.getElementById("backBtn");
const submitBtn = document.getElementById("submitBtn");
const downloadBtn = document.getElementById("downloadBtn");
const teacherIdInput = document.getElementById("teacherId");
const showTeacherDashboardBtn = document.getElementById("showTeacherDashboard");


// Show "Next" button when ID is entered
idInput.addEventListener("input", () => {
    nextBtn.style.display = idInput.value.trim() !== "" ? "block" : "none";
});

// Prevent resubmission
function isTestSubmitted(id) {
    return localStorage.getItem(`submitted_${id}`) === "true";
}

// Generate random choices and shuffle
function generateChoices(correctAnswer) {
    const choices = new Set();
    choices.add(correctAnswer);

    while (choices.size < 4) {
        const randomX = Math.floor(Math.random() * 10);
        const randomResult = randomX + 5;
        choices.add(randomResult);
    }

    return Array.from(choices).sort(() => Math.random() - 0.5);
}

// Move to test section
nextBtn.addEventListener("click", () => {
    const idValue = idInput.value.trim();
    if (idValue === "" || isNaN(idValue)) {
        alert("Please enter a valid ID.");
        return;
    }

    if (isTestSubmitted(idValue)) {
        alert("You have already submitted the test. You cannot retake it.");
        return;
    }

    const lastDigit = parseInt(idValue.slice(-1));
    const correctAnswer = lastDigit + 5;
    const choices = generateChoices(correctAnswer);

    formSection.style.display = "none";
    testSection.style.display = "block";

    questionsContainer.innerHTML = `
        <p>What is the result for x + 5?</p>
        ${choices
            .map(
                (choice, index) =>
                    `<label><input type="radio" name="mainQuestion" value="${choice}" data-correct="${choice === correctAnswer}"> ${index + 1}) ${choice}</label><br>`
            )
            .join("")}
    `;
});

// Back button functionality
backBtn.addEventListener("click", () => {
    testSection.style.display = "none";
    formSection.style.display = "block";
});

// Submit button
submitBtn.addEventListener("click", () => {
    const selectedAnswer = document.querySelector("input[name='mainQuestion']:checked");
    if (!selectedAnswer) {
        alert("Please select an answer.");
        return;
    }

    const name = document.getElementById("name").value;
    const id = idInput.value.trim();
    const isCorrect = selectedAnswer.getAttribute("data-correct") === "true";

    if (!name || !id) {
        alert("Please ensure all fields are filled out.");
        return;
    }

    const score = isCorrect ? 1 : 0;
    const newEntry = [id, score];
    let data = [["ID", "Score"]];

    const existingData = localStorage.getItem("excelData");
    if (existingData) {
        const workbook = XLSX.read(existingData, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    data.push(newEntry);

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    localStorage.setItem("excelData", excelData);

    // Mark test as submitted
    localStorage.setItem(`submitted_${id}`, "true");

    alert(`Test submitted! Your score is: ${score}`);
    location.reload();
});



// Show the teacher section when clicking "Access Teacher's Dashboard"
showTeacherDashboardBtn.addEventListener("click", () => {
    teacherSection.style.display = "block"; // Show the teacher dashboard
    teacherIdInput.value = ""; // Clear any previous input
});

// Handle Teacher ID validation and display download button
teacherIdInput.addEventListener("input", () => {
    if (teacherIdInput.value === "12345") {
        downloadBtn.style.display = "inline-block"; // Show the download button
    } else {
        downloadBtn.style.display = "none"; // Hide the button if ID is invalid
    }
});

// Download results functionality
downloadBtn.addEventListener("click", () => {
    if (teacherIdInput.value !== "12345") {
        alert("Invalid Teacher ID."); // Safety check
        return;
    }

    const existingData = localStorage.getItem("excelData");
    if (existingData) {
        // Convert stored data to Excel format
        const workbook = XLSX.read(existingData, { type: "binary" });
        XLSX.writeFile(workbook, "TestResults.xlsx"); // Trigger download
        alert("File downloaded successfully!");
    } else {
        alert("No results to download.");
    }
});


// Anti-tampering mechanism
// document.addEventListener("contextmenu", (e) => e.preventDefault());
// document.addEventListener("keydown", (e) => {
//     if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
//         e.preventDefault();
//     }
// });
function detectDevTools() {
    const threshold = 160; // Adjust for sensitivity
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        alert("Developer tools are not allowed!");
        window.location.href = "about:blank"; // Redirect or close the tab
    }
}

// Check periodically
setInterval(detectDevTools, 1000);
