// Data Structure for the visualization
// 8 Data Points total.
const basePoints = [
    { id: 0, x: 20, y: 50, cls: 'blue' },
    { id: 1, x: 40, y: 30, cls: 'blue' },
    { id: 2, x: 35, y: 70, cls: 'blue' },
    { id: 3, x: 50, y: 50, cls: 'orange' }, // Tricky point
    { id: 4, x: 65, y: 25, cls: 'blue' },   // Tricky point
    { id: 5, x: 75, y: 50, cls: 'orange' },
    { id: 6, x: 65, y: 75, cls: 'orange' },
    { id: 7, x: 85, y: 30, cls: 'orange' }
];

// Define what happens in each step of the algorithm
const stepsData = [
    {
        title: "1. The Initial Dataset",
        desc: "We start with a dataset containing two classes: <span class='text-blue-600 font-bold'>Blue</span> and <span class='text-orange-500 font-bold'>Orange</span>. In Boosting, every data point initially gets an <b>equal weight</b>, meaning they are all the same size and importance.",
        pointsState: basePoints.map(() => ({ scale: 1, error: false })),
        boundary: null,
        showEquation: false
    },
    {
        title: "2. Training Weak Learner 1",
        desc: "We train our first 'Weak Learner' (a very simple model). It creates a single vertical split to separate the classes. It gets most right, but makes some mistakes. <b>Notice the misclassified points highlighted with a red ring.</b>",
        pointsState: [
            { scale: 1, error: false }, { scale: 1, error: false }, { scale: 1, error: false },
            { scale: 1, error: true },  // P3 (Orange predicted as Blue)
            { scale: 1, error: true },  // P4 (Blue predicted as Orange)
            { scale: 1, error: false }, { scale: 1, error: false }, { scale: 1, error: false }
        ],
        boundary: { type: 'vertical', pos: 55 }, // Left Blue, Right Orange
        showEquation: false
    },
    {
        title: "3. Reweighting Data",
        desc: "Here is the magic of Boosting: We <b>increase the weight</b> (size) of the points we got wrong, and <b>decrease the weight</b> of the points we got right. The next model is forced to pay more attention to the large points.",
        pointsState: [
            { scale: 0.5, error: false }, { scale: 0.5, error: false }, { scale: 0.5, error: false },
            { scale: 2.2, error: true },   // P3 gets huge
            { scale: 2.2, error: true },   // P4 gets huge
            { scale: 0.5, error: false }, { scale: 0.5, error: false }, { scale: 0.5, error: false }
        ],
        boundary: { type: 'vertical', pos: 55 },
        showEquation: false
    },
    {
        title: "4. Training Weak Learner 2",
        desc: "We train a second simple model. Because of the new weights, it creates a horizontal split specifically to correctly classify the large points. However, it now makes new mistakes on some of the smaller points.",
        pointsState: [
            { scale: 0.5, error: true },  // P0 error
            { scale: 0.5, error: false },
            { scale: 0.5, error: true },  // P2 error
            { scale: 2.2, error: false }, // P3 correct now
            { scale: 2.2, error: false }, // P4 correct now
            { scale: 0.5, error: false }, { scale: 0.5, error: false },
            { scale: 0.5, error: true }   // P7 error
        ],
        boundary: { type: 'horizontal', pos: 40 }, // Top Blue, Bottom Orange
        showEquation: false
    },
    {
        title: "5. Reweighting Data (Again)",
        desc: "We repeat the process. The weights are updated again. The new mistakes become larger, while the previously large points shrink slightly because they were classified correctly this time.",
        pointsState: [
            { scale: 1.8, error: true },  // P0 grows
            { scale: 0.3, error: false },
            { scale: 1.8, error: true },  // P2 grows
            { scale: 1.0, error: false }, // P3 shrinks a bit
            { scale: 1.0, error: false }, // P4 shrinks a bit
            { scale: 0.3, error: false }, { scale: 0.3, error: false },
            { scale: 1.8, error: true }   // P7 grows
        ],
        boundary: { type: 'horizontal', pos: 40 },
        showEquation: false
    },
    {
        title: "6. The Strong Ensemble",
        desc: "Finally, we combine all our weak models together. They vote on the outcome based on their individual accuracy. Together, they create a highly complex, non-linear decision boundary that perfectly separates our classes!",
        pointsState: basePoints.map(() => ({ scale: 1, error: false })), // Back to normal size to show final result
        boundary: { type: 'ensemble' }, // Complex combined boundary
        showEquation: false
    },
    {
        title: "7. The Equation Behind Boosting",
        desc: "How are these weak learners mathematically combined? Boosting algorithms (like AdaBoost) use an additive model approach. Let's look at the core equation used to calculate the final prediction.",
        pointsState: basePoints.map(() => ({ scale: 1, error: false })),
        boundary: { type: 'ensemble' },
        showEquation: true
    }
];

let currentStep = 0;

// DOM Elements
const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const counterEl = document.getElementById('step-counter');
const pointsContainer = document.getElementById('points-container');
const boundariesContainer = document.getElementById('boundaries-container');
const dotsContainer = document.getElementById('step-dots');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const equationArea = document.getElementById('equation-area');
const plotArea = document.getElementById('plot-area');

