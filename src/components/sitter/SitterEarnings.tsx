import { View, Text } from '../../tw';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard, Download, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Language } from '../../App';
import { useAuthStore } from '../../stores/useAuthStore';
import { walletService, type Transaction } from '../../services/wallet';
import { toast } from 'sonner';

interface SitterEarningsProps {
  language: Language;
}

const translations = {
  ar: {
    earnings: 'أرباحي',
    totalBalance: 'الرصيد الكلي',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    withdraw: 'سحب الأموال',
    history: 'سجل المعاملات',
    earning: 'إيداع',
    withdrawal: 'سحب',
    completed: 'مكتمل',
    pending: 'قيد المعالجة',
    failed: 'فشل',
    egp: 'جنيه',
    date: 'التاريخ',
    amount: 'المبلغ',
    status: 'الحالة',
    noTransactions: 'لا توجد معاملات',
    stats: 'الإحصائيات',
    totalEarnings: 'إجمالي الأرباح',
    totalWithdrawals: 'إجمالي السحوبات',
    availableBalance: 'الرصيد المتاح',
    downloadReport: 'تحميل التقرير',
    jobPayment: 'دفعة عن جلسة',
    withdrawalTo: 'سحب إلى',
    confirmWithdrawal: 'تأكيد السحب',
    enterAmount: 'أدخل المبلغ المراد سحبه',
    insufficientBalance: 'رصيد غير كافي',
    successWithdrawal: 'تم تقديم طلب السحب بنجاح'
  },
  en: {
    earnings: 'Earnings',
    totalBalance: 'Total Balance',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    withdraw: 'Withdraw',
    history: 'Transaction History',
    earning: 'Earning',
    withdrawal: 'Withdrawal',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    egp: 'EGP',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    noTransactions: 'No transactions',
    stats: 'Statistics',
    totalEarnings: 'Total Earnings',
    totalWithdrawals: 'Total Withdrawals',
    availableBalance: 'Available Balance',
    downloadReport: 'Download Report',
    jobPayment: 'Payment for job',
    withdrawalTo: 'Withdrawal to',
    confirmWithdrawal: 'Confirm Withdrawal',
    enterAmount: 'Enter amount to withdraw',
    insufficientBalance: 'Insufficient balance',
    successWithdrawal: 'Withdrawal request submitted successfully'
  }
};

export default function SitterEarnings({ language }: SitterEarningsProps) {
  const t = translations[language];
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);
      const [txs, bal] = await Promise.all([
        walletService.getTransactions(user.id),
        walletService.getBalance(user.id)
      ]);
      setTransactions(txs);
      setBalance(bal);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amountStr = prompt(t.enterAmount);
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    if (amount > balance) {
      toast.error(t.insufficientBalance);
      return;
    }

    try {
      if (!user?.id) return;
      setIsWithdrawing(true);
      await walletService.requestWithdrawal(user.id, amount);
      toast.success(t.successWithdrawal);
      loadWalletData(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error('Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Calculate Stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const thisMonthEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed' && new Date(t.created_at).getMonth() === currentMonth)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lastMonthEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed' && new Date(t.created_at).getMonth() === lastMonth)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status !== 'failed') // Include pending for display roughly
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <View className="max-w-4xl mx-auto px-4 pb-8">
      {/* Sticky Header */}
      <View className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex items-center justify-between">
          <Text className="text-[#FB5E7A] text-2xl font-bold">{t.earnings}</Text>
          <Button
            className="bg-[#FB5E7A] hover:bg-[#e5536e]"
            onPress={handleWithdraw}
            disabled={isWithdrawing || balance <= 0}
          >
            {isWithdrawing ? <Loader2 className="animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            {t.withdraw}
          </Button>
        </View>
      </View>

      {/* Balance Card */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-[#FB5E7A] to-[#e5536e] text-white">
        <View className="flex items-center justify-between mb-4">
          <View>
            <Text className="text-white/80 mb-1">{t.availableBalance}</Text>
            <Text className="text-white text-4xl">{balance} {t.egp}</Text>
          </View>
          <View className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </View>
        </View>

        <View className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <View>
            <Text className="text-white/80 text-sm mb-1">{t.thisMonth}</Text>
            <Text className="text-xl">{thisMonthEarnings} {t.egp}</Text>
          </View>
          <View>
            <Text className="text-white/80 text-sm mb-1">{t.lastMonth}</Text>
            <Text className="text-xl">{lastMonthEarnings} {t.egp}</Text>
          </View>
        </View>
      </Card>

      {/* Stats */}
      <View className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.totalEarnings}</Text>
              <Text className="text-green-600">+{thisMonthEarnings} {t.egp}</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </View>
          </View>
        </Card>

        <Card className="p-4">
          <View className="flex items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.totalWithdrawals}</Text>
              <Text className="text-red-600">-{totalWithdrawals} {t.egp}</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </View>
          </View>
        </Card>
      </View>

      {/* Transaction History */}
      <Card className="p-6">
        <View className="flex items-center justify-between mb-4">
          <Text>{t.history}</Text>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t.downloadReport}
          </Button>
        </View>

        {isLoading ? (
          <View className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
          </View>
        ) : transactions.length === 0 ? (
          <View className="text-center py-12 text-gray-500">
            {t.noTransactions}
          </View>
        ) : (
          <View className="space-y-3">
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <View className="flex items-center gap-3">
                  <View className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'earning'
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-red-100 dark:bg-red-900'
                    }`}>
                    {transaction.type === 'earning' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-red-600" />
                    )}
                  </View>
                  <View>
                    <Text className="text-sm mb-1">{transaction.description}</Text>
                    <View className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <Text>{new Date(transaction.created_at).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
                <View className="text-right">
                  <View className={`mb-1 ${transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {transaction.type === 'earning' ? '+' : '-'}{transaction.amount} {t.egp}
                  </View>
                  <Badge
                    className={
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700'
                    }
                  >
                    {t[transaction.status as keyof typeof t]}
                  </Badge>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}
