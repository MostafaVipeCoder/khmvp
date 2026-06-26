
import { useState, useEffect } from 'react';
import { MessageCircle, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supportTicketService, type SupportTicket } from '../../services/supportTickets';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

interface SupportTicketListProps {
  onTicketSelect: (ticketId: string) => void;
  onCreateTicket: () => void;
}

export default function SupportTicketList({ onTicketSelect, onCreateTicket }: SupportTicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.id) {
      loadTickets();
    }
  }, [user?.id]);

  const loadTickets = async () => {
    if (!user?.id) return;
    try {
      const data = await supportTicketService.getUserTickets(user.id);
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'default' as const, icon: AlertCircle },
      in_progress: { label: 'In Progress', variant: 'secondary' as const, icon: Clock },
      waiting_response: { label: 'Waiting Your Response', variant: 'warning' as const, icon: Clock },
      resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle2 },
      closed: { label: 'Closed', variant: 'outline' as const, icon: CheckCircle2 },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'border-l-red-500' : priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500';
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Support Tickets</h2>
        <Button onClick={onCreateTicket} className="bg-[#FB5E7A] hover:bg-[#e5536e]">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">No Support Tickets Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first support ticket if you need help!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(ticket.priority)}`}
              onClick={() => onTicketSelect(ticket.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{ticket.subject}</CardTitle>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-xs text-gray-500 uppercase">{ticket.category}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(ticket.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
