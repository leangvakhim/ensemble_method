// Data representation for the original dataset
const dataPoints = [
    { id: 1, color: 'bg-rose-500' },
    { id: 2, color: 'bg-blue-500' },
    { id: 3, color: 'bg-emerald-500' },
    { id: 4, color: 'bg-amber-500' },
    { id: 5, color: 'bg-purple-500' }
];

// Helper to generate a colored circle HTML
const renderPoint = (point, extraClass = '', sizeClass = 'w-12 h-12 text-base') => `
    <div class="${sizeClass} shrink-0 rounded-full ${point.color} text-white font-bold flex items-center justify-center shadow-sm border-2 border-white ${extraClass}">
        ${point.id}
    </div>
`;

// The 5 Steps Content
const steps = [
    {
        title: "1. The Original Dataset",
        description: "We start with a single training dataset containing <b>N</b> samples. Our goal is to train a robust model, but a single complex model might overfit the data.",
        render: () => `
            <div class="flex flex-col items-center w-full max-w-lg">
                <div class="bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-xl w-full flex justify-center gap-4 shadow-inner">
                    ${dataPoints.map(p => renderPoint(p)).join('')}
                </div>
                <div class="mt-4 text-center text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                    Dataset D (Size N = 5)
                </div>
            </div>
        `
    },
    {
        title: "2. Bootstrapping (Sampling with Replacement)",
        description: "We create <b>B</b> new datasets (subsets) of the same size <b>N</b> by randomly sampling from the original dataset <i>with replacement</i>. <br><br>Notice how some data points appear multiple times in a single subset, while others are left out entirely (these left-out points are called Out-Of-Bag or OOB samples).",
        render: () => {
            // Pre-determined random samples for visualization
            const subset1 = [1, 3, 3, 4, 5]; // Duplicate 3, Misses 2
            const subset2 = [2, 2, 4, 5, 5]; // Duplicates 2, 5, Misses 1, 3
            const subset3 = [1, 2, 3, 4, 4]; // Duplicate 4, Misses 5

            const renderSubset = (title, ids) => `
                <div class="flex flex-col items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm w-full max-w-[280px]">
                    <h3 class="text-sm font-bold text-slate-700 mb-3 text-center">${title}</h3>
                    <div class="flex gap-2 flex-wrap justify-center">
                        ${ids.map(id => {
                const point = dataPoints.find(p => p.id === id);
                // Highlight duplicates with a ring
                const count = ids.filter(i => i === id).length;
                const extraClass = count > 1 ? 'ring-4 ring-indigo-200' : '';
                return renderPoint(point, extraClass, 'w-10 h-10 text-sm');
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
        description: "Next, we train a separate, independent base model (typically an unpruned Decision Tree) on <b>each</b> of the Bootstrap samples. Because each sample contains slightly different data, each model learns different patterns, creating a diverse ensemble.",
        render: () => `
            <div class="flex w-full max-w-3xl justify-between items-center">
                <!-- Datasets -->
                <div class="flex flex-col gap-6">
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₁</div>
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₂</div>
                    <div class="bg-slate-100 border border-slate-300 px-4 py-2 rounded shadow-sm font-semibold text-slate-700 text-center">Sample D₃</div>
                </div>

                <!-- Arrows -->
                <div class="flex flex-col gap-10 text-indigo-400 font-bold text-xl">
                    <div>&rarr; trains &rarr;</div>
                    <div>&rarr; trains &rarr;</div>
                    <div>&rarr; trains &rarr;</div>
                </div>

                <!-- Models -->
                <div class="flex flex-col gap-4">
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 1 (h₁)</span>
                    </div>
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 2 (h₂)</span>
                    </div>
                    <div class="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🌳</span> <span class="font-bold text-emerald-800">Model 3 (h₃</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "4. Aggregation (Making Predictions)",
        description: "When we want to predict a new unseen data point (X), we pass it through all <b>B</b> trained models. We then <b>Aggregate</b> their individual predictions. For Classification, we use Majority Voting. For Regression, we use the Average.",
        render: () => `
            <div class="flex flex-col items-center w-full max-w-4xl">

                <div class="bg-indigo-100 text-indigo-800 font-bold px-6 py-3 rounded-full shadow-sm mb-6 flex items-center gap-2 border border-indigo-200">
                    <span>New Input Data (X)</span>
                </div>

                <div class="flex w-full justify-center gap-12 text-indigo-300 mb-2">
                    <span>&darr;</span><span>&darr;</span><span>&darr;</span>
                </div>

                <div class="flex gap-6 w-full justify-center mb-6">
                    <div class="bg-white border-2 border-emerald-400 p-4 rounded-xl text-center shadow-sm w-32">
                        <div class="text-2xl mb-2">🌳₁</div>
                        <div class="text-xs text-slate-500 mb-1">Predicts:</div>
                        <div class="font-bold text-emerald-700">Class A</div>
                    </div>
                    <div class="bg-white border-2 border-emerald-400 p-4 rounded-xl text-center shadow-sm w-32">
                        <div class="text-2xl mb-2">🌳₂</div>
                        <div class="text-xs text-slate-500 mb-1">Predicts:</div>
                        <div class="font-bold text-emerald-700">Class B</div>
                    </div>
                    <div class="bg-white border-2 border-emerald-400 p-4 rounded-xl text-center shadow-sm w-32">
                        <div class="text-2xl mb-2">🌳₃</div>
                        <div class="text-xs text-slate-500 mb-1">Predicts:</div>
                        <div class="font-bold text-emerald-700">Class A</div>
                    </div>
                </div>

                <div class="flex flex-col items-center bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl w-full max-w-lg">
                    <div class="font-bold text-slate-700 mb-2">Aggregation Unit (Majority Vote)</div>
                    <div class="flex gap-4 items-center mb-4">
                        <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded font-semibold text-sm">Class A (2 votes)</span>
                        <span class="text-slate-400 text-sm">vs</span>
                        <span class="bg-rose-100 text-rose-800 px-3 py-1 rounded font-semibold text-sm">Class B (1 vote)</span>
                    </div>
                    <div class="w-full h-px bg-slate-300 mb-4"></div>
                    <div class="text-xl font-bold text-indigo-700 flex items-center gap-2">
                        Final Output: <span class="bg-indigo-600 text-white px-4 py-1 rounded-lg">Class A</span>
                    </div>
                </div>

            </div>
        `
    },
    {
        title: "5. The Bagging Equations",
        description: "Mathematically, the aggregation step can be represented based on the type of problem you are solving. Let <b>H(x)</b> be the final ensemble prediction, and <b>h<sub>b</sub>(x)</b> be the prediction of the <i>b</i>-th base model, where <b>B</b> is the total number of models.",
        render: () => `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

                <!-- Regression Equation -->
                <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">For Regression (Averaging)</h3>
                    <p class="text-sm text-slate-500 mb-6">The final prediction is the mean of all base model predictions.</p>

                    <div class="flex items-center justify-center bg-slate-50 py-8 rounded-lg border border-slate-100 font-serif text-xl text-slate-800">
                        <span>H(x) = </span>
                        <div class="math-fraction">
                            <span class="math-numerator">1</span>
                            <span class="math-denominator">B</span>
                        </div>
                        <div class="math-sigma text-blue-600">
                            <span class="math-limit">B</span>
                            <span class="math-sigma-symbol">&Sigma;</span>
                            <span class="math-limit">b=1</span>
                        </div>
                        <span> h<sub>b</sub>(x)</span>
                    </div>
                </div>

                <!-- Classification Equation -->
                <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">For Classification (Voting)</h3>
                    <p class="text-sm text-slate-500 mb-6">The final prediction is the class (c) that receives the most votes (argmax).</p>

                    <div class="flex items-center justify-center bg-slate-50 py-8 rounded-lg border border-slate-100 font-serif text-xl text-slate-800">
                        <span>H(x) = argmax<sub>c</sub> </span>
                        <div class="math-sigma text-emerald-600 ml-3">
                            <span class="math-limit">B</span>
                            <span class="math-sigma-symbol">&Sigma;</span>
                            <span class="math-limit">b=1</span>
                        </div>
                        <span> I(h<sub>b</sub>(x) = c)</span>
                    </div>
                    <p class="text-xs text-center text-slate-400 mt-3 font-sans">
                        * where <b>I(...)</b> is the indicator function returning 1 if true, 0 if false.
                    </p>
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
        dot.className = `w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 ${index === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-gray-300'
            }`;
        dot.innerText = index + 1;
        dot.id = `dot-${index}`;
        progressDotsContainer.appendChild(dot);
    });
}

function updateUI() {
    const step = steps[currentStep];

    // Generate HTML for the content area
    const html = `
        <div class="w-full max-w-4xl text-center mb-8 fade-in">
            <h2 class="text-2xl font-bold text-slate-800 mb-4">${step.title}</h2>
            <p class="text-slate-600 leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">${step.description}</p>
        </div>
        <div class="w-full flex-grow flex items-center justify-center fade-in delay-75">
            ${step.render()}
        </div>
    `;

    // Trick to restart CSS animation
    contentArea.innerHTML = '';
    setTimeout(() => {
        contentArea.innerHTML = html;
    }, 10);

    // Update Buttons
    btnPrev.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
        btnNext.disabled = true;
        btnNext.innerHTML = "Finish &check;";
    } else {
        btnNext.disabled = false;
        btnNext.innerHTML = "Next &rarr;";
    }

    // Update Counter
    stepCounter.innerText = `Step ${currentStep + 1} of ${steps.length}`;

    // Update Progress Dots and Line
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;
    progressLine.style.width = `${progressPercentage}%`;

    steps.forEach((_, index) => {
        const dot = document.getElementById(`dot-${index}`);
        if (index <= currentStep) {
            dot.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 bg-indigo-600 text-white border-indigo-600';
        } else {
            dot.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 bg-white text-slate-400 border-gray-300';
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