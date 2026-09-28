document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    
    const typeSelect = document.getElementById('t-type');
    const taskDates = document.getElementById('task-dates');
    const eventDates = document.getElementById('event-dates');
    
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    let tasks = JSON.parse(localStorage.getItem('nicyue_schedule_vanilla')) || [];

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('username').value === 'Nicyue' && document.getElementById('password').value === 'Sakura Miku') {
            sessionStorage.setItem('isLoggedIn', 'true');
            showDashboard();
        } else {
            alert('Username atau Password salah!');
        }
    });

    function showDashboard() {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        renderTasks();
    }

    typeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Event') {
            taskDates.classList.add('hidden');
            eventDates.classList.remove('hidden');
            document.getElementById('t-due').required = false;
            document.getElementById('t-start').required = true;
            document.getElementById('t-end').required = true;
        } else {
            taskDates.classList.remove('hidden');
            eventDates.classList.add('hidden');
            document.getElementById('t-due').required = true;
            document.getElementById('t-start').required = false;
            document.getElementById('t-end').required = false;
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('t-id').value;
        
        const taskData = {
            id: idInput ? parseInt(idInput) : Date.now(),
            title: document.getElementById('t-title').value,
            subject: document.getElementById('t-subject').value,
            type: typeSelect.value,
            priority: document.getElementById('t-priority').value,
            desc: document.getElementById('t-desc').value,
            due: document.getElementById('t-due').value,
            start: document.getElementById('t-start').value,
            end: document.getElementById('t-end').value,
        };

        if (idInput) {
            tasks = tasks.map(t => t.id === taskData.id ? taskData : t);
            resetFormState();
        } else {
            tasks.push(taskData);
        }

        saveTasks();
        renderTasks();
        taskForm.reset();
        // trigger change to reset date fields visibility
        typeSelect.dispatchEvent(new Event('change')); 
    });

    cancelEditBtn.addEventListener('click', () => {
        taskForm.reset();
        resetFormState();
        typeSelect.dispatchEvent(new Event('change'));
    });

    function resetFormState() {
        document.getElementById('t-id').value = '';
        formTitle.textContent = 'Tambah Schedule';
        submitBtn.textContent = 'Simpan Schedule';
        cancelEditBtn.classList.add('hidden');
    }

    window.editTask = function(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;

        document.getElementById('t-id').value = t.id;
        document.getElementById('t-title').value = t.title;
        document.getElementById('t-subject').value = t.subject;
        document.getElementById('t-type').value = t.type || 'Task';
        document.getElementById('t-priority').value = t.priority;
        document.getElementById('t-desc').value = t.desc;
        
        typeSelect.dispatchEvent(new Event('change'));

        if (t.type === 'Event') {
            document.getElementById('t-start').value = t.start || '';
            document.getElementById('t-end').value = t.end || '';
        } else {
            document.getElementById('t-due').value = t.due || '';
        }

        formTitle.textContent = 'Edit Schedule';
        submitBtn.textContent = 'Update Schedule';
        cancelEditBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteTask = function(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };

    function saveTasks() {
        localStorage.setItem('nicyue_schedule_vanilla', JSON.stringify(tasks));
    }

    function checkConflicts() {
        const events = tasks.filter(t => t.type === 'Event' && t.start && t.end);
        let conflicts = new Set();

        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                const aStart = new Date(events[i].start).getTime();
                const aEnd = new Date(events[i].end).getTime();
                const bStart = new Date(events[j].start).getTime();
                const bEnd = new Date(events[j].end).getTime();

                // Check overlap
                if (aStart < bEnd && aEnd > bStart) {
                    conflicts.add(events[i].id);
                    conflicts.add(events[j].id);
                }
            }
        }
        return conflicts;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let pendingCount = 0;
        let overdueCount = 0;
        const now = new Date();
        const conflictIds = checkConflicts();

        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = new Date(a.type === 'Event' ? a.start : a.due);
            const dateB = new Date(b.type === 'Event' ? b.start : b.due);
            return dateA - dateB;
        });

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '<p class="text-slate-500 text-center py-10">Belum ada tugas atau acara.</p>';
        }

        sortedTasks.forEach(t => {
            let isOverdue = false;
            let dateDisplay = '';
            
            if (t.type === 'Event') {
                const endDate = new Date(t.end);
                isOverdue = endDate < now;
                dateDisplay = `Start: ${new Date(t.start).toLocaleString('id-ID')} | End: ${endDate.toLocaleString('id-ID')}`;
            } else {
                const dueDate = new Date(t.due);
                isOverdue = dueDate < now;
                dateDisplay = `Due: ${dueDate.toLocaleString('id-ID')}`;
            }

            if (isOverdue) overdueCount++;
            else pendingCount++;

            const dueStatusStyle = isOverdue 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            
            const overdueText = isOverdue ? '(Selesai/Lewat!)' : '';
            const conflictBadge = conflictIds.has(t.id) 
                ? '<span class="ml-2 text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-full animate-pulse">⚠️ Bentrok!</span>' 
                : '';

            const taskEl = document.createElement('div');
            taskEl.className = 'bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-start transition hover:border-blue-500/50';
            taskEl.innerHTML = `
                <div class="flex-1 pr-4">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <h4 class="font-bold text-blue-300 text-lg">${t.title}</h4>
                        <span class="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-full">${t.subject}</span>
                        <span class="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">${t.priority}</span>
                        <span class="text-[10px] uppercase font-bold ${t.type === 'Event' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'} px-2 py-1 rounded-full">${t.type || 'Task'}</span>
                        ${conflictBadge}
                    </div>
                    <p class="text-sm text-slate-400 mb-3 whitespace-pre-wrap">${t.desc}</p>
                    <div class="text-xs font-medium px-3 py-1 rounded-full inline-block ${dueStatusStyle}">
                        ${dateDisplay} ${overdueText}
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="editTask(${t.id})" class="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded-lg text-sm font-bold transition-all w-20">Edit</button>
                    <button onclick="deleteTask(${t.id})" class="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg text-sm font-bold transition-all w-20">Hapus</button>
                </div>
            `;
            taskList.appendChild(taskEl);
        });

        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('overdue-count').textContent = overdueCount;
    }
});
