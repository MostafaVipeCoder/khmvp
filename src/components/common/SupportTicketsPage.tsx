
import { useState } from 'react';
import SupportTicketList from './SupportTicketList';
import SupportTicketChat from './SupportTicketChat';
import CreateTicketForm from './CreateTicketForm';

interface SupportTicketsPageProps {
  onBack: () => void;
}

export default function SupportTicketsPage({ onBack }: SupportTicketsPageProps) {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  return (
    <div>
      {view === 'list' ? (
        <SupportTicketList
          onTicketSelect={(id) => {
            setSelectedTicketId(id);
            setView('chat');
          }}
          onCreateTicket={() => setCreateFormOpen(true)}
        />
      ) : selectedTicketId ? (
        <SupportTicketChat
          ticketId={selectedTicketId}
          onBack={() => setView('list')}
        />
      ) : null}

      <CreateTicketForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSuccess={(ticketId) => {
          setSelectedTicketId(ticketId);
          setView('chat');
        }}
      />
    </div>
  );
}
