export interface User {
    id: string;
    name: string;
    email: string;
    contact_number: string;
    role: string;
    avatar: string;
    status: string;
    theme: "LIGHT" | "DARK";
    language: string;
    currency: string;
    pin: string;
    is_pin_enabled: boolean;
}