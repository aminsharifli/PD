import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Archive, FilePlus2, Home, Pencil } from 'lucide-react'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import RiceBadge from './components/RiceBadge'
import SplashScreen from './components/SplashScreen'
import HomeScreen from './components/HomeScreen'
import ArchivePanel from './components/ArchivePanel'
import Toast from './components/Toast'
import { exportNodeToPng } from './lib/exportImage'
import { deleteCaseFile, fromApiCaseFile, listCaseFiles, saveCaseFile, toApiCaseFile, updateCaseFile, updateCaseFileStatus } from './lib/caseFilesApi'
import { fileToDataUrl, generateCaseId, nowParts, uid } from './lib/helpers'
import { DOC_TYPES, ORG, STATUS_OPTIONS } from './constants'

function createInitialForm() {
  const { date, time } = nowParts()
  return { docType: DOC_TYPES[0].value, caseId: generateCaseId(), date, time, officerName: '', badgeNumber: '', suspects: '', sectionTitle: '', narrative: '', charges: '', status: STATUS_OPTIONS[0].value }
}

export default function App() {
  const initial = useMemo(createInitialForm, [])
  const [form, setForm] = useState(initial), [evidence, setEvidence] = useState([]), [view, setView] = useState('home')
  const [splashLeaving, setSplashLeaving] = useState(false), [showSplash, setShowSplash] = useState(true)
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [archive, setArchive] = useState([])
  const [archiveLoading, setArchiveLoading] = useState(false), [archiveError, setArchiveError] = useState(''), [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(''), [clearAfterSave, setClearAfterSave] = useState(false)
  const previewRef = useRef(null)

  useEffect(() => { const a = setTimeout(() => setSplashLeaving(true), 1600), b = setTimeout(() => setShowSplash(false), 2150); return () => { clearTimeout(a); clearTimeout(b) } }, [])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer) }, [toast])
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const loadArchive = async () => { setArchiveLoading(true); setArchiveError(''); try { setArchive(await listCaseFiles()) } catch (error) { setArchiveError(`Arşiv yüklenemedi: ${error.message}`) } finally { setArchiveLoading(false) } }
  const navigate = (next) => { setView(next); if (next === 'archive') loadArchive() }
  const addFiles = async (fileList) => { const images = Array.from(fileList || []).filter((file) => file.type.startsWith('image/')); if (!images.length) return; const items = await Promise.all(images.map(async (file) => ({ id: uid(), src: await fileToDataUrl(file), caption: '', name: file.name }))); setEvidence((previous) => [...previous, ...items]) }
  const startNewFile = () => { setForm(createInitialForm()); setEvidence([]); setEditingId(null) }
  const saveToSystem = async () => {
    setSaving(true)
    try {
      const payload = await toApiCaseFile(form, evidence)
      if (editingId) await updateCaseFile(editingId, payload)
      else await saveCaseFile(payload)
      return true
    } catch (error) {
      if (error.status === 413) {
        alert('Yüklenen görsellerin boyutu çok büyük. Lütfen daha küçük bir görsel yükleyin veya görseli kaldırıp tekrar deneyin.')
      } else {
        alert(`Dosya kaydedilemedi: ${error.message}`)
      }
      return false
    } finally {
      setSaving(false)
    }
  }
  const handleSave = async () => { const saved = await saveToSystem(); if (!saved) return; setToast(editingId ? 'Dosya başarıyla güncellendi!' : 'Başarıyla Sisteme Kaydedildi!'); if (clearAfterSave) startNewFile() }
  const handleDownload = async () => { const saved = await saveToSystem(); if (!saved) return; setBusy(true); try { await exportNodeToPng(previewRef.current, `${form.caseId || 'LSPD-DOSYA'}.png`); setToast('Başarıyla İndirildi!') } catch (error) { console.error(error); alert('PNG oluşturulurken bir hata oluştu.') } finally { setBusy(false) } }
  const openCaseFile = (file) => { const loaded = fromApiCaseFile(file); setForm(loaded.form); setEvidence(loaded.evidence); setEditingId(file.id); setView('inspect') }
  const removeCaseFile = async (file) => { if (!window.confirm(`${file.caseId || 'Bu dosya'} kalıcı olarak silinsin mi?`)) return; setDeletingId(file.id); try { await deleteCaseFile(file.id); setArchive((current) => current.filter((item) => item.id !== file.id)) } catch (error) { alert(`Dosya silinemedi: ${error.message}`) } finally { setDeletingId(null) } }
  const changeCaseFileStatus = async (file, status) => {
    if (status === file.status) return
    setUpdatingId(file.id)
    try {
      const updated = await updateCaseFileStatus(file.id, status)
      setArchive((current) => current.map((item) => item.id === file.id ? { ...item, ...updated, status } : item))
      setToast('Dosya durumu güncellendi!')
    } catch (error) {
      alert(`Dosya durumu güncellenemedi: ${error.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  return <div className="min-h-screen bg-[#0a0f1a]">
    {showSplash && <SplashScreen leaving={splashLeaving} />}
    <Toast message={toast} onClose={() => setToast('')} />
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0a0f1a]/90 backdrop-blur"><div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
      <button onClick={() => navigate('home')} className="flex items-center gap-3 text-left"><RiceBadge className="h-9 w-auto shrink-0" /><div className="hidden sm:block"><h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white">{ORG.headerTitle}</h1><p className="text-[11px] text-slate-400">Dosya Yönetim Merkezi</p></div></button>
      <nav className="ml-auto flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-1" aria-label="Ana navigasyon">{[['home', Home, 'Ana Sayfa'], ['create', FilePlus2, 'Dosya Oluştur'], ['archive', Archive, 'Arşiv']].map(([id, Icon, label]) => <button key={id} onClick={() => navigate(id)} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${view === id ? 'bg-[#1e3a8a] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon className="h-4 w-4" /><span className="hidden md:inline">{label}</span></button>)}</nav>
    </div></header>
    {view === 'home' && <HomeScreen onNavigate={navigate} />}
    {view === 'archive' && <ArchivePanel files={archive} loading={archiveLoading} error={archiveError} onRefresh={loadArchive} onOpen={openCaseFile} onDelete={removeCaseFile} onStatusChange={changeCaseFileStatus} deletingId={deletingId} updatingId={updatingId} />}
    {view === 'inspect' && <main className="mx-auto max-w-[1000px] p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a24b]">Dosya İnceleme</p><h2 className="mt-1 text-xl font-bold text-white">{form.caseId || 'Dosya'}</h2></div><button onClick={() => setView('create')} className="inline-flex items-center gap-2 rounded-md border border-[#c9a24b]/60 bg-[#c9a24b]/10 px-4 py-2 text-sm font-bold text-[#e6c36f] transition hover:bg-[#c9a24b]/20"><Pencil className="h-4 w-4" /> Düzenle</button></div><section className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 sm:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview form={form} evidence={evidence} /></div></section></main>}
    {view === 'create' && <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:p-6"><FormPanel form={form} setField={setField} onRegenerateId={() => setField('caseId', generateCaseId())} evidence={evidence} addFiles={addFiles} updateCaption={(id, caption) => setEvidence((current) => current.map((item) => item.id === id ? { ...item, caption } : item))} removeEvidence={(id) => setEvidence((current) => current.filter((item) => item.id !== id))} onDownload={handleDownload} onSave={handleSave} onNewFile={startNewFile} busy={busy} saving={saving} clearAfterSave={clearAfterSave} setClearAfterSave={setClearAfterSave} isEditing={Boolean(editingId)} /><section className="min-w-0"><div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">CANLI ÖNİZLEME</span><span className="text-[11px] text-slate-500">~2460 px genişlik · PNG · 3×</span></div><div className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 lg:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview ref={previewRef} form={form} evidence={evidence} /></div></div></section></main>}
  </div>
}
