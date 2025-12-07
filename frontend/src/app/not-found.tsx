import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center space-y-8 max-w-md">
                {/* 404 Visual */}
                <div className="space-y-4">
                    <h1 className="text-8xl md:text-9xl font-bold text-muted-foreground/20">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
