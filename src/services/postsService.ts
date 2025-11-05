import { BASE_URL } from "@/lib/api";

const apiUrl = `${BASE_URL}/post`;

function getToken() {
    return localStorage.getItem("facebook_token");
}

export const postsService = {
    async createPost(data: FormData): Promise<any> {
        const res = await fetch(`${apiUrl}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: data,
        });
        return res.json();
    },

    async editPost(data: FormData): Promise<any> {
        const res = await fetch(`${apiUrl}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: data,
        });
        return res.json();
    },

    async deletePost(postId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getAllPublicPosts(): Promise<any> {
        const res = await fetch(`${apiUrl}/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getFriendsPosts(): Promise<any> {
        const res = await fetch(`${apiUrl}/friends`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getUserPosts(userId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/user/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async getSinglePost(postId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },
};
