export interface User {
    id: string;
    name: string;
    email: string;
    contact_number: string;
    role: string;
    avatar: string;
    status: string;
    theme: "LIGHT" | "DARK" | "SYSTEM";
    language: string;
    currency: string;
    push_notification: boolean;
}