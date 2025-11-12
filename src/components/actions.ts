export async function copyText(value: string): Promise<boolean> {
  if (!value) return false

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const temp = document.createElement('textarea')
  temp.value = value
  temp.setAttribute('readonly', 'true')
  temp.setAttribute('aria-hidden', 'true')
  temp.style.position = 'absolute'
  temp.style.left = '-9999px'
  document.body.appendChild(temp)
  temp.select()
  const success = document.execCommand('copy')
  temp.remove()
  return success
}

export function downloadText(value: string, filename = 'formatted.json'): void {
  if (!value) return
  const blob = new Blob([value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
