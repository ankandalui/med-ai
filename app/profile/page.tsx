"use client";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Manage your profile and account settings
        </p>
        <div className="pt-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              🚧 Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
