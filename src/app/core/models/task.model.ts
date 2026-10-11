export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface NewTask {
  title: string;
  description?: string | null;
  priority: Priority;
  due_date?: string | null;
}
