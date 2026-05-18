document.addEventListener('DOMContentLoaded', () => {
    // Increased to 10 to include the new Python code tutorial step
    const totalSteps = 10;
    let currentStep = 1;

    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    const dotContainer = document.getElementById('dot-indicators');

    // Initialize dots
    for (let i = 1; i <= totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = `w-2 h-2 rounded-full transition-colors ${i === 1 ? 'bg-indigo-600' : 'bg-slate-300'}`;
        dot.id = `dot-${i}`;
        dotContainer.appendChild(dot);
    }

    function updateUI() {
        // Update buttons
        btnBack.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            btnNext.disabled = true;
            btnNext.innerHTML = 'Finish <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            btnNext.classList.replace('bg-indigo-600', 'bg-emerald-600');
            btnNext.classList.replace('hover:bg-indigo-700', 'hover:bg-emerald-700');
        } else {
            btnNext.disabled = false;
            btnNext.innerHTML = 'Next Step <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
            btnNext.classList.replace('bg-emerald-600', 'bg-indigo-600');
            btnNext.classList.replace('hover:bg-emerald-700', 'hover:bg-indigo-700');
        }

        // Update text and progress bar
        stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

        // Update dots
        for (let i = 1; i <= totalSteps; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (i === currentStep) {
                dot.classList.replace('bg-slate-300', 'bg-indigo-600');
            } else {
                dot.classList.replace('bg-indigo-600', 'bg-slate-300');
            }
        }

        // Show/Hide steps
        for (let i = 1; i <= totalSteps; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) {
                if (i === currentStep) {
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active');
                }
            }
        }

        // Force MathJax to re-render if we hit pages with equations
        // Triggering safely on every page change where math might exist
        if (window.MathJax && [5, 6, 7, 8, 9, 10].includes(currentStep)) {
            MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    // Initial MathJax render just in case
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
});