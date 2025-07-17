type AppErrorConstructorArgs = {
    message: string;
    status?: number;
    title?: string;
    description?: string;
}

export class AppError extends Error {
    status: number;
    title: string;
    description: string;
    
    constructor({ message, status = 500, title = "Something went wrong", description = "An error occurred. Please try again." }: AppErrorConstructorArgs) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.title = title;
        this.description = description;
    }
}
