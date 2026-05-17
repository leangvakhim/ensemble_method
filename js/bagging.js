// Data representation for the original dataset
const dataPoints = [
    { id: 'S1', color: 'bg-rose-500', label: 'Student 1' },
    { id: 'S2', color: 'bg-blue-500', label: 'Student 2' },
    { id: 'S3', color: 'bg-emerald-500', label: 'Student 3' },
    { id: 'S4', color: 'bg-amber-500', label: 'Student 4' },
    { id: 'S5', color: 'bg-purple-500', label: 'Student 5' }
];

// Helper to generate a colored circle HTML
const renderPoint = (point, extraClass = '', sizeClass = 'w-12 h-12 text-sm') => `
    <div class="${sizeClass} shrink-0 rounded-full ${point.color} text-white font-bold flex items-center justify-center shadow-sm border-2 border-white ${extraClass}" title="${point.label}">
        ${point.id}
    </div>
`;

// Helper to render a tree model
const renderTree = (num, prediction, colorClass) => `
    <div class="bg-white border-2 border-slate-200 p-3 sm:p-4 rounded-xl text-center shadow-sm flex flex-col items-center w-full max-w-[120px]">
        <div class="text-3xl mb-1">🌳</div>
        <div class="text-xs font-bold text-slate-400 mb-2">Model ${num}</div>
        <div class="text-xs text-slate-500 mb-1">Predicts:</div>
        <div class="font-bold text-lg ${colorClass}">${prediction}</div>
    </div>
`;

