// Double backslashes (\\) are strictly required in JS template literals for LaTeX commands!

// Base Data for the 5 Students
const basePoints = [
    { id: 0, label: 'S1', x: 15, y: 60, cls: 'orange' }, // 1 hr, Fail
    { id: 1, label: 'S2', x: 30, y: 40, cls: 'orange' }, // 2 hr, Fail
    { id: 2, label: 'S3', x: 45, y: 60, cls: 'blue' },   // 3 hr, Pass
    { id: 3, label: 'S4', x: 60, y: 40, cls: 'blue' },   // 4 hr, Pass
    { id: 4, label: 'S5', x: 75, y: 50, cls: 'orange' }  // 5 hr, Fail (Anomaly)
];

// 9-Step Flow blending concept, story, and math
const stepsData = [
    {
        title: "1. The Concept: A Committee of Experts",
        desc: `Imagine you have a complex illness. You ask one general doctor for a diagnosis. They are a <b>"Weak Learner"</b>—they get it right 60% of the time, but have blind spots.
                <br><br>
                Instead of trusting just one, what if you hired a committee? You ask Doctor 1. For the cases Doctor 1 gets wrong, you tell Doctor 2, <i>"Focus specifically on these mistakes."</i> You tell Doctor 3 to focus on Doctor 2's mistakes.
                <br><br>
                By combining their votes, you get a highly accurate <b>"Strong Learner."</b> This is Boosting.`,
        pointsState: basePoints.map(() => ({ scale: 1, error: false, neutral: true })),
        boundary: null
    },
    {
        title: "2. The Student Dataset",
        desc: `Let's apply this to a real scenario. We want to predict if 5 students will <span class="text-blue-600 font-bold">Pass (+1)</span> or <span class="text-orange-500 font-bold">Fail (-1)</span> based purely on how many hours they studied.
                <br><br>
                Look at <b>Student 5 (S5)</b> on the far right. They studied for 5 hours, but somehow still failed (maybe they slept through the exam!). S5 is an anomaly. A single simple rule will struggle to classify S5 correctly.`,
        pointsState: basePoints.map(() => ({ scale: 1, error: false, neutral: false })),
        boundary: null
    },
    {
        title: "3. Math Step 1: Initial Weights",
        desc: `At the start, every student is equally important. We assign them an initial "Data Weight" ($w_i$).
                <br><br>
                Since there are $N = 5$ students, the starting weight for every student is simply:
                $$w_i^{(1)} = \\frac{1}{N} = \\frac{1}{5} = 0.2$$
                Because the weights are equal, all the data points below are the same size.`,
        pointsState: basePoints.map(() => ({ scale: 1, error: false, neutral: false })),
        boundary: null
    },
    {
        title: "4. Training Stump 1 & Error",
        desc: `We train our first weak model (Stump 1). Its best rule is: <i>If Hours > 2.5, predict Pass.</i>
                <br><br>
                It gets S1, S2, S3, and S4 correct. But it misclassifies <b>S5</b> (highlighted in red). The model's Total Error ($\\epsilon_1$) is simply the sum of the weights of the misclassified points.
                $$\\epsilon_1 = w_5^{(1)} = 0.2$$`,
        pointsState: [
            { scale: 1, error: false }, { scale: 1, error: false }, { scale: 1, error: false },
            { scale: 1, error: false }, { scale: 1, error: true } // S5 error
        ],
        boundary: { step: 4 }
    },
    {
        title: "5. Calculating Voting Power",
        desc: `Because Stump 1 was somewhat accurate (only 0.2 error), it earns a good amount of "Voting Power" ($\\alpha_1$) for the final committee.
                <br><br>
                The formula for $\\alpha$ rewards models with low error:
                $$\\alpha_1 = \\frac{1}{2} \\ln \\left( \\frac{1 - \\epsilon_1}{\\epsilon_1} \\right)$$
                $$\\alpha_1 = \\frac{1}{2} \\ln \\left( \\frac{1 - 0.2}{0.2} \\right) \\approx 0.693$$`,
        pointsState: [
            { scale: 1, error: false }, { scale: 1, error: false }, { scale: 1, error: false },
            { scale: 1, error: false }, { scale: 1, error: true }
        ],
        boundary: { step: 4 }
    },
    {
        title: "6. The Magic: Updating Weights",
        desc: `<b>This is the secret sauce of Boosting.</b> We update the weights. Correct points shrink, incorrect points grow.
                <br><br>
                $$w_i^{(2)} = w_i^{(1)} \\times e^{-\\alpha_1 y_i h_1(x_i)}$$
                <br><br>
                S1-S4 shrink ($0.2 \\times e^{-0.693} \\approx 0.1$). S5 grows massively ($0.2 \\times e^{0.693} \\approx 0.4$).<br>
                When we normalize these to equal 100%, <b>S5's weight balloons to 0.5 (50%)</b>. Watch S5 grow on the plot!`,
        pointsState: [
            { scale: 0.6, error: false }, { scale: 0.6, error: false }, { scale: 0.6, error: false },
            { scale: 0.6, error: false }, { scale: 2.5, error: true } // S5 balloons
        ],
        boundary: { step: 4 }
    },
    {
        title: "7. Training Stump 2",
        desc: `Now we train Stump 2. Because S5 is so physically heavy (50% of the priority), Stump 2 is mathematically forced to draw a boundary that gets S5 right, even if it sacrifices others.
                <br><br>
                Rule: <i>If Hours < 4.5, predict Pass.</i><br>
                S5 is fixed! But now S1 and S2 are misclassified. <br>
                <i>(Note: S1 and S2 now weigh <b>0.125</b> each. Why? Because in Step 6, their shrunk weight of 0.1 was divided by the total sum of 0.8 to normalize to 100%).</i>
                <br><br>
                The new error is their combined current weights: $\\epsilon_2 = 0.125 + 0.125 = 0.25$`,
        pointsState: [
            { scale: 0.6, error: true }, { scale: 0.6, error: true }, // S1, S2 error
            { scale: 0.6, error: false }, { scale: 0.6, error: false },
            { scale: 2.5, error: false } // S5 correct now
        ],
        boundary: { step: 7 }
    },
    {
        title: "8. Stump 2's Voting Power",
        desc: `Stump 2 made more weighted mistakes than Stump 1 ($\\epsilon_2 = 0.25$ vs $\\epsilon_1 = 0.2$). Because it is slightly less accurate, the formula gives it a lower voting power ($\\alpha_2$) for the final committee.
                $$\\alpha_2 = \\frac{1}{2} \\ln \\left( \\frac{1 - 0.25}{0.25} \\right) \\approx 0.549$$
                Notice $\\alpha_2 (0.549)$ is weaker than $\\alpha_1 (0.693)$.`,
        pointsState: [
            { scale: 0.6, error: true }, { scale: 0.6, error: true },
            { scale: 0.6, error: false }, { scale: 0.6, error: false },
            { scale: 2.5, error: false }
        ],
        boundary: { step: 7 }
    },
    {
        title: "9. The Final Strong Ensemble",
        desc: `Finally, we combine the models! They take a weighted vote:
                $$H(x) = \\text{sign}(\\alpha_1 h_1(x) + \\alpha_2 h_2(x))$$
                Let's vote on S1 (1 hour). Stump 1 says Fail (-1). Stump 2 says Pass (+1).
                $$H(1) = \\text{sign}(0.693(-1) + 0.549(+1)) = \\text{sign}(-0.144) = \\text{Fail}$$
                Because Stump 1 had a higher $\\alpha$, its vote overpowered Stump 2! They correct each other's blind spots.`,
        pointsState: [
            { scale: 1, error: false }, { scale: 1, error: false }, { scale: 1, error: false },
            { scale: 1, error: false }, { scale: 1, error: true } // S5 returns to error to show final combination reality
        ],
        boundary: { step: 9 }
    },
    {
        title: "10. In Practice: Python (scikit-learn)",
        desc: `In the real world, you don't calculate this by hand! Here is how you apply AdaBoost in Python using <b>scikit-learn</b>.
                <div class="bg-slate-800 text-slate-100 p-4 md:p-5 rounded-xl text-xs md:text-sm font-mono overflow-x-auto my-4 shadow-inner border border-slate-700 leading-relaxed">
                    <span class="text-pink-400">from</span> sklearn.ensemble <span class="text-pink-400">import</span> AdaBoostClassifier<br>
                    <br>
                    <span class="text-slate-400"># 1. Create the Committee Manager</span><br>
                    committee = AdaBoostClassifier(n_estimators=2)
                    <br>
                    <br>
                    <span class="text-slate-400"># 2. Train the Committee!</span><br>
                    committee.fit(X, y)
                </div>
                <ul class="list-disc pl-4 space-y-2 mt-2 text-sm text-slate-600">
                    <li><b><code class="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">n_estimators=2</code></b>: We hire exactly 2 stumps for our committee.</li>
                    <li><b><code class="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">fit(X, y)</code></b>: This single line performs <b>all the math</b> we just learned! It automatically calculates weights ($w$), errors ($\\epsilon$), and voting powers ($\\alpha$) loop by loop.</li>
                </ul>`,
        pointsState: basePoints.map(() => ({ scale: 1, error: false, neutral: false })),
        boundary: { step: 9 } // Keep the final boundary visible as a background
    }
];

