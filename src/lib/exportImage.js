import html2canvas from 'html2canvas'

/**
 * Renders a single DOM node to a high-resolution PNG and triggers a download.
 * Only the passed node is captured — form controls in the left panel are never included.
 *
 * @param {HTMLElement} node      The document container (right panel preview root).
 * @param {string}      fileName  Desired download file name.
 */
export async function exportNodeToPng(node, fileName = 'lspd-case-file.png') {
  if (!node) throw new Error('Preview node was not found.')

  // Make sure custom fonts are ready so text metrics match the on-screen preview.
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* non-blocking */
    }
  }

  const canvas = await html2canvas(node, {
    backgroundColor: '#0f172a',
    scale: 3, // ~2460px wide export — crisp on Discord at any zoom
    useCORS: true,
    imageTimeout: 15000,
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  })

  const dataUrl = canvas.toDataURL('image/png', 1.0)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName.toLowerCase().endsWith('.png') ? fileName : `${fileName}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