const steps = [
    {
        title: "1. The Original Dataset",
        description: "We start with a single dataset of 5 students. Our goal is to train a robust ensemble model. A single complex model might overfit this small amount of data.",
        render: () => `
            <div class="flex flex-col items-center w-full max-w-lg">
                <div class="bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-xl w-full flex justify-center gap-4 shadow-inner">
                    ${dataPoints.map(p => renderPoint(p)).join('')}
                </div>
                <div class="mt-4 text-center text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                    Dataset D (Size N = 5 Students)
                </div>
            </div>
        `
    },
    {
        title: "2. Bootstrapping (Sampling with Replacement)",
        description: "We create <b>B = 3</b> new subsets of the same size by randomly sampling from the students <i>with replacement</i>. <br><br>Notice how some students appear multiple times, while others are left out entirely (Out-Of-Bag samples).",
        render: () => {
            const subset1 = ['S1', 'S3', 'S3', 'S4', 'S5'];
            const subset2 = ['S2', 'S2', 'S4', 'S5', 'S5'];
            const subset3 = ['S1', 'S2', 'S3', 'S4', 'S4'];

            const renderSubset = (title, ids) => `
                <div class="flex flex-col items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm w-full max-w-[280px]">
                    <h3 class="text-sm font-bold text-slate-700 mb-3 text-center">${title}</h3>
                    <div class="flex gap-2 flex-wrap justify-center">
                        ${ids.map(id => {
                const point = dataPoints.find(p => p.id === id);
                const count = ids.filter(i => i === id).length;
                const extraClass = count > 1 ? 'ring-4 ring-indigo-200' : '';
                return renderPoint(point, extraClass, 'w-10 h-10 text-xs');
            }).join('')}
                    </div>
                </div>
            `;

            return `
                <div class="flex flex-row flex-wrap gap-4 md:gap-6 w-full justify-center">
                    ${renderSubset("Bootstrap Sample 1 (D₁)", subset1)}
                    ${renderSubset("Bootstrap Sample 2 (D₂)", subset2)}
                    ${renderSubset("Bootstrap Sample 3 (D₃)", subset3)}
                </div>
                <p class="mt-6 text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-center">
                    Highlighted circles indicate data points that were sampled multiple times!
                </p>
            `;
        }
    },
    {
        title: "3. Training Base Models",
        description: "Next, we train a separate, independent base model (like a Decision Tree) on <b>each</b> of the Bootstrap samples. Because each sample contains different data, each model learns different patterns.",
        render: () => `
            <div class="flex w-full max-w-3xl justify-between items-center px-4">
                <div class="flex flex-col gap-6">
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₁</div>
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₂</div>
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₃</div>
                </div>
                <div class="flex flex-col gap-10 text-indigo-400 font-bold text-xl">
                    <div>&rarr; trains &rarr;</div>
                    <div>&rarr; trains &rarr;</div>
                    <div>&rarr; trains &rarr;</div>
                </div>
                <div class="flex flex-col gap-4">
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 1 (h₁)</span>
                    </div>
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 2 (h₂)</span>
                    </div>
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 3 (h₃)</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "4. Aggregation: Classification (Pass/Fail)",
        description: "Let's predict if a new student will Pass or Fail. We pass the student's data through all models. Since this is Classification (categories), we use <b>Majority Voting (Mode)</b>.",
        render: () => `
            <div class="flex flex-col items-center w-full max-w-4xl">
                <div class="bg-indigo-100 text-indigo-800 font-bold px-6 py-3 rounded-full shadow-sm mb-6 flex items-center gap-2 border border-indigo-200">
                    <span>New Student Data (X)</span>
                </div>

                <div class="flex w-full justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
                    ${renderTree(1, "Pass", "text-emerald-600")}
                    ${renderTree(2, "Fail", "text-rose-600")}
                    ${renderTree(3, "Pass", "text-emerald-600")}
                    ${renderTree(4, "Pass", "text-emerald-600")}
                    ${renderTree(5, "Fail", "text-rose-600")}
                </div>

                <div class="flex flex-col items-center bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl w-full max-w-lg">
                    <div class="font-bold text-slate-700 mb-2">Aggregation Unit (Majority Vote)</div>
                    <div class="flex gap-4 items-center mb-4">
                        <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded font-semibold text-sm">Pass (3 votes)</span>
                        <span class="text-slate-400 text-sm">vs</span>
                        <span class="bg-rose-100 text-rose-800 px-3 py-1 rounded font-semibold text-sm">Fail (2 votes)</span>
                    </div>
                    <div class="w-full h-px bg-slate-300 mb-4"></div>
                    <div class="text-xl font-bold text-indigo-700 flex items-center gap-2">
                        Final Output: <span class="bg-indigo-600 text-white px-4 py-1 rounded-lg">Pass</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "5. Aggregation: Regression (Exam Score)",
        description: "Now let's predict the student's exact exam score out of 100. Since this is Regression (continuous numbers), we take the <b>Mathematical Average (Mean)</b> of the predictions.",
        render: () => `
            <div class="flex flex-col items-center w-full max-w-4xl">
                <div class="bg-indigo-100 text-indigo-800 font-bold px-6 py-3 rounded-full shadow-sm mb-6 flex items-center gap-2 border border-indigo-200">
                    <span>New Student Data (X)</span>
                </div>

                <div class="flex w-full justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
                    ${renderTree(1, "78", "text-blue-600")}
                    ${renderTree(2, "85", "text-blue-600")}
                    ${renderTree(3, "80", "text-blue-600")}
                    ${renderTree(4, "72", "text-blue-600")}
                    ${renderTree(5, "90", "text-blue-600")}
                </div>

                <div class="flex flex-col items-center bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl w-full max-w-lg">
                    <div class="font-bold text-slate-700 mb-2">Aggregation Unit (Averaging)</div>
                    <div class="flex gap-2 items-center mb-4 text-slate-600 font-medium bg-white px-4 py-2 rounded border border-slate-200">
                        <span>(78 + 85 + 80 + 72 + 90) &divide; 5</span>
                    </div>
                    <div class="w-full h-px bg-slate-300 mb-4"></div>
                    <div class="text-xl font-bold text-indigo-700 flex items-center gap-2">
                        Final Output Score: <span class="bg-blue-600 text-white px-4 py-1 rounded-lg">81</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "6. Summary of Formulas",
        description: "To summarize, the math behind bagging depends entirely on the task. Let <b>H(x)</b> be our final ensemble prediction, and <b>h<sub>b</sub>(x)</b> be the prediction of a single base model out of <b>B</b> total models.",
        render: () => {
            // Define our formulas using standard LaTeX syntax
            const classFormula = "H(x) = \\arg\\max_{c} \\sum_{b=1}^{B} I(h_b(x) = c)";
            const regFormula = "H(x) = \\frac{1}{B} \\sum_{b=1}^{B} h_b(x)";

            // Generate KaTeX HTML strings
            const classHtml = katex.renderToString(classFormula, { throwOnError: false, displayMode: true });
            const regHtml = katex.renderToString(regFormula, { throwOnError: false, displayMode: true });

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <!-- Classification Equation -->
                    <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800 mb-2">Classification (Voting)</h3>
                            <p class="text-sm text-slate-500 mb-4">The final prediction is the class (c) that receives the most votes (argmax).</p>
                        </div>

                        <!-- Rendered LaTeX -->
                        <div class="flex flex-col items-center justify-center bg-slate-50 py-4 rounded-lg border border-slate-200 text-slate-800 mb-2 shadow-inner min-h-[120px]">
                            ${classHtml}
                        </div>

                        <p class="text-xs text-center text-slate-400 mt-2 font-sans">
                            * <b>I(...)</b> is an indicator returning 1 if true, 0 if false.
                        </p>
                    </div>

                    <!-- Regression Equation -->
                    <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800 mb-2">Regression (Averaging)</h3>
                            <p class="text-sm text-slate-500 mb-4">The final prediction is the mean average of all base model predictions.</p>
                        </div>

                        <!-- Rendered LaTeX -->
                        <div class="flex flex-col items-center justify-center bg-slate-50 py-4 rounded-lg border border-slate-200 text-slate-800 mb-2 shadow-inner min-h-[120px]">
                            ${regHtml}
                        </div>

                            <p class="text-xs text-center text-slate-400 mt-2 font-sans">
                            * The sum of all predictions, divided by B.
                        </p>
                    </div>
                </div>
            `;
        }
    },
    {
        title: "7. Coding Bagging in Python",
        description: "In the real world, you don't calculate this by hand. Python's <b>scikit-learn</b> library handles all the heavy lifting (bootstrapping and aggregation) with just a few lines of code!",
        render: () => `
            <div class="w-full max-w-5xl flex flex-col lg:flex-row gap-6 text-left items-stretch">

                <!-- Code Block (Syntax Highlighted) -->
                <div class="flex-1 bg-[#2d2d2d] rounded-xl shadow-lg overflow-hidden border border-slate-700 flex flex-col">
                    <div class="bg-[#1e1e1e] px-4 py-2 text-xs text-slate-400 border-b border-slate-700 font-mono flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                        <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="ml-2">bagging_tutorial.py</span>
                    </div>
                    <div class="p-4 overflow-x-auto text-sm sm:text-base flex-grow">
<pre class="!m-0 !p-0 !bg-transparent"><code class="language-python">from sklearn.ensemble import BaggingClassifier
from sklearn.tree import DecisionTreeClassifier

# 1. Define the Base Model
base_model = DecisionTreeClassifier()

# 2. Create the Bagging Ensemble
bagging_model = BaggingClassifier(
    estimator=base_model,
    n_estimators=10,
    random_state=42
)

# 3. Train the model
# (Bootstrapping happens automatically!)
bagging_model.fit(X_train, y_train)

# 4. Make Predictions
# (Aggregation happens automatically!)
predictions = bagging_model.predict(X_test)</code></pre>
                    </div>
                </div>

                <!-- Explanations -->
                <div class="flex-1 flex flex-col justify-center gap-3 sm:gap-4">
                    <div class="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-xl shadow-sm">
                        <h4 class="font-bold text-indigo-800 mb-1 flex items-center gap-2">
                            <span class="bg-indigo-200 text-indigo-900 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            The Base Estimator
                        </h4>
                        <p class="text-sm text-slate-700 ml-8">We define the model we want to duplicate. The <code>DecisionTreeClassifier</code> is the most common base model for bagging.</p>
                    </div>
                    <div class="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-xl shadow-sm">
                        <h4 class="font-bold text-indigo-800 mb-1 flex items-center gap-2">
                            <span class="bg-indigo-200 text-indigo-900 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            The Ensemble
                        </h4>
                        <p class="text-sm text-slate-700 ml-8"><code>BaggingClassifier</code> wraps our base model. Setting <code>n_estimators=10</code> tells scikit-learn to train 10 separate decision trees.</p>
                    </div>
                    <div class="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-xl shadow-sm">
                        <h4 class="font-bold text-indigo-800 mb-1 flex items-center gap-2">
                            <span class="bg-indigo-200 text-indigo-900 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            Automatic Math
                        </h4>
                        <p class="text-sm text-slate-700 ml-8">When calling <code>.fit()</code>, Python automatically creates the bootstrap subsets. When calling <code>.predict()</code>, it automatically applies the aggregation math!</p>
                    </div>
                </div>
            </div>
        `
    }
];