let currentStep = 0;

const titleEl = document.getElementById('step-title');
const descEl = document.getElementById('step-desc');
const descContainer = document.getElementById('step-desc-container');
const counterEl = document.getElementById('step-counter');
const pointsContainer = document.getElementById('points-container');
const boundariesContainer = document.getElementById('boundaries-container');
const dotsContainer = document.getElementById('step-dots');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');

function init() {
    // Render Points initially
    basePoints.forEach((pt, i) => {
        const wrapper = document.createElement('div');
        wrapper.id = `point-wrapper-${i}`;
        wrapper.className = `absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10`;
        wrapper.style.left = `${pt.x}%`;
        wrapper.style.top = `${pt.y}%`;

        const label = document.createElement('div');
        label.className = `text-xs md:text-sm font-extrabold text-slate-500 mb-1.5 bg-white/80 backdrop-blur-sm px-1.5 rounded`;
        label.innerText = pt.label;

        const el = document.createElement('div');
        el.id = `point-${i}`;
        el.className = `point w-7 h-7 md:w-8 md:h-8 rounded-full border-[3px] border-white shadow-md flex items-center justify-center bg-slate-300`; // Starts gray

        el.innerHTML = `<span id="point-icon-${i}" class="text-white text-[10px] md:text-xs font-bold pointer-events-none hidden"></span>`;

        wrapper.appendChild(label);
        wrapper.appendChild(el);
        pointsContainer.appendChild(wrapper);
    });

    // Render Navigation Dots
    stepsData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.id = `dot-${i}`;
        dot.className = `w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors duration-300 ${i === 0 ? 'bg-indigo-600' : 'bg-slate-200'}`;
        dotsContainer.appendChild(dot);
    });

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; updateUI(); }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < stepsData.length - 1) { currentStep++; updateUI(); }
    });

    updateUI();
}

