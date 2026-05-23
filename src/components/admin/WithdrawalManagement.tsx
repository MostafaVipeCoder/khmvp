import { View, Text } from '../../tw';
import { useState, useEffect } from 'react';
import { walletService } from '@/services/wallet';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
import { Loader2, Check, X, User, Phone, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '../../stores/useAuthStore';

interface WithdrawalManagementProps {
    language: Language;
}

const translations = {
    ar: {
        title: 'إدارة طلبات السحب',
        noRequests: 'لا توجد طلبات سحب معلقة',
        sitter: 'الخالة',
        amount: 'المبلغ',
        date: 'التاريخ',
        actions: 'الإجراءات',
        approve: 'قبول',
        reject: 'رفض',
        confirmApprove: 'هل أنت متأكد من قبول عملية السحب؟',
        confirmReject: 'هل أنت متأكد من رفض عملية السحب؟',
        successApprove: 'تم قبول السحب بنجاح',
        successReject: 'تم رفض السحب',
        egp: 'جنيه',
        pending: 'معلق'
    },
    en: {
        title: 'Withdrawal Management',
        noRequests: 'No pending withdrawal requests',
        sitter: 'Sitter',
        amount: 'Amount',
        date: 'Date',
        actions: 'Actions',
        approve: 'Approve',
        reject: 'Reject',
        confirmApprove: 'Are you sure you want to approve this withdrawal?',
        confirmReject: 'Are you sure you want to reject this withdrawal?',
        successApprove: 'Withdrawal approved successfully',
        successReject: 'Withdrawal rejected',
        egp: 'EGP',
        pending: 'Pending'
    }
};

export default function WithdrawalManagement({ language }: WithdrawalManagementProps) {
    const t = translations[language];
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await walletService.getAllPendingWithdrawals();
            setRequests(data);
        } catch (error) {
            console.error('Error loading withdrawals:', error);
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'completed' | 'failed') => {
        const confirmMsg = status === 'completed' ? t.confirmApprove : t.confirmReject;
        if (!confirm(confirmMsg)) return;

        try {
            setProcessingId(id);
            await walletService.updateTransactionStatus(id, status);
            toast.success(status === 'completed' ? t.successApprove : t.successReject);
            loadRequests();
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            toast.error('Failed to process withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <View className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FB5E7A]" />
            </View>
        );
    }

    return (
        <View className="max-w-6xl mx-auto p-4">
            {/* Sticky Header */}
            <View className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <Text className="text-[#FB5E7A] text-2xl font-bold">{t.title}</Text>
            </View>

            {requests.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <Text>{t.noRequests}</Text>
                </Card>
            ) : (
                <View className="grid gap-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="p-6">
                            <View className="flex flex-wrap items-center justify-between gap-4">
                                <View className="flex items-center gap-4">
                                    <View className="w-12 h-12 rounded-full bg-[#FB5E7A]/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-[#FB5E7A]" />
                                    </View>
                                    <View>
                                        <Text className="font-bold">{request.profiles?.full_name || 'Unknown Sitter'}</Text>
                                        <View className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <Text className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {request.profiles?.phone || 'N/A'}
                                            </Text>
                                            <Text className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex items-center gap-8">
                                    <View className="text-right">
                                        <Text className="text-sm text-gray-500">{t.amount}</Text>
                                        <Text className="text-xl font-bold text-[#FB5E7A]">{request.amount} {t.egp}</Text>
                                    </View>

                                    <View className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onPress={() => handleAction(request.id, 'completed')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === request.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            {t.approve}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onPress={() => handleAction(request.id, 'failed')}
                                            disabled={!!processingId}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            {t.reject}
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            )}
        </View>
    );
}
