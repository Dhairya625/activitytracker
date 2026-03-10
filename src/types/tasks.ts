export type TaskInfo = {
    id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'completed';
    created_at: string;
    updated_at: string;
    task_assignees?: {
        user_id: string;
        profiles: { full_name: string }
    }[];
};

export type MonthlyGoalInfo = {
    id: string;
    goal_text: string;
    month_year: string;
    updated_by: string | null;
    updated_at: string;
};