function renderBoundary(boundaryData) {
    boundariesContainer.style.opacity = 0; // Fade out slightly

    setTimeout(() => {
        boundariesContainer.innerHTML = '';
        if (!boundaryData) {
            boundariesContainer.style.opacity = 1;
            return;
        }

        if (boundaryData.step === 4) {
            // Split at 37.5% (> 2.5 hrs)
            boundariesContainer.innerHTML = `
                <div class="absolute left-0 top-0 h-full bg-orange-500/10 border-r-4 border-slate-700 border-dashed" style="width: 37.5%"></div>
                <div class="absolute right-0 top-0 h-full bg-blue-500/10" style="width: 62.5%"></div>
                <div class="absolute top-4 left-[37.5%] transform -translate-x-1/2 bg-slate-800 text-white text-[10px] md:text-xs px-2.5 py-1 rounded shadow-md font-bold whitespace-nowrap z-0">Stump 1: Hrs > 2.5</div>
            `;
        }
        else if (boundaryData.step === 7) {
            // Split at 67.5% (< 4.5 hrs)
            boundariesContainer.innerHTML = `
                <div class="absolute left-0 top-0 h-full bg-blue-500/10 border-r-4 border-slate-700 border-dashed" style="width: 67.5%"></div>
                <div class="absolute right-0 top-0 h-full bg-orange-500/10" style="width: 32.5%"></div>
                <div class="absolute top-4 left-[67.5%] transform -translate-x-1/2 bg-slate-800 text-white text-[10px] md:text-xs px-2.5 py-1 rounded shadow-md font-bold whitespace-nowrap z-0">Stump 2: Hrs < 4.5</div>
            `;
        }
        else if (boundaryData.step === 9) {
            // Final Ensemble visual hint
            boundariesContainer.innerHTML = `
                <div class="absolute left-0 top-0 h-full bg-orange-500/20 border-r-4 border-indigo-600" style="width: 37.5%"></div>
                <div class="absolute right-0 top-0 h-full bg-blue-500/20" style="width: 62.5%"></div>
                <div class="absolute top-4 left-[37.5%] transform -translate-x-1/2 bg-indigo-700 text-white text-[10px] md:text-xs px-3 py-1.5 rounded shadow-lg font-bold whitespace-nowrap z-0">Final Committee Split</div>
            `;
        }

        boundariesContainer.style.opacity = 1; // Fade back in
    }, 250);
}

