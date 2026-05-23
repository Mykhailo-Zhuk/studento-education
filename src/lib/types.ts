export interface Student {
  id: string;
  name: string;
  type: string;
  status: string;
  telegram: string | null;
  group_name: string;
  started: string;
  finished: string | null;
  github_username: string | null;
  exam_project_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface StudentHomeworkRecord {
  id: string;
  student_id: string;
  homework_id: string | null;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  type: string;
  status: string;
  members: string | null;
  started: string;
  finished: string | null;
  schedule_time: string | null;
  journal_url: string | null;
  telegram_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  group_name: string;
  type: string;
  date: string;
  status: string;
  hours: number;
  youtube_url: string | null;
  has_homework: boolean;
  has_feedback: boolean;
  comment: string | null;
  created_at: string;
}

export interface Homework {
  id: string;
  date: string;
  group_name: string;
  type: string;
  status: string;
  title: string;
  notes: string | null;
  created_at: string;
}

export interface StudentToken {
  id: string;
  student_id: string;
  expires_at: string;
  created_at: string;
}

export interface StudentBundle {
  student: Student;
  group: Group | null;
  lessons: Lesson[];
  homework: Homework[];
  studentHomeworkRecords: StudentHomeworkRecord[];
}
