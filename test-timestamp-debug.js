// Comprehensive timestamp debugging script
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugTimestamps() {
  console.log('🔍 TIMESTAMP DEBUG SCRIPT\n')
  console.log('='.repeat(60))
  
  // 1. Check Node.js timezone
  console.log('\n1️⃣ NODE.JS TIMEZONE CHECK')
  console.log('='.repeat(60))
  const now = new Date()
  console.log('Current time:', now.toISOString())
  console.log('Local time:', now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))
  console.log('TZ env var:', process.env.TZ || 'NOT SET')
  console.log('Timezone offset:', now.getTimezoneOffset(), 'minutes')
  
  // 2. Get contact
  console.log('\n2️⃣ FINDING TEST CONTACT')
  console.log('='.repeat(60))
  const contact = await prisma.contact.findFirst({
    where: { phoneNumber: '6285175434869' }
  })
  
  if (!contact) {
    console.error('❌ Contact not found: 6285175434869')
    await prisma.$disconnect()
    return
  }
  console.log('✅ Contact found:', contact.phoneNumber, '(ID:', contact.id, ')')
  
  // 3. Get all messages for this contact
  console.log('\n3️⃣ FETCHING MESSAGES FROM DATABASE')
  console.log('='.repeat(60))
  const messages = await prisma.message.findMany({
    where: { contactId: contact.id },
    orderBy: [
      { timestamp: 'asc' },
      { createdAt: 'asc' }
    ],
    select: {
      id: true,
      content: true,
      isFromContact: true,
      timestamp: true,
      createdAt: true,
    }
  })
  
  console.log(`Found ${messages.length} messages\n`)
  
  if (messages.length === 0) {
    console.log('⚠️ No messages found. Send some test messages first.')
    await prisma.$disconnect()
    return
  }
  
  // 4. Display messages with timestamps
  console.log('4️⃣ MESSAGE ORDER (as stored in DB)')
  console.log('='.repeat(60))
  messages.forEach((msg, i) => {
    const from = msg.isFromContact ? '👤 Contact' : '💬 You     '
    const timestamp = new Date(msg.timestamp)
    const utcTime = timestamp.toISOString()
    const wibTime = timestamp.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
    
    console.log(`${i + 1}. ${from} | ${utcTime} | ${wibTime} | ${msg.content?.substring(0, 30)}`)
  })
  
  // 5. Check if order is correct
  console.log('\n5️⃣ ORDER VALIDATION')
  console.log('='.repeat(60))
  let isCorrect = true
  let wrongIndexes = []
  
  for (let i = 1; i < messages.length; i++) {
    const prevTime = new Date(messages[i-1].timestamp).getTime()
    const currTime = new Date(messages[i].timestamp).getTime()
    
    if (prevTime > currTime) {
      isCorrect = false
      wrongIndexes.push(i)
      console.log(`❌ WRONG ORDER at index ${i}:`)
      console.log(`   Previous: ${messages[i-1].timestamp.toISOString()} (${messages[i-1].isFromContact ? 'Contact' : 'You'})`)
      console.log(`   Current:  ${messages[i].timestamp.toISOString()} (${messages[i].isFromContact ? 'Contact' : 'You'})`)
    }
  }
  
  if (isCorrect) {
    console.log('✅ All messages are in CORRECT chronological order!')
  } else {
    console.log(`\n❌ Found ${wrongIndexes.length} ordering issues`)
  }
  
  // 6. Check timezone consistency
  console.log('\n6️⃣ TIMEZONE CONSISTENCY CHECK')
  console.log('='.repeat(60))
  
  const contactMessages = messages.filter(m => m.isFromContact)
  const yourMessages = messages.filter(m => !m.isFromContact)
  
  console.log(`Contact messages: ${contactMessages.length}`)
  if (contactMessages.length > 0) {
    const firstContact = new Date(contactMessages[0].timestamp)
    console.log(`  First: ${firstContact.toISOString()}`)
    console.log(`  Hour: ${firstContact.getUTCHours()}:${firstContact.getUTCMinutes()} UTC`)
  }
  
  console.log(`\nYour messages: ${yourMessages.length}`)
  if (yourMessages.length > 0) {
    const firstYours = new Date(yourMessages[0].timestamp)
    console.log(`  First: ${firstYours.toISOString()}`)
    console.log(`  Hour: ${firstYours.getUTCHours()}:${firstYours.getUTCMinutes()} UTC`)
  }
  
  // 7. Recommendations
  console.log('\n7️⃣ RECOMMENDATIONS')
  console.log('='.repeat(60))
  
  if (!isCorrect) {
    console.log('❌ Messages are out of order. This causes grouping issue.')
    console.log('\n📋 Possible causes:')
    console.log('   1. Send message API not applying UTC conversion')
    console.log('   2. Server not restarted after code change')
    console.log('   3. Windows timezone issue (TZ=UTC not working)')
    
    console.log('\n🔧 Solutions:')
    console.log('   1. Restart Next.js dev server (npm run dev)')
    console.log('   2. Check send API logs for "📅 Converted to UTC"')
    console.log('   3. Run fix-timestamps.js to clean and recreate test data')
    console.log('   4. Deploy to production (Vercel) where TZ=UTC works')
  } else {
    console.log('✅ Database timestamps are correct!')
    console.log('✅ If browser still shows wrong order, check:')
    console.log('   1. Browser cache (hard refresh: Ctrl+Shift+R)')
    console.log('   2. API response in Network tab')
    console.log('   3. Client-side sorting in useRealtimeMessages hook')
  }
  
  await prisma.$disconnect()
}

debugTimestamps().catch(console.error)
