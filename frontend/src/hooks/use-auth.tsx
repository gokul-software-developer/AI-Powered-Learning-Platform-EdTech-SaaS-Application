import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetCurrentSession, LoginOauthgoogle, LoginUser, LogoutUser } from "@/api/auth";
import { LoginUserTypes } from "@/types/auth-types";
import axios from "axios";

export const useAuth = () => {
    const queryClient = useQueryClient();

    const fetchUser = useQuery({
        queryKey: ['fetch-user'],
        queryFn: GetCurrentSession,
    });

    const loginMutation = useMutation({
        mutationKey: ['login-user'],
        mutationFn: (values: LoginUserTypes) => LoginUser(values),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey : ['fetch-user']
            });
        }
    });

    const loginwithOauthMutation = useMutation({
        mutationFn : LoginOauthgoogle,
        mutationKey : ['google-auth'],
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : ['fetch-user']
            })
        }
    });

    const logoutMutation = useMutation({
        mutationFn: LogoutUser,
        mutationKey: ['logout-user'],
    });

    return {
        fetchUser,
        loginMutation,
        logoutMutation,
        loginwithOauthMutation
    };
};
