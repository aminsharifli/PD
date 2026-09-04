import { Archive, FilePlus2 } from 'lucide-react'
import RiceBadge from './RiceBadge'
import { ORG } from '../constants'

export default function HomeScreen({ onNavigate }) {
  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-4 py-12">
      <section className="home-enter w-full max-w-2xl text-center">
        <RiceBadge className="mx-auto h-28 w-28" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.38em] text-[#c9a24b]">{ORG.server}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">LSPD Dosya Merkezi</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">
          Soruşturma dosyalarını oluşturun, güvenle saklayın ve ihtiyaç duyduğunuzda yeniden inceleyin.
        </p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <button onClick={() => onNavigate('create')} className="group rounded-xl border border-[#c9a24b]/50 bg-[#c9a24b] p-6 text-left text-[#0a0f1a] shadow-xl shadow-[#c9a24b]/10 transition duration-200 hover:-translate-y-1 hover:bg-[#dbb463]">
            <FilePlus2 className="h-7 w-7" />
            <span className="mt-7 block text-lg font-bold">Dosya Oluştur</span>
            <span className="mt-1 block text-sm opacity-75">Yeni vaka dosyası hazırla</span>
          </button>
          <button onClick={() => onNavigate('archive')} className="group rounded-xl border border-slate-700 bg-[#0d1626] p-6 text-left text-slate-100 shadow-xl transition duration-200 hover:-translate-y-1 hover:border-sky-500/60 hover:bg-[#111d31]">
            <Archive className="h-7 w-7 text-sky-400" />
            <span className="mt-7 block text-lg font-bold">Kayıtlı Dosyalar</span>
            <span className="mt-1 block text-sm text-slate-400">Arşivi görüntüle ve yönet</span>
          </button>
        </div>
      </section>
    </main>
  )
}