let currentStep = 0;

// DOM Elements
const contentArea = document.getElementById('content-area');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const stepCounter = document.getElementById('step-counter');
const progressDotsContainer = document.getElementById('progress-dots');
const progressLine = document.getElementById('progress-line');

// Initialize Progress Dots
function initProgressDots() {
    steps.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 z-10 bg-white ${index === 0 ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-slate-400'}`;
        dot.innerText = index + 1;
        dot.id = `dot-${index}`;
        progressDotsContainer.appendChild(dot);
    });
}

// Update the visual state
function updateUI() {
    const step = steps[currentStep];

    // Generate HTML for the content area
    const html = `
        <div class="w-full max-w-4xl text-center mb-8 fade-in">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">${step.title}</h2>
            <p class="text-slate-600 leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">${step.description}</p>
        </div>
        <div class="w-full flex-grow flex items-center justify-center fade-in delay-75">
            ${step.render()}
        </div>
    `;

    // Trick to restart CSS animation smoothly
    contentArea.innerHTML = '';
    setTimeout(() => {
        contentArea.innerHTML = html;

        // Trigger Syntax Highlighting for the new Python Step
        if (window.Prism) {
            Prism.highlightAllUnder(contentArea);
        }
    }, 10);

    // Update Buttons
    btnPrev.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
        btnNext.disabled = true;
        btnNext.innerHTML = "Finish &check;";
        btnNext.classList.replace("bg-indigo-600", "bg-emerald-600");
        btnNext.classList.replace("hover:bg-indigo-700", "hover:bg-emerald-700");
    } else {
        btnNext.disabled = false;
        btnNext.innerHTML = "Next &rarr;";
        btnNext.classList.replace("bg-emerald-600", "bg-indigo-600");
        btnNext.classList.replace("hover:bg-emerald-700", "hover:bg-indigo-700");
    }

    // Update Counter
    stepCounter.innerText = `Step ${currentStep + 1} of ${steps.length}`;

    // Update Progress Dots and Line
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;
    progressLine.style.width = `${progressPercentage}%`;

    steps.forEach((_, index) => {
        const dot = document.getElementById(`dot-${index}`);
        if (index < currentStep) {
            dot.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 z-10 bg-indigo-600 border-indigo-600 text-white';
        } else if (index === currentStep) {
            dot.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 z-10 bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100';
        } else {
            dot.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 z-10 bg-white border-gray-300 text-slate-400';
        }
    });
}

// Event Listeners
btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

// Initialize App
initProgressDots();
updateUI();