function updateUI() {
    const step = stepsData[currentStep];

    // 1. Fade out text area securely
    descContainer.style.opacity = 0;

    // 2. Wait for fade out, apply content, typeset math, then fade in
    setTimeout(() => {
        titleEl.textContent = step.title;
        descEl.innerHTML = step.desc;
        counterEl.textContent = `Step ${currentStep + 1} of ${stepsData.length}`;

        // Process MathJax
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([descEl]).then(() => {
                descContainer.style.opacity = 1;
            }).catch(err => {
                console.error("MathJax error:", err);
                descContainer.style.opacity = 1;
            });
        } else {
            descContainer.style.opacity = 1;
        }

        // Update Buttons
        prevBtn.disabled = currentStep === 0;
        nextBtn.disabled = currentStep === stepsData.length - 1;

        // Update Navigation Dots
        stepsData.forEach((_, i) => {
            const dot = document.getElementById(`dot-${i}`);
            dot.className = `w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors duration-300 ${i === currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`;
        });

        // Update Points Styles (Colors, Scales, Errors)
        step.pointsState.forEach((state, i) => {
            const el = document.getElementById(`point-${i}`);
            const iconEl = document.getElementById(`point-icon-${i}`);
            const basePt = basePoints[i];

            // Handle sizing
            el.style.transform = `scale(${state.scale})`;

            // Handle coloring based on storytelling neutrality
            if (state.neutral) {
                el.classList.remove('bg-blue-500', 'bg-orange-500');
                el.classList.add('bg-slate-300');
                iconEl.classList.add('hidden');
            } else {
                el.classList.remove('bg-slate-300');
                if (basePt.cls === 'blue') {
                    el.classList.add('bg-blue-500');
                    iconEl.textContent = '+1';
                } else {
                    el.classList.add('bg-orange-500');
                    iconEl.textContent = '-1';
                }
                iconEl.classList.remove('hidden');
            }

            // Handle error rings
            if (state.error) {
                el.classList.add('ring-4', 'ring-red-500', 'ring-offset-2', 'ring-offset-slate-50', 'z-20');
            } else {
                el.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2', 'ring-offset-slate-50', 'z-20');
            }
        });

        renderBoundary(step.boundary);

    }, 300); // Wait for CSS opacity transition to finish
}

// Initialize App
window.addEventListener('DOMContentLoaded', init);