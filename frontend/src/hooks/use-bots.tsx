import { CreateBots, DeleteBot, ListBotsbyUser } from "@/api/bots"
import { CreateBotServerTypes } from "@/types/bot-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useBots = () => {
    const queryClient = useQueryClient();
    
    const {data, isLoading, isError} = useQuery({
        queryKey : ['fetch-bots'],
        queryFn : ListBotsbyUser
    });

    const createBotMutation = useMutation({
        mutationFn : (values : CreateBotServerTypes) => CreateBots(values),
        mutationKey : ['create-bot'],
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : ['fetch-bots']
            })
        }
    });

    const deleteBotMutation = useMutation({
        mutationFn : (botId : string) => DeleteBot(botId),
        mutationKey : ['delete-bot'],
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : ['fetch-bots']
            })
        }
    });

    return {
        data,
        isLoading,
        isError,
        createBotMutation,
        deleteBotMutation
    }
}