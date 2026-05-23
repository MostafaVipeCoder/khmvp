import { View, Text, Image } from '../tw';

const SplashScreen = () => {
    return (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <View className="flex flex-col items-center gap-4">
                {/* Placeholder for Logo */}
                <View className="h-40 w-40 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-lg p-4 backdrop-blur-sm">
                    <Image source={require('../../public/logo.png')} className="w-full h-full" />
                </View>
                <Text className="text-3xl font-bold text-primary tracking-wider">اهلا في اسرة خالة العيال</Text>
            </View>
        </View>
    );
};

export default SplashScreen;
