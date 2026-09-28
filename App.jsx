import { useState, useEffect } from 'react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', subject: '', desc: '', due: '', priority: 'Medium' })

  // Tarik data saat web dibuka
  useEffect(() => {
    const saved = localStorage.getItem('nicyue_schedule')
    if (saved) setTasks(JSON.parse(saved))
  }, [])

  // Simpan data setiap ada perubahan
  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('nicyue_schedule', JSON.stringify(tasks))
  }, [tasks, isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'Nicyue' && password === 'Sakura Miku') setIsLoggedIn(true)
    else alert('Username atau Password salah!')
  }

  const addTask = (e) => {
    e.preventDefault()
    setTasks([...tasks, { ...newTask, id: Date.now(), status: 'Pending' }])
    setNewTask({ title: '', subject: '', desc: '', due: '', priority: 'Medium' })
  }

  const hapusTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const now = new Date()
  const pendingCount = tasks.filter(t => new Date(t.due) >= now).length
  const overdueCount = tasks.filter(t => new Date(t.due) < now).length

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex flex-col gap-5 w-80 border border-blue-500/20">
          <h2 className="text-2xl font-bold text-blue-400 text-center mb-2">Login Admin</h2>
          <input required className="p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input required className="p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.5)]">Masuk</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-400 shadow-blue-500 drop-shadow-md">Dashboard Jadwal Nic-Yue</h1>
        
        {/* Statistik */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <h3 className="text-blue-300 font-medium z-10 relative">Tugas Pending</h3>
            <p className="text-5xl font-bold text-blue-500 mt-2 z-10 relative">{pendingCount}</p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <h3 className="text-red-300 font-medium z-10 relative">Tugas Overdue</h3>
            <p className="text-5xl font-bold text-red-500 mt-2 z-10 relative">{overdueCount}</p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
        </div>

        {/* Form Tambah */}
        <form onSubmit={addTask} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-5">
          <h2 className="text-xl font-bold text-blue-400">Tambah Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Judul Tugas" className="p-3 rounded-lg bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <input required placeholder="Subject / Mata Kuliah" className="p-3 rounded-lg bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} />
            <input type="datetime-local" required className="p-3 rounded-lg bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={newTask.due} onChange={e => setNewTask({...newTask, due: e.target.value})} />
            <select className="p-3 rounded-lg bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
              <option>High Priority</option>
              <option>Medium Priority</option>
              <option>Low Priority</option>
            </select>
          </div>
          <textarea required placeholder="Deskripsi Tugas..." className="w-full p-3 rounded-lg bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" value={newTask.desc} onChange={e => setNewTask({...newTask, desc: e.target.value})} />
          <button className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.4)]">Tambahkan Tugas</button>
        </form>

        {/* Daftar Tugas */}
        <div className="space-y-4">
          {tasks.sort((a,b) => new Date(a.due) - new Date(b.due)).map(t => {
            const isOverdue = new Date(t.due) < now;
            return (
              <div key={t.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center transition hover:border-blue-500/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-blue-300 text-lg">{t.title}</h4>
                    <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{t.subject}</span>
                    <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{t.priority}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{t.desc}</p>
                  <div className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    Due: {new Date(t.due).toLocaleString('id-ID')} {isOverdue && '(Lewat Deadline!)'}
                  </div>
                </div>
                <button onClick={() => hapusTask(t.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 px-4 rounded-lg text-sm font-bold transition-all">Hapus</button>
              </div>
            )
          })}
          {tasks.length === 0 && <p className="text-slate-500 text-center py-10">Belum ada tugas. Baguslah kalau lagi santai.</p>}
        </div>
      </div>
    </div>
  )
}