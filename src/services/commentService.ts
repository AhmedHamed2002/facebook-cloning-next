import { BASE_URL } from "@/lib/api";

const apiUrl = `${BASE_URL}/comments`;

function getToken() {
    return localStorage.getItem("facebook_token");
}

export const commentService = {
    async getComments(postId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },

    async addComment(postId: string, text: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
        });
        return res.json();
    },

    async deleteComment(postId: string, commentId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },
};
