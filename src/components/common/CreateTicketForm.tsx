
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '../ui/sheet';
import { supportTicketService } from '../../services/supportTickets';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from 'sonner';

interface CreateTicketFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
}

export default function CreateTicketForm({ open, onClose, onSuccess }: CreateTicketFormProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !category || !subject || !description) return;

    setLoading(true);
    try {
      const ticket = await supportTicketService.createTicket({
        user_id: user.id,
        user_type: user.userType || 'client',
        category: category as any,
        priority: priority as any,
        subject,
        description,
      });
      toast.success('Ticket created successfully!');
      onSuccess(ticket.id);
      onClose();
      setSubject('');
      setDescription('');
      setCategory('');
      setPriority('medium');
    } catch (err) {
      toast.error('Failed to create ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Create Support Ticket</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="account">Account Issue</SelectItem>
                <SelectItem value="payment">Payment Issue</SelectItem>
                <SelectItem value="booking">Booking Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={6}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]" disabled={loading}>
            {loading ? 'Creating...' : 'Submit Ticket'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
