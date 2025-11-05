import { BASE_URL } from "@/lib/api";

const apiUrl = `${BASE_URL}/reaction`;

function getToken() {
    return localStorage.getItem("facebook_token");
}

export const reactionService = {
    async addReaction(postId: string, type: string): Promise<any> {
        const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ postId, type }),
        });
        return res.json();
    },

    async removeReaction(postId: string): Promise<any> {
        const res = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ postId }),
        });
        return res.json();
    },

    async getReactions(postId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/${postId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        });
        return res.json();
    },
};
