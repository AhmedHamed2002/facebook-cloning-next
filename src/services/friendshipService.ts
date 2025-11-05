import { BASE_URL } from "@/lib/api";

const apiUrl = `${BASE_URL}/friend`;

function getToken() {
    return localStorage.getItem("facebook_token");
}

export const friendshipService = {
    async sendFriendRequest(toId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/request`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ toId }),
        });
        return res.json();
    },

    async acceptFriendRequest(fromId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/accept`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ fromId }),
        });
        return res.json();
    },

    async rejectFriendRequest(fromId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ fromId }),
        });
        return res.json();
    },

    async removeFriend(friendId: string): Promise<any> {
        const res = await fetch(`${apiUrl}/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ friendId }),
        });
        return res.json();
    },
};
