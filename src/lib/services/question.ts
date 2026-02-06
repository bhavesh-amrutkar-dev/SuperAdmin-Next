import { pyApiClient } from "../api/axios";

export type PostQuestionPayload = {
    productId: string;
    question: string;
    raffleId?: string;
};

export type QuestionAnswer = {
    answer: string;
    postedOn: number;
    userName: string;
    upVoteCount?: number;
    downVoteCount?: number;
};

export type Question = {
    question: string;
    postedOn: number;
    userName: string;
    answer?: QuestionAnswer[];
    _id?: string;
};

export type QuestionsResponse = {
    data?: Question[];
    count?: number;
    totalCount?: number;
};

export type GetQuestionsParams = {
    skip: number;
    limit: number;
    parentProductId?: string; // For raffles, this is intentionally sent as an empty string like old project
    trigger: number; // 1 = Most Answers, 2 = Most Recent Questions, 3 = Most Recent Answers, 4 = Oldest Questions
    searchName?: string;
    raffleId?: string;
};

export const QuestionService = {
    postQuestion: (payload: PostQuestionPayload) => {
        // TEMP: Disable real /productQuestion POST call
        // return pyApiClient.post("/productQuestion", payload);
        // Return resolved promise so UI flow continues without hitting backend
        return Promise.resolve({ payload }) as Promise<unknown>;
    },

    getQuestions: (params: GetQuestionsParams) => {
        // TEMP: Disable real /productQuestion GET call
        // const queryParams = new URLSearchParams({
        //     skip: params.skip.toString(),
        //     limit: params.limit.toString(),
        //     trigger: params.trigger.toString(),
        //     // Old system always sends parentProductId (empty string for raffle view)
        //     parentProductId: params.parentProductId ?? "",
        //     searchName: params.searchName ?? "",
        // });
        //
        // if (params.raffleId) {
        //     queryParams.set("raffleId", params.raffleId);
        // }
        //
        // return pyApiClient.get(`/productQuestion?${queryParams.toString()}`);

        const empty: QuestionsResponse = { data: [], count: 0, totalCount: 0 };
        return Promise.resolve(empty);
    },
};

