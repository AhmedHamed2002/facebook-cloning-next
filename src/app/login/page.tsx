import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="flex px-5 flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
        {/* Left Side: Branding */}
        <div className="text-center md:text-left mb-8 md:mb-0 md:mr-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600">facebook</h1>
            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
            Connect with friends and the world around you on Facebook.
            </p>
        </div>

        {/* Right Side: Form */}
        <LoginForm />
        </div>
    );
}
