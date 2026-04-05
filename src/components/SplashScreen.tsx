

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
                {/* Placeholder for Logo - User can replace this div or the SVG inside it */}
                <div className="h-40 w-40 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-lg p-4 backdrop-blur-sm">
                    <img src="logo.png" alt="" />
                </div>
                <h1 className="text-3xl font-bold text-primary tracking-wider">اهلا في اسرة خالة العيال</h1>
            </div>
        </div>
    );
};

export default SplashScreen;
