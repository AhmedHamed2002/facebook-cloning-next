import { BASE_URL } from "@/lib/api";

const api = `${BASE_URL}/user`;

function getToken() {
    return localStorage.getItem("facebook_token");
}

export const userService = {
    async register(data: FormData): Promise<any> {
        const res = await fetch(`${api}/register`, {
        method: "POST",
        body: data,
        });
        return res.json();
    },

    async login(credentials: { email: string; password: string }): Promise<any> {
        const res = await fetch(`${api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        });
        return res.json();
    },

    async checkToken(): Promise<any> {
        const res = await fetch(`${api}/check`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getAllUsers(): Promise<any> {
        const res = await fetch(`${api}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getSingleUser(userId: string): Promise<any> {
        const res = await fetch(`${api}/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getUserImage(): Promise<any> {
        const res = await fetch(`${api}/image`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async search(query: string): Promise<any> {
        const res = await fetch(`${api}/search?query=${query}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async profile(): Promise<any> {
        const res = await fetch(`${api}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async updateProfile(data: FormData): Promise<any> {
        const res = await fetch(`${api}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: data,
        });
        return res.json();
    },

    async logout(): Promise<any> {
        const res = await fetch(`${api}/logout`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async forgotPassword(email: string): Promise<any> {
        const res = await fetch(`${api}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        });
        return res.json();
    },

    async resetPassword(payload: {email:string ; code: string; newPassword: string }): Promise<any> {
        const res = await fetch(`${api}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });
        return res.json();
    },
};
