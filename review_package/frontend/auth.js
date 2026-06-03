import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: localStorage.getItem("token"),
    }),

    actions: {
        async login(email, password) {
            const formData = new URLSearchParams();

            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post(
                "/auth/login",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                }
            );

            this.token =
                response.data.access_token;

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            await this.fetchUser();
        },

        async fetchUser() {
            try {
                const response =
                    await api.get("/auth/me");

                this.user = response.data;
            } catch {
                this.user = null;
            }
        },

        logout() {
            localStorage.removeItem("token");

            this.token = null;

            this.user = null;
        },
    },
});