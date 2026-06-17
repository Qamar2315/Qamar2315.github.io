1. **Fix Markdown Rendering in Short Descriptions & Freelance Descriptions:**
    *   Change `desc.textContent = work.short_description || '';` to `desc.innerHTML = marked.parseInline(work.short_description || '');` in `app.js` (around line 254).
    *   Change `<p class="text-slate-600 mb-4 flex-grow">${project.short_description || ''}</p>` to `<p class="text-slate-600 mb-4 flex-grow">${marked.parseInline(project.short_description || '')}</p>` in `app.js` (around line 217).

2. **Fix Markdown Rendering in Experience Responsibilities:**
    *   Change `li.textContent = item;` to `li.innerHTML = marked.parseInline(item);` in `app.js` (around line 488).
    *   Change `summaryText.textContent = item.summary + " ";` to `summaryText.innerHTML = marked.parseInline(item.summary) + " ";` in `app.js` (around line 495).

3. **Complete pre-commit steps:**
    *   Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
