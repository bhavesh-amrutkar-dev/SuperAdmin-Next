"use client";

import { useTranslations } from "next-intl";
import { Question } from "@/src/lib/services/question";

interface QuestionsSectionProps {
    questions: Question[];
    questionsLoading: boolean;
    questionsCount: number;
    getRelativeTime: (timestamp: number) => string;
}

export default function QuestionsSection({
    questions,
    questionsLoading,
    questionsCount,
    getRelativeTime,
}: QuestionsSectionProps) {
    const t = useTranslations();

    return (
        <>
            {questionsLoading ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-[#797979]">{t("loading") || "Loading..."}</p>
                </div>
            ) : questions.length > 0 ? (
                <div className="mt-4 space-y-6">
                    {questions.map((item, index) => (
                        <div key={item._id || index} className="border-b border-gray-200 pb-6 last:border-b-0">
                            {/* Question */}
                            <div className="mb-3">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-sm font-bold">
                                        Q
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm md:text-base font-medium text-[#2f2f2f] mb-2">
                                            {item.question}
                                        </p>
                                        <p className="text-xs text-[#797979]">
                                            {t("asked") || "Asked"} {getRelativeTime(item.postedOn)} {t("by") || "by"} {item.userName || t("anonymous") || "Anonymous"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Answer */}
                            <div className="ml-9">
                                {item.answer && item.answer.length > 0 ? (
                                    <div>
                                        <div className="flex gap-3 mb-2">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-[#2f2f2f] flex items-center justify-center text-sm font-bold">
                                                A
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-[#797979] mb-2">
                                                    {item.answer[0].answer}
                                                </p>
                                                <p className="text-xs text-[#797979] mb-2">
                                                    {t("answered") || "Answered"} {getRelativeTime(item.answer[0].postedOn)} {t("by") || "by"} {item.answer[0].userName || t("anonymous") || "Anonymous"}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-[#797979]">
                                                    <span>
                                                        👍 {item.answer[0].upVoteCount || 0}
                                                    </span>
                                                    <span>
                                                        👎 {item.answer[0].downVoteCount || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {item.answer.length > 1 && (
                                            <button className="text-xs text-[#D4AF37] hover:text-[#B8860B] font-medium mt-2">
                                                {t("readMoreAnswers") || "Read more answers"} ({item.answer.length - 1})
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-[#2f2f2f] flex items-center justify-center text-sm font-bold">
                                            A
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-[#797979]">
                                                {t("noAnswerFound") || "No answer found"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-sm text-[#797979]">{t("noQuestionsFound") || "No questions found"}</p>
                </div>
            )}
        </>
    );
}

