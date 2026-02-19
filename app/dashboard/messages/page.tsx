'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Image, Video } from 'lucide-react'
import { getInitials, formatPhoneNumber } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRealtimeContacts } from '@/hooks/useRealtimeContacts'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'

type Contact = {
  id: string
  waId: string
  name: string | null
  phoneNumber: string
  profilePic: string | null
  label: {
    id: string
    name: string
    color: string
  }
  messages: Array<{
    id: string
    content: string | null
    type: string
    timestamp: string
    isFromContact: boolean
  }>
}

type Message = {
  id: string
  content: string | null
  type: string
  mediaUrl: string | null
  caption: string | null
  timestamp: string
  isFromContact: boolean
  contactId: string
  sender: {
    email: string
    role: string
  } | null
}

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use real-time hooks instead of polling
  const { contacts, setContacts } = useRealtimeContacts()
  const { messages, setMessages } = useRealtimeMessages(selectedContact?.id || null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchLabels()
  }, [])

  const fetchLabels = async () => {
    const res = await fetch('/api/labels')
    const data = await res.json()
    setLabels(data)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact) return

    setLoading(true)
    
    // Optimistic update - add message to UI immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      type: 'TEXT',
      mediaUrl: null,
      caption: null,
      timestamp: new Date().toISOString(),
      isFromContact: false,
      contactId: selectedContact.id,
      sender: null,
    }
    
    setMessages((prev: any) => [...prev, optimisticMessage])
    const messageToSend = newMessage
    setNewMessage('') // Clear input immediately

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedContact.id,
          type: 'TEXT',
          content: messageToSend,
        }),
      })

      if (!res.ok) {
        // Remove optimistic message on error
        setMessages((prev: any) => prev.filter((m: any) => m.id !== optimisticMessage.id))
        setNewMessage(messageToSend) // Restore message
        console.error('Send message failed')
      }
      // Real-time hook will replace optimistic message with real one
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev: any) => prev.filter((m: any) => m.id !== optimisticMessage.id))
      setNewMessage(messageToSend) // Restore message
      console.error('Send message error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeLabel = async (contactId: string, labelId: string) => {
    // Find the new label info
    const newLabel = labels.find((l) => l.id === labelId)
    if (!newLabel) return

    // Optimistic update - update UI immediately
    const previousContacts = [...contacts]
    const previousSelectedContact = selectedContact

    // Update contacts list
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, labelId, label: { id: newLabel.id, name: newLabel.name, color: newLabel.color } }
          : c
      )
    )

    // Update selected contact if it's the one being changed
    if (selectedContact?.id === contactId) {
      setSelectedContact({
        ...selectedContact,
        label: { id: newLabel.id, name: newLabel.name, color: newLabel.color },
      })
    }

    try {
      const res = await fetch(`/api/contacts/${contactId}/label`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelId }),
      })

      if (!res.ok) {
        // Revert on error
        setContacts(previousContacts)
        setSelectedContact(previousSelectedContact)
        console.error('Change label failed')
      }
      // Real-time hook will sync with other tabs
    } catch (error) {
      // Revert on error
      setContacts(previousContacts)
      setSelectedContact(previousSelectedContact)
      console.error('Change label error:', error)
    }
  }

  return (
    <div className="flex h-full">
      {/* Contact List */}
      <div className="w-96 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>

        <ScrollArea className="flex-1">
          {contacts.map((contact) => {
            const lastMessage = contact.messages[0]
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={contact.profilePic || undefined} />
                    <AvatarFallback>
                      {getInitials(contact.name || contact.phoneNumber)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {contact.name || formatPhoneNumber(contact.phoneNumber)}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(lastMessage.timestamp), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.content || 'No messages'}
                    </p>
                    <Badge
                      className="mt-1"
                      style={{ backgroundColor: contact.label.color }}
                    >
                      {contact.label.name}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedContact.profilePic || undefined} />
                <AvatarFallback>
                  {getInitials(
                    selectedContact.name || selectedContact.phoneNumber
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedContact.name ||
                    formatPhoneNumber(selectedContact.phoneNumber)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPhoneNumber(selectedContact.phoneNumber)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Label:</span>
              <select
                value={selectedContact.label.id}
                onChange={(e) =>
                  handleChangeLabel(selectedContact.id, e.target.value)
                }
                className="border rounded-md px-3 py-1 text-sm"
              >
                {labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isFromContact ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isFromContact
                        ? 'bg-gray-100'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.type === 'TEXT' && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    {message.type === 'IMAGE' && (
                      <div>
                        <div className="bg-gray-200 rounded p-2 mb-2">
                          <Image className="w-6 h-6" />
                        </div>
                        {message.caption && (
                          <p className="text-sm">{message.caption}</p>
                        )}
                      </div>
                    )}
                    <span className="text-xs opacity-70 mt-1 block">
                      {format(new Date(message.timestamp), 'HH:mm', {
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-muted-foreground">Pilih contact untuk memulai chat</p>
        </div>
      )}
    </div>
  )
}
