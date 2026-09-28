document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const pendingCountEl = document.getElementById('pending-count');
    const overdueCountEl = document.getElementById('overdue-count');

    // Tarik data dari localStorage (Database sederhana di browser)
    let tasks = JSON.parse(localStorage.getItem('nicyue_schedule_vanilla')) || [];

    // Cek apakah sudah login di sesi ini
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    // Proses Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === 'Nicyue' && pass === 'Sakura Miku') {
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

    // Tambah Tugas
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: document.getElementById('t-title').value,
            subject: document.getElementById('t-subject').value,
            due: document.getElementById('t-due').value,
            priority: document.getElementById('t-priority').value,
            desc: document.getElementById('t-desc').value,
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset();
    });

    // Hapus Tugas
    window.deleteTask = function(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };

    function saveTasks() {
        localStorage.setItem('nicyue_schedule_vanilla', JSON.stringify(tasks));
    }

    // Render Tugas ke Layar
    function renderTasks() {
        taskList.innerHTML = '';
        let pendingCount = 0;
        let overdueCount = 0;
        const now = new Date();

        // Urutkan berdasarkan waktu tenggat (terdekat di atas)
        const sortedTasks = [...tasks].sort((a, b) => new Date(a.due) - new Date(b.due));

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '<p class="text-slate-500 text-center py-10">Belum ada tugas. Baguslah kalau lagi santai.</p>';
        }

        sortedTasks.forEach(t => {
            const dueDate = new Date(t.due);
            const isOverdue = dueDate < now;

            if (isOverdue) overdueCount++;
            else pendingCount++;

            const dueStatusStyle = isOverdue 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            
            const overdueText = isOverdue ? '(Lewat Deadline!)' : '';

            const taskEl = document.createElement('div');
            taskEl.className = 'bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center transition hover:border-blue-500/50';
            taskEl.innerHTML = `
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h4 class="font-bold text-blue-300 text-lg">${t.title}</h4>
                        <span class="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-full">${t.subject}</span>
                        <span class="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">${t.priority}</span>
                    </div>
                    <p class="text-sm text-slate-400 mb-3">${t.desc}</p>
                    <div class="text-xs font-medium px-3 py-1 rounded-full inline-block ${dueStatusStyle}">
                        Due: ${dueDate.toLocaleString('id-ID')} ${overdueText}
                    </div>
                </div>
                <button onclick="deleteTask(${t.id})" class="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 px-4 rounded-lg text-sm font-bold transition-all">Hapus</button>
            `;
            taskList.appendChild(taskEl);
        });

        pendingCountEl.textContent = pendingCount;
        overdueCountEl.textContent = overdueCount;
    }
});