// Initialization
function init() {
    // Create points in DOM
    basePoints.forEach((pt, i) => {
        const el = document.createElement('div');
        el.id = `point-${i}`;
        // Base styles
        el.className = `point absolute w-6 h-6 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center`;
        // Position
        el.style.left = `${pt.x}%`;
        el.style.top = `${pt.y}%`;
        // Color
        if (pt.cls === 'blue') {
            el.classList.add('bg-blue-500');
            el.innerHTML = `<span class="text-white text-xs font-bold pointer-events-none">+</span>`;
        } else {
            el.classList.add('bg-orange-500');
            el.innerHTML = `<span class="text-white text-xs font-bold pointer-events-none">-</span>`;
        }
        pointsContainer.appendChild(el);
    });

    // Create step dots
    stepsData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${i === 0 ? 'bg-indigo-600' : 'bg-slate-200'}`;
        dot.id = `dot-${i}`;
        dotsContainer.appendChild(dot);
    });

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < stepsData.length - 1) {
            currentStep++;
            updateUI();
        }
    });

    updateUI();
}

// Render Boundaries Logic
function renderBoundary(boundaryData) {
    boundariesContainer.innerHTML = ''; // Clear previous

    if (!boundaryData) return;

    if (boundaryData.type === 'vertical') {
        boundariesContainer.innerHTML = `
            <div class="boundary absolute left-0 top-0 h-full bg-blue-500/10 border-r-2 border-blue-400 border-dashed" style="width: ${boundaryData.pos}%"></div>
            <div class="boundary absolute top-0 h-full bg-orange-500/10" style="left: ${boundaryData.pos}%; width: ${100 - boundaryData.pos}%"></div>
        `;
    }
    else if (boundaryData.type === 'horizontal') {
        boundariesContainer.innerHTML = `
            <div class="boundary absolute left-0 top-0 w-full bg-blue-500/10 border-b-2 border-blue-400 border-dashed" style="height: ${boundaryData.pos}%"></div>
            <div class="boundary absolute left-0 w-full bg-orange-500/10" style="top: ${boundaryData.pos}%; height: ${100 - boundaryData.pos}%"></div>
        `;
    }
    else if (boundaryData.type === 'ensemble') {
        // Complex boundary combining previous steps
        boundariesContainer.innerHTML = `
            <div class="boundary absolute left-0 top-0 h-full bg-blue-500/20" style="width: 45%;"></div>
            <div class="boundary absolute top-0 bg-blue-500/20" style="left: 45%; width: 35%; height: 40%;"></div>
            <div class="boundary absolute bg-orange-500/20" style="left: 45%; width: 55%; top: 40%; height: 60%;"></div>
            <div class="boundary absolute top-0 bg-orange-500/20" style="left: 80%; width: 20%; height: 40%;"></div>
            <!-- Thick solid lines to denote final boundary -->
            <div class="absolute bg-indigo-600 z-10" style="left: 45%; top: 40%; width: 2px; height: 60%;"></div>
            <div class="absolute bg-indigo-600 z-10" style="left: 45%; top: 40%; width: 35%; height: 2px%;"></div>
            <div class="absolute bg-indigo-600 z-10" style="left: 80%; top: 0; width: 2px; height: 40%;"></div>
        `;
    }
}

// Main UI Update Function
function updateUI() {
    const step = stepsData[currentStep];

    // Update Text
    titleEl.textContent = step.title;
    descEl.innerHTML = step.desc;
    counterEl.textContent = `Step ${currentStep + 1} of ${stepsData.length}`;

    // Update Buttons
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === stepsData.length - 1;

    // Update Dots
    stepsData.forEach((_, i) => {
        const dot = document.getElementById(`dot-${i}`);
        if (i === currentStep) {
            dot.className = 'w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 bg-indigo-600';
        } else {
            dot.className = 'w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 bg-slate-200';
        }
    });

    // Toggle Equation Screen
    if (step.showEquation) {
        equationArea.classList.remove('hidden');
        plotArea.classList.add('overflow-visible');
        // Trigger MathJax render if available
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([equationArea]).catch((err) => console.log(err.message));
        }
    } else {
        equationArea.classList.add('hidden');
        plotArea.classList.remove('overflow-visible');
    }

    // Update Points Scale and Error States
    step.pointsState.forEach((state, i) => {
        const el = document.getElementById(`point-${i}`);

        // Base transform with scaling
        let transformStr = `translate(-50%, -50%) scale(${state.scale})`;
        el.style.transform = transformStr;

        // Handle error highlighting
        if (state.error && !step.showEquation) {
            el.classList.add('ring-4', 'ring-red-500', 'ring-opacity-80', 'ring-offset-2', 'ring-offset-slate-50', 'z-20');
        } else {
            el.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-80', 'ring-offset-2', 'ring-offset-slate-50', 'z-20');
        }
    });

    // Render Background Boundaries
    renderBoundary(step.boundary);
}

// Boot up
window.addEventListener('DOMContentLoaded', init);