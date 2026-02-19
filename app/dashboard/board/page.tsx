'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials, formatPhoneNumber } from '@/lib/utils'
import { format } from 'date-fns'
import { useRealtimeContacts } from '@/hooks/useRealtimeContacts'

type Label = {
  id: string
  name: string
  color: string
  order: number
}

// Use Contact type from hook
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

export default function BoardPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  
  // Use real-time hook for contacts
  const { contacts, setContacts } = useRealtimeContacts()

  useEffect(() => {
    fetchLabels()
  }, [])

  const fetchLabels = async () => {
    const res = await fetch('/api/labels')
    const data = await res.json()
    setLabels(data)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const contact = contacts.find((c) => c.id === event.active.id)
    if (contact) {
      setActiveContact(contact as unknown as Contact)
    } else {
      setActiveContact(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveContact(null)

    if (!over) return

    const contactId = active.id as string
    const newLabelId = over.id as string

    const contact = contacts.find((c) => c.id === contactId)
    if (!contact || contact.label.id === newLabelId) return

    // Optimistic update - update UI immediately
    const previousContacts = [...contacts]
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, label: { ...c.label, id: newLabelId } } : c))
    )

    try {
      // Send update to server
      const res = await fetch(`/api/contacts/${contactId}/label`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelId: newLabelId }),
      })

      if (!res.ok) {
        // Revert on error
        setContacts(previousContacts)
        console.error('Update label error')
      }
    } catch (error) {
      // Revert on error
      setContacts(previousContacts)
      console.error('Update label error:', error)
    }
  }

  const getContactsByLabel = (labelId: string) => {
    return contacts.filter((c) => c.label.id === labelId)
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-[calc(100vh-120px)] overflow-x-auto">
          {labels.map((label) => (
            <KanbanColumn
              key={label.id}
              label={label}
              contacts={getContactsByLabel(label.id) as any}
            />
          ))}
        </div>

        <DragOverlay>
          {activeContact && <ContactCard contact={activeContact} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ label, contacts }: { label: Label; contacts: Contact[] }) {
  const { useDroppable } = require('@dnd-kit/core')
  const { setNodeRef } = useDroppable({ id: label.id })

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
        <div
          className="p-4 border-b"
          style={{ borderTopColor: label.color, borderTopWidth: 3 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{label.name}</h3>
            <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded">
              {contacts.length}
            </span>
          </div>
        </div>

        <ScrollArea ref={setNodeRef} className="flex-1 p-4">
          <div className="space-y-3">
            {contacts.map((contact) => (
              <DraggableContact key={contact.id} contact={contact} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function DraggableContact({ contact }: { contact: Contact }) {
  const { useDraggable } = require('@dnd-kit/core')
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: contact.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ContactCard contact={contact} />
    </div>
  )
}

function ContactCard({
  contact,
  isDragging = false,
}: {
  contact: Contact
  isDragging?: boolean
}) {
  const lastMessage = contact.messages[0]

  return (
    <Card
      className={`p-3 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.profilePic || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(contact.name || contact.phoneNumber)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {contact.name || formatPhoneNumber(contact.phoneNumber)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatPhoneNumber(contact.phoneNumber)}
          </p>
          {lastMessage && (
            <>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {lastMessage.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(lastMessage.timestamp), 'dd MMM, HH:mm')}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
