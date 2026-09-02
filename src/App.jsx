import React, { useMemo, useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import RiceBadge from './components/RiceBadge'
import { exportNodeToPng } from './lib/exportImage'
import { fileToDataUrl, generateCaseId, nowParts, uid } from './lib/helpers'
import { DOC_TYPES, ORG, STATUS_OPTIONS } from './constants'

export default function App() {
  const initial = useMemo(() => {
    const { date, time } = nowParts()
    return {
      docType: DOC_TYPES[0].value,
      caseId: generateCaseId(),
      date,
      time,
      officerName: '',
      badgeNumber: '',
      suspects: '',
      sectionTitle: '',
      narrative: '',
      charges: '',
      status: STATUS_OPTIONS[0].value,
    }
  }, [])

  const [form, setForm] = useState(initial)
  const [evidence, setEvidence] = useState([])
  const [busy, setBusy] = useState(false)
  const previewRef = useRef(null)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const addFiles = async (fileList) => {
    const images = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    const items = await Promise.all(
      images.map(async (file) => ({
        id: uid(),
        src: await fileToDataUrl(file),
        caption: '',
        name: file.name,
      })),
    )
    setEvidence((prev) => [...prev, ...items])
  }

  const updateCaption = (id, caption) =>
    setEvidence((prev) => prev.map((e) => (e.id === id ? { ...e, caption } : e)))

  const removeEvidence = (id) => setEvidence((prev) => prev.filter((e) => e.id !== id))

  const handleDownload = async () => {
    setBusy(true)
    try {
      await exportNodeToPng(previewRef.current, `${form.caseId || 'LSPD-DOSYA'}.png`)
    } catch (err) {
      console.error(err)
      alert('PNG oluşturulurken bir hata oluştu. Konsolu kontrol edin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0a0f1a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <RiceBadge className="h-9 w-auto shrink-0" />
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                {ORG.headerTitle} · Dosya Oluşturucu
              </h1>
              <p className="text-[11px] text-slate-400">{ORG.subtitle}</p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2547a8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PNG OLARAK İNDİR
          </button>
        </div>
      </header>

      {}
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:p-6">
        <FormPanel
          form={form}
          setField={setField}
          onRegenerateId={() => setField('caseId', generateCaseId())}
          evidence={evidence}
          addFiles={addFiles}
          updateCaption={updateCaption}
          removeEvidence={removeEvidence}
          onDownload={handleDownload}
          busy={busy}
        />

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              CANLI ÖNİZLEME
            </span>
            <span className="text-[11px] text-slate-500">~2460 px genişlik · PNG · 3×</span>
          </div>

          <div
            className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 lg:p-8"
            style={{
              backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          >
            <div className="mx-auto w-fit">
              <DocumentPreview ref={previewRef} form={form} evidence={evidence} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
