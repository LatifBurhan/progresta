/**
 * WhatsApp text formatting utilities
 * Generates formatted text for easy copy-paste to WhatsApp groups
 */

interface ProjectDetail {
  projectId: string
  task: string
  progress: string
  issue: string
  hoursSpent: number
}

interface WhatsAppTextOptions {
  period: string
  location: string
  projectDetails: ProjectDetail[]
  projects: Array<{ id: string; name: string }>
}

export function generateWhatsAppText(options: WhatsAppTextOptions): string {
  const { period, location, projectDetails, projects } = options
  
  // Get current date in Jakarta timezone
  const now = new Date()
  const jakartaTime = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now)

  const currentTime = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)

  let text = `📌 *LAPORAN PROGRES KERJA*\n`
  text += `🕒 ${jakartaTime} | ${currentTime} WIB\n`
  text += `⏰ Periode: ${period}\n`
  text += `📍 Lokasi: ${location}\n\n`

  // Add project details
  projectDetails.forEach((detail, index) => {
    const project = projects.find(p => p.id === detail.projectId)
    const projectName = project?.name || 'Unknown Project'
    
    text += `👨‍💻 *Project ${index + 1}: ${projectName}*\n`
    text += `📝 Yang Dikerjakan:\n${detail.task}\n\n`
    text += `✅ Progress/Hasil:\n${detail.progress}\n\n`
    
    if (detail.issue.trim()) {
      text += `⚠️ Kendala:\n${detail.issue}\n\n`
    }
    
    text += `⏱️ Waktu: ${detail.hoursSpent} jam\n`
    
    if (index < projectDetails.length - 1) {
      text += `\n${'─'.repeat(30)}\n\n`
    }
  })

  // Add total hours
  const totalHours = projectDetails.reduce((sum, detail) => sum + detail.hoursSpent, 0)
  text += `\n📊 *Total Jam Kerja: ${totalHours} jam*\n`
  
  // Add issues summary if any
  const hasIssues = projectDetails.some(detail => detail.issue.trim())
  if (hasIssues) {
    text += `🚨 *Status: Ada Kendala*\n`
  } else {
    text += `✅ *Status: Lancar*\n`
  }

  text += `\n#ProgresKerja #AlWustho`

  return text
}
export function formatTimeForWhatsApp(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateForWhatsApp(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function generateSimpleWhatsAppText(
  period: string, 
  location: string, 
  summary: string
): string {
  const now = new Date()
  const time = formatTimeForWhatsApp(now)
  const date = formatDateForWhatsApp(now)
  
  return `📌 *LAPORAN PROGRES*
🕒 ${date} | ${time} WIB
⏰ ${period}
📍 ${location}

${summary}

#ProgresKerja #AlWustho`
}